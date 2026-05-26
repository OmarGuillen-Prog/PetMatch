import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUsuarios, eliminarUsuario, actualizarUsuario } from '../../services/usuarioService';
import { register } from '../../services/authService';
import { Usuario } from '../../types';

type ModalMode = 'editar' | 'crear' | null;

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtrados, setFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRol, setEditRol] = useState<'USER' | 'ADMIN'>('USER');
  const [saving, setSaving] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data); setFiltrados(data);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  useEffect(() => {
    if (!busqueda.trim()) { setFiltrados(usuarios); return; }
    const q = busqueda.toLowerCase();
    setFiltrados(usuarios.filter((u) =>
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    ));
  }, [busqueda, usuarios]);

  const handleEliminar = (u: Usuario) => {
    Alert.alert('Eliminar usuario', `¿Eliminar a ${u.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await eliminarUsuario(u.id); fetchUsuarios(); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const abrirEditar = (u: Usuario) => {
    setUsuarioActual(u); setEditNombre(u.nombre); setEditEmail(u.email);
    setEditPassword(''); setEditRol(u.rol); setModalMode('editar');
  };

  const abrirCrear = () => {
    setUsuarioActual(null); setEditNombre(''); setEditEmail('');
    setEditPassword(''); setEditRol('USER'); setModalMode('crear');
  };

  const handleGuardar = async () => {
    if (!editNombre.trim() || !editEmail.trim()) { Alert.alert('Error', 'Nombre y email son requeridos.'); return; }
    setSaving(true);
    try {
      if (modalMode === 'crear') {
        if (!editPassword.trim() || editPassword.length < 6) {
          Alert.alert('Error', 'Contraseña mínimo 6 caracteres.'); setSaving(false); return;
        }
        await register(editNombre.trim(), editEmail.trim(), editPassword);
        if (editRol === 'ADMIN') {
          const todos = await getUsuarios();
          const nuevo = todos.find((u) => u.email === editEmail.trim());
          if (nuevo) await actualizarUsuario(nuevo.id, { rol: 'ADMIN' });
        }
      } else if (modalMode === 'editar' && usuarioActual) {
        // El backend usa: nombre, email, password, rol
        const datos: Partial<Usuario> = { nombre: editNombre.trim(), rol: editRol };
        if (editPassword.trim()) (datos as any).password = editPassword;
        await actualizarUsuario(usuarioActual.id, datos);
      }
      setModalMode(null); fetchUsuarios();
      Alert.alert('✅', modalMode === 'crear' ? 'Usuario creado' : 'Usuario actualizado');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>👥 Usuarios ({filtrados.length})</Text>
          <TouchableOpacity style={styles.crearBtn} onPress={abrirCrear}>
            <Text style={styles.crearBtnText}>+ Nuevo</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.search} placeholder="Buscar por nombre, email o rol..."
          value={busqueda} onChangeText={setBusqueda} />

        {loading ? <ActivityIndicator color="#4A90E2" style={{ marginTop: 30 }} /> : (
          <FlatList data={filtrados} keyExtractor={(item) => item.id.toString()}
            refreshing={loading} onRefresh={fetchUsuarios}
            ListEmptyComponent={<Text style={styles.empty}>No se encontraron usuarios</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 20 }}>{item.rol === 'ADMIN' ? '⚙️' : '👤'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nombre}>{item.nombre}</Text>
                    {/* email es el campo correcto del backend */}
                    <Text style={styles.correo}>{item.email}</Text>
                    <View style={[styles.rolBadge, { backgroundColor: item.rol === 'ADMIN' ? '#fff3e0' : '#e8f5e9' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: item.rol === 'ADMIN' ? '#e65100' : '#2e7d32' }}>
                        {item.rol}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => abrirEditar(item)}>
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleEliminar(item)}>
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <Modal visible={!!modalMode} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{modalMode === 'crear' ? '➕ Nuevo usuario' : '✏️ Editar usuario'}</Text>

            <Text style={styles.fieldLabel}>Nombre *</Text>
            <TextInput style={styles.fieldInput} value={editNombre} onChangeText={setEditNombre} placeholder="Nombre completo" />

            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput style={[styles.fieldInput, modalMode === 'editar' && { color: '#aaa' }]}
              value={editEmail} onChangeText={setEditEmail} placeholder="correo@ejemplo.com"
              keyboardType="email-address" autoCapitalize="none" editable={modalMode === 'crear'} />

            <Text style={styles.fieldLabel}>{modalMode === 'crear' ? 'Contraseña *' : 'Nueva contraseña (opcional)'}</Text>
            <TextInput style={styles.fieldInput} value={editPassword} onChangeText={setEditPassword}
              placeholder={modalMode === 'crear' ? 'Mín. 6 caracteres' : 'Dejar vacío para no cambiar'} secureTextEntry />

            <Text style={styles.fieldLabel}>Rol</Text>
            <View style={styles.rolRow}>
              {(['USER', 'ADMIN'] as const).map((r) => (
                <TouchableOpacity key={r} style={[styles.rolOption, editRol === r && styles.rolOptionActive]}
                  onPress={() => setEditRol(r)}>
                  <Text style={[styles.rolOptionText, editRol === r && styles.rolOptionTextActive]}>
                    {r === 'ADMIN' ? '⚙️ ADMIN' : '🐾 USER'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalMode(null)}>
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardar} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{modalMode === 'crear' ? 'Crear' : 'Guardar'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  crearBtn: { backgroundColor: '#4A90E2', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  crearBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  search: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#ddd' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
  nombre: { fontSize: 15, fontWeight: '700', color: '#222' },
  correo: { fontSize: 12, color: '#888', marginTop: 1 },
  rolBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fce4ec', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6 },
  fieldInput: { backgroundColor: '#f5f7fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 14 },
  rolRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  rolOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#ddd', alignItems: 'center' },
  rolOptionActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  rolOptionText: { fontWeight: '700', color: '#666' },
  rolOptionTextActive: { color: '#fff' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
});
