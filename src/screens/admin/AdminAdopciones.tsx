import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdopciones, actualizarAdopcion, eliminarAdopcion } from '../../services/petService';
import { Adopcion } from '../../types';

const ESTADOS = ['pendiente', 'aprobada', 'rechazada'];
const estadoConfig: Record<string, { color: string; bg: string; icon: string }> = {
  pendiente:  { color: '#e65100', bg: '#fff3e0', icon: '⏳' },
  aprobada:   { color: '#2e7d32', bg: '#e8f5e9', icon: '✅' },
  rechazada:  { color: '#c62828', bg: '#fce4ec', icon: '❌' },
};

export default function AdminAdopciones() {
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

  const fetchAdopciones = useCallback(async () => {
    setLoading(true);
    try { const d = await getAdopciones(); setAdopciones(d); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdopciones(); }, [fetchAdopciones]);

  const filtradas = filtroEstado
    ? adopciones.filter((a) => (a.estado ?? '').toLowerCase() === filtroEstado)
    : adopciones;

  const handleCambiarEstado = (a: Adopcion, nuevoEstado: string) => {
    Alert.alert('Cambiar estado', `¿Cambiar solicitud #${a.id} a "${nuevoEstado}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
        try { await actualizarAdopcion(a.id, nuevoEstado); fetchAdopciones(); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const handleEliminar = (a: Adopcion) => {
    Alert.alert('Eliminar adopción', `¿Eliminar solicitud #${a.id}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await eliminarAdopcion(a.id); fetchAdopciones(); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <View style={styles.container}>
        <Text style={styles.title}>🏠 Adopciones ({filtradas.length})</Text>

        <View style={styles.filtros}>
          <TouchableOpacity style={[styles.filtroBtn, !filtroEstado && styles.filtroBtnActive]}
            onPress={() => setFiltroEstado(null)}>
            <Text style={[styles.filtroBtnText, !filtroEstado && styles.filtroBtnTextActive]}>Todas</Text>
          </TouchableOpacity>
          {ESTADOS.map((e) => (
            <TouchableOpacity key={e} style={[styles.filtroBtn, filtroEstado === e && styles.filtroBtnActive]}
              onPress={() => setFiltroEstado(e === filtroEstado ? null : e)}>
              <Text style={[styles.filtroBtnText, filtroEstado === e && styles.filtroBtnTextActive]}>
                {estadoConfig[e]?.icon} {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? <ActivityIndicator color="#FF8A00" style={{ marginTop: 30 }} /> : (
          <FlatList data={filtradas} keyExtractor={(item) => item.id.toString()}
            refreshing={loading} onRefresh={fetchAdopciones}
            ListEmptyComponent={<Text style={styles.empty}>No hay adopciones en este estado</Text>}
            renderItem={({ item }) => {
              const cfg = estadoConfig[item.estado] ?? { color: '#888', bg: '#f5f5f5', icon: '❓' };
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    {/* id es el campo correcto del backend */}
                    <Text style={styles.cardId}>Solicitud #{item.id}</Text>
                    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.color }}>
                        {cfg.icon} {item.estado}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardInfo}>
                    {/* usuarioId y mascotaId son los campos correctos del backend */}
                    <Text style={styles.infoText}>👤 Usuario #{item.usuarioId}</Text>
                    <Text style={styles.infoText}>🐾 Mascota #{item.mascotaId}</Text>
                    <Text style={styles.infoText}>
                      📅 {new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>

                  {item.estado === 'PENDIENTE' && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
                        onPress={() => handleCambiarEstado(item, 'APROBADA')}>
                        <Text style={[styles.actionBtnText, { color: '#2e7d32' }]}>✅ Aprobar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fce4ec' }]}
                        onPress={() => handleCambiarEstado(item, 'RECHAZADA')}>
                        <Text style={[styles.actionBtnText, { color: '#c62828' }]}>❌ Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleEliminar(item)}>
                    <Text style={styles.deleteBtnText}>🗑️ Eliminar solicitud</Text>
                  </TouchableOpacity>
                </View>
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
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filtroBtnActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  filtroBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
  filtroBtnTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardId: { fontSize: 15, fontWeight: '700', color: '#222' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  cardInfo: { gap: 4, marginBottom: 10 },
  infoText: { fontSize: 13, color: '#555' },
  cardActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  deleteBtn: { paddingVertical: 8, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
  deleteBtnText: { fontSize: 12, color: '#888', fontWeight: '600' },
});
