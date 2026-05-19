import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { crearAdopcion } from '../../services/petService';
import { Mascota } from '../../types';

export default function DetailScreen({ route, navigation }: any) {
  const { mascota }: { mascota: Mascota } = route.params;
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adoptado, setAdoptado] = useState(false);

  const imagenUrl = mascota.imagenes?.[0]?.url ?? '';
  // usuarioId en el backend es el campo correcto
  const esPropio = usuario?.id === mascota.usuarioId;
  const disponible = (mascota.estado ?? '').toLowerCase() === 'disponible';

  const handleAdopcion = async () => {
    if (!usuario) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para adoptar.');
      return;
    }
    Alert.alert(
      'Confirmar adopción',
      `¿Deseas solicitar la adopción de ${mascota.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, solicitar',
          onPress: async () => {
            setLoading(true);
            try {
              await crearAdopcion(usuario.id, mascota.id);
              setAdoptado(true);
              Alert.alert('✅ Solicitud enviada', 'Tu solicitud fue registrada. Pronto te contactarán.');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo enviar la solicitud.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.container}>
          {imagenUrl ? (
            <Image source={{ uri: imagenUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={{ fontSize: 56 }}>🐾</Text>
            </View>
          )}

          <Text style={styles.name}>{mascota.nombre}</Text>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: disponible ? '#e8f5e9' : '#fce4ec' }]}>
              <Text style={[styles.badgeText, { color: disponible ? '#2e7d32' : '#c62828' }]}>
                {disponible ? '● Disponible' : '● No disponible'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#e3f2fd' }]}>
              <Text style={[styles.badgeText, { color: '#1565c0' }]}>{mascota.tipo}</Text>
            </View>
          </View>

          {mascota.edad != null && (
            <Text style={styles.meta}>🎂 {mascota.edad} {mascota.edad === 1 ? 'año' : 'años'}</Text>
          )}

          {!!mascota.descripcion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Descripción</Text>
              <Text style={styles.desc}>{mascota.descripcion}</Text>
            </View>
          )}

          <View style={{ marginTop: 24 }}>
            {esPropio ? (
              <View style={styles.ownBadge}>
                <Text style={styles.ownBadgeText}>📌 Esta es tu publicación</Text>
              </View>
            ) : adoptado ? (
              <View style={[styles.ownBadge, { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' }]}>
                <Text style={[styles.ownBadgeText, { color: '#2e7d32' }]}>✅ Solicitud enviada</Text>
              </View>
            ) : disponible ? (
              <TouchableOpacity
                style={[styles.btn, loading && { opacity: 0.7 }]}
                onPress={handleAdopcion}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>🐾 Solicitar adopción</Text>
                }
              </TouchableOpacity>
            ) : (
              <View style={[styles.btn, { backgroundColor: '#e0e0e0' }]}>
                <Text style={[styles.btnText, { color: '#999' }]}>No disponible para adopción</Text>
              </View>
            )}
          </View>

          {!esPropio && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#4A90E2', marginTop: 10 }]}
              onPress={() => navigation.navigate('Chat', {
                otroUsuarioId: mascota.usuarioId,
                otroUsuarioNombre: 'Encargado',
              })}
            >
              <Text style={styles.btnText}>💬 Contactar encargado</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  image: { width: '100%', height: 260, borderRadius: 16 },
  imagePlaceholder: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginTop: 16 },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  meta: { fontSize: 14, color: '#666', marginTop: 8 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 6 },
  desc: { fontSize: 14, color: '#555', lineHeight: 22 },
  btn: {
    backgroundColor: '#FF8A00', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ownBadge: {
    backgroundColor: '#fff3e0', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF8A00',
  },
  ownBadgeText: { color: '#e65100', fontWeight: '700' },
});
