import api from './api';
import { Mensaje, ChatMessage, ApiResponse } from '../types';

const WS_URL = 'wss://petmatch1-production.up.railway.app/chat';

// ─── REST: historial de mensajes ──────────────────────────────────────────────

function unwrapList(data: any): Mensaje[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.object)) return data.object;
  return [];
}

export const getMensajes = async (): Promise<Mensaje[]> => {
  const res = await api.get('/api/v1/mensajes');
  return unwrapList(res.data);
};

export const getConversacion = async (
  miId: number,
  otroId: number
): Promise<Mensaje[]> => {
  try {
    const todos = await getMensajes();
    return todos
      .filter(
        (m) =>
          (m.emisorId === miId && m.receptorId === otroId) ||
          (m.emisorId === otroId && m.receptorId === miId)
      )
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  } catch {
    return [];
  }
};

export const enviarMensajeREST = async (
  emisorId: number,
  receptorId: number,
  contenido: string
): Promise<Mensaje> => {
  const res = await api.post<ApiResponse<Mensaje>>('/api/v1/mensaje', {
    emisorId,
    receptorId,
    contenido,
  });
  const obj = res.data?.object ?? (res.data as any);
  return obj;
};

// ─── WebSocket STOMP ──────────────────────────────────────────────────────────
// El backend usa Spring WebSocket + STOMP:
//   Endpoint:    wss://petmatch1-production.up.railway.app/chat
//   Suscripción: /topic/messages
//   Envío:       /app/send
//   Payload:     { sender, receiver, content, timestamp? }

export class StompChatClient {
  private ws: WebSocket | null = null;
  private sessionId = '';
  private subscriptionId = 'sub-0';
  private connected = false;
  private shouldReconnect = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private onMessageCb: ((msg: ChatMessage) => void) | null = null;
  private onOpenCb: (() => void) | null = null;
  private onCloseCb: (() => void) | null = null;

  connect(senderName: string) {
    this.shouldReconnect = true;
    this._doConnect(senderName);
  }

  private _doConnect(senderName: string) {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
    }

    // STOMP sobre WebSocket nativo
    this.ws = new WebSocket(WS_URL, ['v10.stomp', 'v11.stomp', 'v12.stomp']);

    this.ws.onopen = () => {
      // Enviar frame CONNECT de STOMP
      this._sendFrame('CONNECT', { 'accept-version': '1.2', 'heart-beat': '0,0' }, '');
    };

    this.ws.onmessage = (event) => {
      const frame = this._parseFrame(event.data);
      if (!frame) return;

      if (frame.command === 'CONNECTED') {
        this.connected = true;
        // Suscribirse al topic
        this._sendFrame('SUBSCRIBE', {
          id: this.subscriptionId,
          destination: '/topic/messages',
        }, '');
        this.onOpenCb?.();
      } else if (frame.command === 'MESSAGE') {
        try {
          const msg: ChatMessage = JSON.parse(frame.body);
          this.onMessageCb?.(msg);
        } catch {
          console.warn('[STOMP] Mensaje no parseable:', frame.body);
        }
      } else if (frame.command === 'ERROR') {
        console.error('[STOMP] Error del servidor:', frame.body);
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.onCloseCb?.();
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this._doConnect(senderName), 5000);
      }
    };

    this.ws.onerror = (e) => {
      console.error('[STOMP] WebSocket error:', e);
    };
  }

  send(sender: string, receiver: string, content: string) {
    if (!this.connected || !this.ws) {
      console.warn('[STOMP] No conectado');
      return;
    }
    const body = JSON.stringify({ sender, receiver, content });
    this._sendFrame('SEND', { destination: '/app/send', 'content-length': String(body.length) }, body);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.connected && this.ws) {
      this._sendFrame('DISCONNECT', {}, '');
    }
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  isConnected() { return this.connected; }
  onMessage(cb: (msg: ChatMessage) => void) { this.onMessageCb = cb; }
  onOpen(cb: () => void) { this.onOpenCb = cb; }
  onClose(cb: () => void) { this.onCloseCb = cb; }

  // ── STOMP frame helpers ──────────────────────────────────────────────────
  private _sendFrame(command: string, headers: Record<string, string>, body: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    let frame = `${command}\n`;
    for (const [k, v] of Object.entries(headers)) {
      frame += `${k}:${v}\n`;
    }
    frame += `\n${body}\0`;
    this.ws.send(frame);
  }

  private _parseFrame(raw: string): { command: string; headers: Record<string, string>; body: string } | null {
    try {
      const lines = raw.split('\n');
      const command = lines[0].trim();
      if (!command) return null;
      const headers: Record<string, string> = {};
      let i = 1;
      while (i < lines.length && lines[i].trim() !== '') {
        const idx = lines[i].indexOf(':');
        if (idx > -1) {
          headers[lines[i].substring(0, idx).trim()] = lines[i].substring(idx + 1).trim();
        }
        i++;
      }
      const body = lines.slice(i + 1).join('\n').replace(/\0$/, '').trim();
      return { command, headers, body };
    } catch {
      return null;
    }
  }
}

export const stompChat = new StompChatClient();
