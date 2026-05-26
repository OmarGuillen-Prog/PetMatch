import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getAdopciones, getMascotaById } from '../../services/petService';
import { Adopcion } from '../../types';
import { colors } from '../../styles/shared/colors';

export default function MisSolicitudesScreen({ navigation }: any) {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Adopcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        const todas = await getAdopciones();
        const misMascotasIds = new Set<number>();
        
        for (const sol of todas) {
          try {
            const mascota = await getMascotaById(sol.mascotaId);
            if (mascota.usuarioId === usuario?.id) {
              misMascotasIds.add(sol.mascotaId);
            }
          } catch {}
        }
        
        const filtradas = todas.filter(sol => misMascotasIds.has(sol.mascotaId));
        setSolicitudes(filtradas);
      } catch (e) {
        console.error('Error cargando solicitudes:', e);
      } finally {
        setLoading(false);
      }
    };
    cargarSolicitudes();
  }, [usuario?.id]);

  const adopcionColor: Record<string, { bg: string; text: string }> = {
    PENDIENTE: { bg: '#fff3e0', text: '#e65100' },
    APROBADA:  { bg: '#e8f5e9', text: '#2e7d32' },
    RECHAZADA: { bg: '#fce4ec', text: '#c62828' },
    CANCELADA: { bg: '#f5f5f5', text: '#888' },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Text style={styles.header}>Solicitudes de mis mascotas</Text>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : solicitudes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.empty}>No tienes solicitudes pendientes</Text>
          </View>
        ) : (
          <FlatList
            data={solicitudes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const cfg = adopcionColor[item.estado] ?? { bg: '#f5f5f5', text: '#888' };
              return (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => navigation.navigate('AdopcionDetail', { adopcion: item })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>Solicitud #{item.id}</Text>
                    <Text style={styles.itemSub}>Mascota #{item.mascotaId}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.text }]}>{item.estado}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  empty: { fontSize: 16, color: '#999' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  itemSub: { fontSize: 14, color: '#666', marginTop: 2 },
  itemDate: { fontSize: 12, color: '#999', marginTop: 4 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
