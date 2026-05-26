import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Adopcion, Mascota } from '../../types';
import { getMascotaById, actualizarAdopcion, actualizarMascota } from '../../services/petService';
import { colors } from '../../styles/shared/colors';

const adopcionColor: Record<string, { bg: string; text: string }> = {
  PENDIENTE: { bg: '#fff3e0', text: '#e65100' },
  APROBADA:  { bg: '#e8f5e9', text: '#2e7d32' },
  RECHAZADA: { bg: '#fce4ec', text: '#c62828' },
  CANCELADA: { bg: '#f5f5f5', text: '#888' },
};

export default function AdopcionDetailScreen({ route, navigation }: any) {
  const { usuario } = useAuth();
  const { adopcion } = route.params as { adopcion: Adopcion };
  const cfg = adopcionColor[adopcion.estado] ?? { bg: '#f5f5f5', text: '#888' };
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarMascota = async () => {
      try {
        const m = await getMascotaById(adopcion.mascotaId);
        setMascota(m);
      } catch (e) {
        console.error('Error cargando mascota:', e);
      } finally {
        setLoading(false);
      }
    };
    cargarMascota();
  }, [adopcion.mascotaId]);

  const esDueño = mascota && usuario && mascota.usuarioId === usuario.id;

  const handleAprobar = async () => {
    Alert.alert(
      'Aprobar solicitud',
      '¿Estás seguro de que deseas aprobar esta solicitud? La mascota será marcada como adoptada.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, aprobar',
          onPress: async () => {
            setProcesando(true);
            try {
              await actualizarAdopcion(adopcion.id, 'APROBADA', adopcion.usuarioId);
              if (mascota) {
                await actualizarMascota(mascota.id, { estado: 'adoptada' });
              }
              Alert.alert('✅ Solicitud aprobada', 'La mascota ha sido marcada como adoptada.');
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo aprobar la solicitud');
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  const handleRechazar = async () => {
    Alert.alert(
      'Rechazar solicitud',
      '¿Estás seguro de que deseas rechazar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, rechazar',
          style: 'destructive',
          onPress: async () => {
            setProcesando(true);
            try {
              await actualizarAdopcion(adopcion.id, 'RECHAZADA', adopcion.usuarioId);
              Alert.alert('✅ Solicitud rechazada');
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo rechazar la solicitud');
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Solicitud de Adopción</Text>
          <Text style={styles.id}>#{adopcion.id}</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Estado</Text>
            <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.badgeText, { color: cfg.text }]}>{adopcion.estado}</Text>
            </View>
          </View>

          {esDueño && adopcion.estado === 'PENDIENTE' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={handleRechazar}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Rechazar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={handleAprobar}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Aprobar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>ID de Mascota</Text>
            <Text style={styles.value}>#{adopcion.mascotaId}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#4A90E2" style={{ marginTop: 20 }} />
        ) : mascota ? (
          <View style={styles.card}>
            <Text style={styles.subtitle}>Detalles de la Mascota</Text>
            
            <View style={styles.section}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{mascota.nombre}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Tipo</Text>
              <Text style={styles.value}>{mascota.tipo}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Edad</Text>
              <Text style={styles.value}>{mascota.edad} años</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Estado</Text>
              <Text style={styles.value}>{mascota.estado}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Descripción</Text>
              <Text style={styles.value}>{mascota.descripcion || 'Sin descripción'}</Text>
            </View>

            <TouchableOpacity
              style={styles.viewPetBtn}
              onPress={() => navigation.navigate('Detail', { mascota })}
            >
              <Text style={styles.viewPetBtnText}>Ver perfil completo de la mascota</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.errorText}>No se pudo cargar la información de la mascota</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  id: { fontSize: 14, color: '#888', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 6 },
  value: { fontSize: 15, color: '#222' },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  viewPetBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewPetBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  errorText: { fontSize: 14, color: '#e57373', textAlign: 'center' },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  approveBtn: { backgroundColor: colors.secondary },
  rejectBtn: { backgroundColor: '#e57373' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  backBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
