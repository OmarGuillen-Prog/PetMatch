import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Image, Switch, Modal, Alert, ActivityIndicator, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { MascotasAPI } from '../api/petmatchApi';

const GREEN = '#4CAF50', GREEN_DARK = '#2e7d32', GREEN_LIGHT = '#e8f5e9';

type EspecieType = 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Hámster' | 'Otro';

const ESPECIES: EspecieType[] = ['Perro', 'Gato', 'Conejo', 'Ave', 'Hámster', 'Otro'];

const RAZAS: Record<EspecieType, string[]> = {
  Perro: ['Labrador', 'Golden Retriever', 'Bulldog', 'Poodle', 'Chihuahua', 'Mestizo', 'Otro'],
  Gato: ['Persa', 'Siamés', 'Maine Coon', 'Bengalí', 'Común europeo', 'Otro'],
  Conejo: ['Holandés', 'Angora', 'Rex', 'Otro'],
  Ave: ['Canario', 'Periquito', 'Loro', 'Agapornis', 'Otro'],
  Hámster: ['Sirio', 'Enano ruso', 'Otro'],
  Otro: ['Otro'],
};

const VACUNAS_POR_ESPECIE: Record<EspecieType, string[]> = {
  Perro: ['Rabia', 'Parvovirus', 'Moquillo', 'Hepatitis', 'Leptospirosis', 'Bordetella'],
  Gato: ['Rabia', 'Panleucopenia', 'Calicivirus', 'Rinotraqueítis', 'Leucemia felina'],
  Conejo: ['Mixomatosis', 'Enfermedad hemorrágica'],
  Ave: ['Newcastle', 'Viruela aviar'],
  Hámster: [],
  Otro: ['Rabia', 'Otra'],
};

export default function PublicarScreen({ navigation }: { navigation: any }) {
  const { usuario } = useAuth();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [edadUnidad, setEdadUnidad] = useState('años');
  const [especie, setEspecie] = useState<EspecieType>('Perro');
  const [raza, setRaza] = useState('Mestizo');
  const [vacunas, setVacunas] = useState<string[]>([]);
  const [disponible, setDisponible] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState<string | null>(null);

  const toggleVacuna = (v: string) =>
    setVacunas((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const handlePickPhoto = () => {
    // En producción usar react-native-image-picker
    setPhotoUri('https://placekitten.com/400/400');
  };

  const handlePublicar = async () => {
    if (!nombre.trim() || !edad.trim()) {
      return Alert.alert('Campos requeridos', 'Completa nombre y edad.');
    }

    setLoading(true);
    try {
      const nueva = await MascotasAPI.create({
        nombre: nombre.trim(),
        tipo: especie,
        raza,
        edad: parseInt(edad, 10),
        descripcion: descripcion.trim(),
        estado: disponible ? 'Disponible' : 'No disponible',
        usuario_id: usuario?.id || 1,
        vacunas,
      });

      if (photoUri && nueva?.id) {
        const form = new FormData();
        form.append('imagen', {
          uri: photoUri,
          name: 'foto.jpg',
          type: 'image/jpeg',
        } as any);
        await MascotasAPI.uploadImage(nueva.id, form);
      }

      Alert.alert('🎉 Publicado', `${nombre} ya está visible en la app.`, [
        { text: '¡Genial!', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo publicar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f7fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar mascota</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Foto */}
        <Text style={styles.label}>Foto de la mascota *</Text>
        <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoHint}>Toca para subir foto</Text>
              <Text style={styles.photoHintSub}>JPG, PNG · Máx. 10 MB</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nombre */}
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Luna, Max…"
          placeholderTextColor="#bbb"
          value={nombre}
          onChangeText={setNombre}
        />

        {/* Edad */}
        <Text style={styles.label}>Edad *</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Ej. 2"
            placeholderTextColor="#bbb"
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />
          <View style={styles.segmentRow}>
            {['meses', 'años'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.segment, edadUnidad === u && styles.segmentActive]}
                onPress={() => setEdadUnidad(u)}
              >
                <Text style={[styles.segmentText, edadUnidad === u && styles.segmentTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Especie */}
        <Text style={styles.label}>Especie *</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setPickerVisible('especie')}>
          <Text style={styles.pickerText}>{especie}</Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>

        {/* Raza */}
        <Text style={styles.label}>Raza</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setPickerVisible('raza')}>
          <Text style={styles.pickerText}>{raza}</Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>

        {/* Vacunas */}
        {VACUNAS_POR_ESPECIE[especie]?.length > 0 && (
          <>
            <Text style={styles.label}>Vacunas aplicadas</Text>
            <View style={styles.chipsWrap}>
              {VACUNAS_POR_ESPECIE[especie].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, vacunas.includes(v) && styles.chipActive]}
                  onPress={() => toggleVacuna(v)}
                >
                  <Text style={[styles.chipText, vacunas.includes(v) && styles.chipTextActive]}>
                    {vacunas.includes(v) ? '✓ ' : ''}
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Cuéntanos sobre la mascota…"
          placeholderTextColor="#bbb"
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />

        {/* Disponibilidad */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Estado de adopción</Text>
            <Text style={styles.switchSub}>
              {disponible ? '✅ Disponible' : '🔒 No disponible'}
            </Text>
          </View>
          <Switch
            value={disponible}
            onValueChange={setDisponible}
            trackColor={{ false: '#ddd', true: '#a8d5a2' }}
            thumbColor={disponible ? GREEN : '#bbb'}
          />
        </View>

        {/* Publicar */}
        <TouchableOpacity
          style={styles.btnPublicar}
          onPress={handlePublicar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPublicarText}>🐾  Publicar anuncio</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Picker modal */}
      <Modal visible={!!pickerVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(null)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerSheetTitle}>
              {pickerVisible === 'especie' ? 'Selecciona especie' : 'Selecciona raza'}
            </Text>
            {(pickerVisible === 'especie' ? ESPECIES : RAZAS[especie] ?? []).map((item: string) => (
              <TouchableOpacity
                key={item}
                style={styles.pickerItem}
                onPress={() => {
                  if (pickerVisible === 'especie') {
                    setEspecie(item as EspecieType);
                    setRaza(RAZAS[item as EspecieType]?.[0] ?? 'Otro');
                    setVacunas([]);
                  } else {
                    setRaza(item);
                  }
                  setPickerVisible(null);
                }}
              >
                <Text style={styles.pickerItemText}>{item}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginTop: 16, marginBottom: 6 },
  photoBox: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 4,
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { fontSize: 36, marginBottom: 6 },
  photoHint: { fontSize: 14, color: '#555', fontWeight: '600' },
  photoHintSub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  segment: { paddingHorizontal: 14, paddingVertical: 11 },
  segmentActive: { backgroundColor: GREEN },
  segmentText: { fontSize: 13, color: '#555' },
  segmentTextActive: { color: '#fff', fontWeight: '700' },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickerText: { fontSize: 15, color: '#222' },
  pickerChevron: { fontSize: 16, color: '#aaa' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: GREEN_LIGHT, borderColor: GREEN },
  chipText: { fontSize: 12, color: '#777' },
  chipTextActive: { color: GREEN_DARK, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchSub: { fontSize: 13, color: '#555', marginTop: 2 },
  btnPublicar: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPublicarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  pickerSheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
    textAlign: 'center',
  },
  pickerItem: { paddingVertical: 13, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  pickerItemText: { fontSize: 15, color: '#333' },
});
