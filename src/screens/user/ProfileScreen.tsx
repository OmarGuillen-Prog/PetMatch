import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  Alert, StyleSheet, Modal, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getMascotas, getMisAdopciones } from '../../services/petService';
import { Mascota, Adopcion } from '../../types';
import { colors } from '../../styles/shared/colors';

type Tab = 'mascotas' | 'adopciones';

const adopcionColor: Record<string, { bg: string; text: string }> = {
  PENDIENTE: { bg: '#fff3e0', text: '#e65100' },
  APROBADA:  { bg: '#e8f5e9', text: '#2e7d32' },
  RECHAZADA: { bg: '#fce4ec', text: '#c62828' },
  CANCELADA: { bg: '#f5f5f5', text: '#888' },
};

export default function ProfileScreen({ navigation }: any) {
  const { usuario, logout, actualizarPerfil } = useAuth();
  const [tab, setTab] = useState<Tab>('mascotas');
  const [misMascotas, setMisMascotas] = useState<Mascota[]>([]);
  const [misAdopciones, setMisAdopciones] = useState<Adopcion[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!usuario) return;
    setLoadingData(true);
    try {
      const [todas, adopciones] = await Promise.all([
        getMascotas(),
        getMisAdopciones(usuario.id),
      ]);
      setMisMascotas(todas.filter((m) => m.usuarioId === usuario.id));
      setMisAdopciones(adopciones);
    } catch (e) {
      console.error('Error cargando perfil:', e);
    } finally {
      setLoadingData(false);
    }
  }, [usuario]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  const handleGuardar = async () => {
    if (!editNombre.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío.'); return; }
    if (editPassword && editPassword.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres.'); return; }
    setSaving(true);
    try {
      const datos: { nombre?: string; password?: string } = { nombre: editNombre.trim() };
      if (editPassword.trim()) datos.password = editPassword;
      await actualizarPerfil(datos);
      setEditVisible(false);
      Alert.alert('✅ Perfil actualizado');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!usuario) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Tarjeta perfil */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}><Text style={{ fontSize: 44 }}>👤</Text></View>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
          <View style={[styles.rolBadge, { backgroundColor: usuario.rol === 'ADMIN' ? '#fff3e0' : '#e8f5e9' }]}>
            <Text style={[styles.rolText, { color: usuario.rol === 'ADMIN' ? '#e65100' : '#2e7d32' }]}>
              {usuario.rol === 'ADMIN' ? '⚙️ Administrador' : '🐾 Usuario'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setEditNombre(usuario.nombre); setEditPassword(''); setEditVisible(true); }}>
            <Text style={styles.editBtnText}>✏️ Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.solicitudesBtn}
          onPress={() => navigation.navigate('MisSolicitudes')}
        >
          <Text style={styles.solicitudesBtnText}>📋 Ver solicitudes de adopción de mis mascotas</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['mascotas', 'adopciones'] as Tab[]).map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'mascotas' ? `🐾 Mis mascotas (${misMascotas.length})` : `🏠 Solicitudes (${misAdopciones.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingData ? (
          <ActivityIndicator color="#4A90E2" style={{ marginTop: 30 }} />
        ) : tab === 'mascotas' ? (
          misMascotas.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyText}>Aún no tienes mascotas publicadas</Text>
              <TouchableOpacity style={styles.publishBtn} onPress={() => navigation.navigate('Publicar')}>
                <Text style={styles.publishBtnText}>+ Publicar mascota</Text>
              </TouchableOpacity>
            </View>
          ) : (
            misMascotas.map((item) => (
              <TouchableOpacity key={item.id} style={styles.itemCard}
                onPress={() => navigation.navigate('Detail', { mascota: item })}>
                <View style={styles.itemIcon}><Text style={{ fontSize: 22 }}>🐾</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNombre}>{item.nombre}</Text>
                  <Text style={styles.itemSub}>{item.tipo} · {item.edad} años</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: (item.estado ?? '').toLowerCase() === 'disponible' ? '#e8f5e9' : '#fce4ec' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: (item.estado ?? '').toLowerCase() === 'disponible' ? '#2e7d32' : '#c62828' }}>
                    {item.estado}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          misAdopciones.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyText}>No tienes solicitudes de adopción</Text>
            </View>
          ) : (
            misAdopciones.map((item) => {
              const cfg = adopcionColor[item.estado] ?? { bg: '#f5f5f5', text: '#888' };
              return (
                <TouchableOpacity key={item.id} style={styles.itemCard}
                  onPress={() => navigation.navigate('AdopcionDetail', { adopcion: item })}>
                  <View style={styles.itemIcon}><Text style={{ fontSize: 22 }}>🏠</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemNombre}>Solicitud #{item.id}</Text>
                    <Text style={styles.itemSub}>
                      Mascota #{item.mascotaId}
                    </Text>
                  </View>
                  <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.text }}>{item.estado}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal editar */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <TextInput style={styles.fieldInput} value={editNombre} onChangeText={setEditNombre} placeholder="Tu nombre" />
            <Text style={styles.fieldLabel}>Nueva contraseña (opcional)</Text>
            <TextInput style={styles.fieldInput} value={editPassword} onChangeText={setEditPassword}
              placeholder="Dejar vacío para no cambiar" secureTextEntry />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  nombre: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  email: { fontSize: 13, color: '#888', marginTop: 4 },
  rolBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
  rolText: { fontSize: 12, fontWeight: '700' },
  editBtn: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#4A90E2' },
  editBtnText: { color: '#4A90E2', fontWeight: '700', fontSize: 13 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 4, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#4A90E2' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#888' },
  tabTextActive: { color: '#fff' },
  solicitudesBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  solicitudesBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  publishBtn: { marginTop: 14, backgroundColor: '#4A90E2', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  publishBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  itemCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  itemIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f7fa', alignItems: 'center', justifyContent: 'center' },
  itemNombre: { fontSize: 14, fontWeight: '700', color: '#222' },
  itemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  estadoBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  logoutBtn: { marginTop: 24, backgroundColor: '#fce4ec', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#c62828', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6 },
  fieldInput: { backgroundColor: '#f5f7fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 14 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
});
