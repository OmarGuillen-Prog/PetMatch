import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { stompChat, getConversacion, enviarMensajeREST } from '../../services/mensajeService';
import { ChatMessage, Mensaje } from '../../types';
import { colors } from '../../styles/shared/colors';

// Mensaje unificado para la UI
interface MsgUI {
  key: string;
  contenido: string;
  esMio: boolean;
  hora: string;
}

function toUI(m: Mensaje, miId: number): MsgUI {
  const fecha = new Date(Date.now());
  return {
    key: String(m.id),
    contenido: m.contenido,
    esMio: m.emisorId === miId,
    hora: fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function ChatScreen({ route }: any) {
  const { usuario } = useAuth();
  const otroUsuarioId: number = route?.params?.otroUsuarioId ?? 0;
  const otroUsuarioNombre: string = route?.params?.otroUsuarioNombre ?? 'Chat';
  console.log('ChatScreen params:', { otroUsuarioId, otroUsuarioNombre });

  const [mensajes, setMensajes] = useState<MsgUI[]>([]);
  const [texto, setTexto] = useState('');
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [reconectando, setReconectando] = useState(false);
  const [errorWs, setErrorWs] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const cargarHistorial = useCallback(async () => {
    if (!usuario || !otroUsuarioId) { setCargando(false); return; }
    try {
      const hist = await getConversacion(usuario.id, otroUsuarioId);
      setMensajes(hist.map((m) => toUI(m, usuario.id)));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { /* silencioso */ }
    finally { setCargando(false); }
  }, [usuario, otroUsuarioId]);

  useEffect(() => {
    if (!usuario) return;
    cargarHistorial();

    // Conectar STOMP con el nombre del usuario como sender
    stompChat.connect(usuario.nombre);
    stompChat.onOpen(() => {
      console.log('[ChatScreen] onOpen ejecutado - conectado');
      setConectado(true);
      setReconectando(false);
      setErrorWs(null);
    });
    stompChat.onClose(() => {
      setConectado(false);
      setReconectando(true);
      setErrorWs('Conexión perdida. Reconectando...');
    });

    stompChat.onMessage((msg: ChatMessage) => {
      // Filtrar: solo mostrar mensajes entre usuario actual y otro usuario
      const esMio = msg.sender === usuario.nombre;
      const esDelOtro = msg.sender === otroUsuarioNombre;
      const esParaMi = msg.receiver === usuario.nombre;
      const esDelOtroParaMi = msg.receiver === otroUsuarioNombre;

      // Solo aceptar mensajes donde yo soy sender o receiver, y el otro es el counterpart
      if (!esMio && !esParaMi) return;
      if (esMio && msg.receiver !== otroUsuarioNombre) return;
      if (esParaMi && msg.sender !== otroUsuarioNombre) return;

      const fecha = new Date(Date.now());
      const ui: MsgUI = {
        key: `ws-${Date.now()}-${Math.random()}`,
        contenido: msg.content,
        esMio,
        hora: fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMensajes((prev) => [...prev, ui]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => { stompChat.disconnect(); };
  }, [usuario, otroUsuarioId, cargarHistorial]);

  useEffect(() => {
    if (!cargando && mensajes.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    }
  }, [cargando]);

  // Polling REST para refrescar mensajes cada 3 segundos
  useEffect(() => {
    if (!usuario || !otroUsuarioId) return;
    const interval = setInterval(async () => {
      try {
        const hist = await getConversacion(usuario.id, otroUsuarioId);
        setMensajes(hist.map((m) => toUI(m, usuario.id)));
      } catch { /* silencioso */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [usuario, otroUsuarioId]);

  const enviar = async () => {
    if (!texto.trim() || !usuario || enviando) return;
    const contenido = texto.trim();
    setTexto('');
    setEnviando(true);

    // Optimista
    const fecha = new Date(Date.now());
    const optimista: MsgUI = {
      key: `opt-${Date.now()}`,
      contenido,
      esMio: true,
      hora: fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMensajes((prev) => [...prev, optimista]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // STOMP (tiempo real) — usa nombres como sender/receiver (backend espera nombres)
      stompChat.send(usuario.nombre, otroUsuarioNombre, contenido);
      // REST (persistencia) — usa IDs numéricos
      await enviarMensajeREST(usuario.id, otroUsuarioId, contenido);
    } catch (e) {
      console.warn('[Chat] Error enviando:', e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{otroUsuarioNombre}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: conectado ? '#4CAF50' : '#bbb' }]} />
              <Text style={[styles.statusText, { color: conectado ? '#4CAF50' : '#bbb' }]}>
                {reconectando ? 'Reconectando...' : conectado ? 'En línea' : 'Desconectado'}
              </Text>
            </View>
            {errorWs && (
              <Text style={styles.errorText}>{errorWs}</Text>
            )}
          </View>
        </View>

        {/* Mensajes */}
        {cargando ? (
          <View style={styles.center}>
            <ActivityIndicator color="#4A90E2" />
            <Text style={styles.cargandoText}>Cargando mensajes...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item) => item.key}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 14 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>💬</Text>
                <Text style={styles.emptyText}>No hay mensajes aún. ¡Saluda!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.esMio ? styles.bubbleMio : styles.bubbleOtro]}>
                <Text style={[styles.bubbleText, item.esMio && { color: '#fff' }]}>
                  {item.contenido}
                </Text>
              </View>
            )}
          />
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#bbb"
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviar}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!texto.trim() || enviando) && styles.sendBtnOff]}
            onPress={enviar}
            disabled={!texto.trim() || enviando}
          >
            {enviando
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.sendIcon}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center',
  },
  headerName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  errorText: { fontSize: 10, color: '#e57373', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  cargandoText: { color: '#aaa', marginTop: 10, fontSize: 13 },
  emptyText: { fontSize: 14, color: '#aaa' },
  bubble: {
    maxWidth: '78%', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8,
  },
  bubbleMio: {
    backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4,
  },
  bubbleOtro: {
    backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#eee',
  },
  bubbleText: { fontSize: 14, color: '#222', lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1, backgroundColor: '#f5f7fa', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#222',
    maxHeight: 100, borderWidth: 1, borderColor: '#eee',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnOff: { backgroundColor: '#c5d8f0' },
  sendIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
