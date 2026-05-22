import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getMensajes } from '../../services/mensajeService';
import { getUsuarios } from '../../services/usuarioService';
import { Mensaje } from '../../types';

type Conversacion = {
  otroUsuarioId: number;
  otroUsuarioNombre: string;
  ultimoMensaje: string;
  fecha: string;
};

export default function ChatsListScreen({ navigation }: any) {
  const { usuario } = useAuth();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarConversaciones();
  }, [usuario]);

  const cargarConversaciones = async () => {
    if (!usuario) return;
    try {
      const [todos, usuarios] = await Promise.all([getMensajes(), getUsuarios()]);
      const mapaUsuarios = new Map(usuarios.map((u) => [u.id, u.nombre]));
      const mapa = new Map<number, Conversacion>();

      todos.forEach((msg) => {
        const esMio = msg.emisorId === usuario.id;
        const otroId = esMio ? msg.receptorId : msg.emisorId;
        const otroNombre = mapaUsuarios.get(otroId) || `Usuario ${otroId}`;

        if (!mapa.has(otroId)) {
          mapa.set(otroId, {
            otroUsuarioId: otroId,
            otroUsuarioNombre: otroNombre,
            ultimoMensaje: msg.contenido,
            fecha: msg.fecha,
          });
        } else {
          const existente = mapa.get(otroId)!;
          if (new Date(msg.fecha) > new Date(existente.fecha)) {
            mapa.set(otroId, {
              ...existente,
              ultimoMensaje: msg.contenido,
              fecha: msg.fecha,
            });
          }
        }
      });

      setConversaciones(Array.from(mapa.values()).sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ));
    } catch (e) {
      console.error('Error cargando conversaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  const abrirChat = (otroUsuarioId: number, otroUsuarioNombre: string) => {
    console.log('Abriendo chat con:', otroUsuarioId, otroUsuarioNombre);
    try {
      navigation.getParent()?.navigate('Chat', { otroUsuarioId, otroUsuarioNombre });
    } catch (e) {
      console.error('Error navegando:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Chats</Text>
      {conversaciones.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No tienes conversaciones</Text>
        </View>
      ) : (
        <FlatList
          data={conversaciones}
          keyExtractor={(item) => String(item.otroUsuarioId)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => abrirChat(item.otroUsuarioId, item.otroUsuarioNombre)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.otroUsuarioNombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.nombre}>{item.otroUsuarioNombre}</Text>
                <Text style={styles.mensaje} numberOfLines={1}>{item.ultimoMensaje}</Text>
              </View>
              <Text style={styles.fecha}>
                {new Date(item.fecha).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 20 },
  empty: { fontSize: 16, color: '#999' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  mensaje: { fontSize: 14, color: '#666' },
  fecha: { fontSize: 12, color: '#999', marginLeft: 8 },
});
