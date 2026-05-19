import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, TextInput, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMascotas, eliminarMascota, actualizarMascota, crearImagen } from '../../services/petService';
import { Mascota } from '../../types';

const estadoColor = (e: string) => {
  const lower = (e ?? '').toLowerCase();
  if (lower === 'disponible') return { bg: '#e8f5e9', text: '#2e7d32' };
  if (lower === 'adoptado' || lower === 'adoptada') return { bg: '#e3f2fd', text: '#1565c0' };
  return { bg: '#fce4ec', text: '#c62828' };
};

export default function AdminMascotas() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [filtradas, setFiltradas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<Mascota | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editEdad, setEditEdad] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDisponible, setEditDisponible] = useState(true);
  const [editUrl, setEditUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMascotas = useCallback(async () => {
    setLoading(true);
    try { const d = await getMascotas(); setMascotas(d); setFiltradas(d); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMascotas(); }, [fetchMascotas]);

  useEffect(() => {
    if (!busqueda.trim()) { setFiltradas(mascotas); return; }
    const q = busqueda.toLowerCase();
    setFiltradas(mascotas.filter((m) =>
      m.nombre.toLowerCase().includes(q) || m.tipo.toLowerCase().includes(q) || m.estado.toLowerCase().includes(q)
    ));
  }, [busqueda, mascotas]);

  const handleEliminar = (m: Mascota) => {
    Alert.alert('Eliminar mascota', `¿Eliminar a ${m.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await eliminarMascota(m.id); fetchMascotas(); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const abrirEditar = (m: Mascota) => {
    setEditando(m); setEditNombre(m.nombre); setEditTipo(m.tipo);
    setEditEdad(String(m.edad)); setEditDesc(m.descripcion ?? '');
    setEditDisponible((m.estado ?? '').toLowerCase() === 'disponible');
    setEditUrl(m.imagenes?.[0]?.url ?? '');
  };

  const handleGuardar = async () => {
    if (!editando || !editNombre.trim()) { Alert.alert('Error', 'El nombre es requerido.'); return; }
    setSaving(true);
    try {
      await actualizarMascota(editando.id, {
        nombre: editNombre.trim(), tipo: editTipo.trim(),
        edad: parseInt(editEdad, 10) || editando.edad,
        descripcion: editDesc.trim(),
        estado: editDisponible ? 'Disponible' : 'No disponible',
      });
      if (editUrl.trim() && editUrl !== editando.imagenes?.[0]?.url) {
        try { await crearImagen(editando.id, editUrl.trim()); } catch { /* no bloquear */ }
      }
      setEditando(null); fetchMascotas(); Alert.alert('✅ Mascota actualizada');
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      <View style={styles.container}>
        <Text style={styles.title}>🐾 Mascotas ({filtradas.length})</Text>
        <TextInput style={styles.search} placeholder="Buscar..." value={busqueda} onChangeText={setBusqueda} />

        {loading ? <ActivityIndicator color="#4CAF50" style={{ marginTop: 30 }} /> : (
          <FlatList data={filtradas} keyExtractor={(item) => item.id.toString()}
            refreshing={loading} onRefresh={fetchMascotas}
            ListEmptyComponent={<Text style={styles.empty}>No se encontraron mascotas</Text>}
            renderItem={({ item }) => {
              const c = estadoColor(item.estado);
              return (
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nombre}>{item.nombre}</Text>
                      {/* id es el campo correcto del backend */}
                      <Text style={styles.tipo}>{item.tipo} · {item.edad} años · #{item.id}</Text>
                      {!!item.descripcion && <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>}
                    </View>
                    <View style={[styles.badge, { backgroundColor: c.bg }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: c.text }}>{item.estado}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]} onPress={() => abrirEditar(item)}>
                      <Text style={[styles.actionBtnText, { color: '#1565c0' }]}>✏️ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fce4ec' }]} onPress={() => handleEliminar(item)}>
                      <Text style={[styles.actionBtnText, { color: '#c62828' }]}>🗑️ Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      <Modal visible={!!editando} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Editar mascota</Text>
            <Text style={styles.fieldLabel}>Nombre *</Text>
            <TextInput style={styles.fieldInput} value={editNombre} onChangeText={setEditNombre} />
            <Text style={styles.fieldLabel}>Tipo / Especie</Text>
            <TextInput style={styles.fieldInput} value={editTipo} onChangeText={setEditTipo} />
            <Text style={styles.fieldLabel}>Edad (años)</Text>
            <TextInput style={styles.fieldInput} value={editEdad} onChangeText={setEditEdad} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Descripción</Text>
            <TextInput style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]} value={editDesc} onChangeText={setEditDesc} multiline />
            <Text style={styles.fieldLabel}>URL de imagen</Text>
            <TextInput style={styles.fieldInput} value={editUrl} onChangeText={setEditUrl} placeholder="https://..." autoCapitalize="none" />
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Disponible para adopción</Text>
              <Switch value={editDisponible} onValueChange={setEditDisponible}
                trackColor={{ false: '#ddd', true: '#a8d5a2' }} thumbColor={editDisponible ? '#4CAF50' : '#bbb'} />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditando(null)}>
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  search: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#ddd' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTop: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  nombre: { fontSize: 16, fontWeight: '700', color: '#222' },
  tipo: { fontSize: 12, color: '#888', marginTop: 2 },
  desc: { fontSize: 12, color: '#aaa', marginTop: 4 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6 },
  fieldInput: { backgroundColor: '#f5f7fa', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#4CAF50', alignItems: 'center' },
});
