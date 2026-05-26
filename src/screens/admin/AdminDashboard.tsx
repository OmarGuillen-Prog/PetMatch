import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getMascotas, getAdopciones } from '../../services/petService';
import { getUsuarios } from '../../services/usuarioService';
import { Mascota, Adopcion, Usuario } from '../../types';

const adopcionColor: Record<string, string> = {
  PENDIENTE: '#e65100', APROBADA: '#2e7d32', RECHAZADA: '#c62828',
};

export default function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodo = useCallback(async () => {
    try {
      const [m, u, a] = await Promise.all([getMascotas(), getUsuarios(), getAdopciones()]);
      setMascotas(m); setUsuarios(u); setAdopciones(a);
    } catch (e) { console.error('Dashboard error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchTodo(); }, [fetchTodo]);

  const disponibles = mascotas.filter((m) => (m.estado ?? '').toLowerCase() === 'disponible').length;
  const pendientes = adopciones.filter((a) => (a.estado ?? '').toLowerCase() === 'pendiente').length;
  const aprobadas = adopciones.filter((a) => (a.estado ?? '').toLowerCase() === 'aprobada').length;

  const stats = [
    { label: 'Usuarios', value: usuarios.length, icon: '👥', color: '#4A90E2' },
    { label: 'Mascotas', value: mascotas.length, icon: '🐾', color: '#4CAF50' },
    { label: 'Disponibles', value: disponibles, icon: '✅', color: '#26a69a' },
    { label: 'Adopciones', value: adopciones.length, icon: '🏠', color: '#FF8A00' },
    { label: 'Pendientes', value: pendientes, icon: '⏳', color: '#e57373' },
    { label: 'Aprobadas', value: aprobadas, icon: '🎉', color: '#7c4dff' },
  ];

  const recientes = [...adopciones]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <ScrollView contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTodo(); }} />}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {usuario?.nombre} 👋</Text>
            <Text style={styles.role}>⚙️ Panel de Administrador</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color="#4A90E2" style={{ marginTop: 40 }} /> : (
          <>
            <Text style={styles.sectionTitle}>Resumen general</Text>
            <View style={styles.statsGrid}>
              {stats.map((s) => (
                <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {recientes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Solicitudes recientes</Text>
                {recientes.map((a) => {
                  const color = adopcionColor[a.estado] ?? '#888';
                  return (
                    <View key={a.id} style={styles.recentCard}>
                      <View style={{ flex: 1 }}>
                        {/* id es el campo correcto del backend */}
                        <Text style={styles.recentId}>Solicitud #{a.id}</Text>
                        <Text style={styles.recentSub}>Usuario #{a.usuarioId} · Mascota #{a.mascotaId}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color }}>{a.estado}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📌 Acceso rápido</Text>
              <Text style={styles.infoText}>Usa las pestañas de abajo para gestionar usuarios, mascotas y adopciones.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  role: { fontSize: 13, color: '#888', marginTop: 2 },
  logoutBtn: { backgroundColor: '#fce4ec', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText: { color: '#c62828', fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '47%', borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2, fontWeight: '600' },
  recentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  recentId: { fontSize: 14, fontWeight: '700', color: '#222' },
  recentSub: { fontSize: 12, color: '#888', marginTop: 2 },
  recentDate: { fontSize: 11, color: '#bbb', marginTop: 2 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  infoCard: { backgroundColor: '#e3f2fd', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#4A90E2', marginTop: 8 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1565c0', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#1976d2', lineHeight: 20 },
});
