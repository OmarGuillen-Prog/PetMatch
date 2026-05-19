import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Modal, Alert, ActivityIndicator,
  Platform, KeyboardAvoidingView, Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { crearMascota, crearImagen } from '../../services/petService';

const GREEN = '#4CAF50', GREEN_DARK = '#2e7d32', GREEN_LIGHT = '#e8f5e9';
type EspecieType = 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Hámster' | 'Otro';
const ESPECIES: EspecieType[] = ['Perro', 'Gato', 'Conejo', 'Ave', 'Hámster', 'Otro'];

export default function PublicarScreen({ navigation }: any) {
  const { usuario } = useAuth();
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [especie, setEspecie] = useState<EspecieType>('Perro');
  const [descripcion, setDescripcion] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [urlImagen, setUrlImagen] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handlePublicar = async () => {
    if (!nombre.trim()) { Alert.alert('Campo requerido', 'Ingresa el nombre.'); return; }
    if (!edad.trim() || isNaN(Number(edad)) || Number(edad) < 0) {
      Alert.alert('Campo requerido', 'Ingresa una edad válida.'); return;
    }
    if (!usuario) { Alert.alert('Error', 'Debes iniciar sesión.'); return; }

    setLoading(true);
    try {
      // usuarioId es el campo que espera el backend
      const nueva = await crearMascota({
        nombre: nombre.trim(),
        tipo: especie,
        edad: parseInt(edad, 10),
        descripcion: descripcion.trim(),
        estado: disponible ? 'Disponible' : 'No disponible',
        usuarioId: usuario.id,
      });

      if (urlImagen.trim() && nueva?.id) {
        try { await crearImagen(nueva.id, urlImagen.trim()); } catch { /* no bloquear */ }
      }

      Alert.alert('🎉 ¡Publicado!', `${nombre} ya está visible en la app.`, [
        { text: '¡Genial!', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error al publicar', e.message || 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f5f7fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar mascota</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.label}>URL de imagen (opcional)</Text>
        <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#bbb"
          value={urlImagen} onChangeText={setUrlImagen} autoCapitalize="none" keyboardType="url" />
        {urlImagen.trim() ? (
          <Image source={{ uri: urlImagen.trim() }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 36 }}>📷</Text>
            <Text style={styles.imagePlaceholderText}>Vista previa</Text>
          </View>
        )}

        <Text style={styles.label}>Nombre *</Text>
        <TextInput style={styles.input} placeholder="Ej. Luna, Max…" placeholderTextColor="#bbb"
          value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Edad (años) *</Text>
        <TextInput style={styles.input} placeholder="Ej. 2" placeholderTextColor="#bbb"
          keyboardType="numeric" value={edad} onChangeText={setEdad} />

        <Text style={styles.label}>Especie *</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setPickerVisible(true)}>
          <Text style={styles.pickerText}>{especie}</Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, styles.textArea]}
          placeholder="Cuéntanos sobre la mascota…" placeholderTextColor="#bbb"
          multiline numberOfLines={4} value={descripcion} onChangeText={setDescripcion} />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Estado de adopción</Text>
            <Text style={styles.switchSub}>{disponible ? '✅ Disponible' : '🔒 No disponible'}</Text>
          </View>
          <Switch value={disponible} onValueChange={setDisponible}
            trackColor={{ false: '#ddd', true: '#a8d5a2' }}
            thumbColor={disponible ? GREEN : '#bbb'} />
        </View>

        <TouchableOpacity style={[styles.btnPublicar, loading && { opacity: 0.7 }]}
          onPress={handlePublicar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPublicarText}>🐾  Publicar anuncio</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={pickerVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerSheetTitle}>Selecciona especie</Text>
            {ESPECIES.map((item) => (
              <TouchableOpacity key={item}
                style={[styles.pickerItem, especie === item && { backgroundColor: GREEN_LIGHT }]}
                onPress={() => { setEspecie(item); setPickerVisible(false); }}>
                <Text style={[styles.pickerItemText, especie === item && { color: GREEN_DARK, fontWeight: '700' }]}>
                  {especie === item ? '✓ ' : ''}{item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#222', marginBottom: 4 },
  textArea: { height: 110, textAlignVertical: 'top' },
  imagePreview: { width: '100%', height: 200, borderRadius: 14, marginBottom: 4, borderWidth: 1, borderColor: '#ddd' },
  imagePlaceholder: { width: '100%', height: 140, borderRadius: 14, marginBottom: 4, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  picker: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pickerText: { fontSize: 15, color: '#222' },
  pickerChevron: { fontSize: 16, color: '#aaa' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#ddd' },
  switchSub: { fontSize: 13, color: '#555', marginTop: 2 },
  btnPublicar: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 22, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnPublicarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  pickerSheetTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 14, textAlign: 'center' },
  pickerItem: { paddingVertical: 13, borderBottomWidth: 1, borderColor: '#f0f0f0', paddingHorizontal: 4 },
  pickerItemText: { fontSize: 15, color: '#333' },
});
