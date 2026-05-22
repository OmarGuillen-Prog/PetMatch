import api from './api';
import { Mensaje, ChatMessage, ApiResponse } from '../types';
import { Client } from '@stomp/stompjs';

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

// ─── WebSocket STOMP con @stomp/stompjs ─────────────────────────────────────
// El backend usa Spring WebSocket + STOMP:
//   Endpoint:    wss://petmatch1-production.up.railway.app/chat
//   Suscripción: /topic/messages
//   Envío:       /app/send
//   Payload:     { sender, receiver, content, timestamp? }

export class StompChatClient {
  private stompClient: Client | null = null;
  private connected = false;
  private onMessageCb: ((msg: ChatMessage) => void) | null = null;
  private onOpenCb: (() => void) | null = null;
  private onCloseCb: (() => void) | null = null;
  private subscription: any = null;

  connect(senderName: string) {
    if (this.stompClient) {
      this.disconnect();
    }

    this.stompClient = new Client({
      webSocketFactory: () => new WebSocket('wss://petmatch1-production.up.railway.app/chat'),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('[STOMP] Conectado como:', senderName);
        this.connected = true;
        this.onOpenCb?.();
        this.subscription = this.stompClient!.subscribe('/topic/messages', (message) => {
          console.log('[STOMP] Mensaje recibido:', message.body);
          const body = JSON.parse(message.body);
          this.onMessageCb?.(body);
        });
      },
      onStompError: (frame) => {
        console.error('[STOMP] Error:', frame);
      },
      onWebSocketClose: () => {
        console.log('[STOMP] WebSocket cerrado');
        this.connected = false;
        this.onCloseCb?.();
      },
      onWebSocketError: (error) => {
        console.error('[STOMP] WebSocket error:', error);
      },
    });

    this.stompClient.activate();
  }

  send(sender: string, receiver: string, content: string) {
    if (!this.connected || !this.stompClient) {
      console.warn('[STOMP] No conectado');
      return;
    }
    const payload = { sender, receiver, content };
    console.log('[STOMP] Enviando mensaje:', payload);
    this.stompClient.publish({
      destination: '/app/send',
      body: JSON.stringify(payload),
    });
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.connected = false;
  }

  isConnected() { return this.connected; }
  onMessage(cb: (msg: ChatMessage) => void) { this.onMessageCb = cb; }
  onOpen(cb: () => void) { this.onOpenCb = cb; }
  onClose(cb: () => void) { this.onCloseCb = cb; }
}

export const stompChat = new StompChatClient();
