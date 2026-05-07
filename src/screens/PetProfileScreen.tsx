import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, Dimensions, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { MascotasAPI, AdopcionesAPI, FavoritosAPI, MensajesAPI, Mascota } from '../api/petmatchApi';

const { width } = Dimensions.get('window');
const GREEN = '#4CAF50', GREEN_DARK = '#2e7d32', GREEN_LIGHT = '#e8f5e9', BG = '#f5f7fa';

interface Imagen {
  id?: number;
  url: string;
}

interface Encargado {
  id?: number;
  nombre: string;
  email?: string;
}

export default function PetProfileScreen({ route, navigation }: { route: any; navigation: any }) {
  const { mascotaId } = route.params;
  const { usuario } = useAuth();
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [fotoModal, setFotoModal] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const m = await MascotasAPI.getById(mascotaId);
        setMascota(m);
        setImagenes(m.imagenes || []);
      } catch (e) {
        console.error('Error cargando mascota:', e);
      } finally {
        setLoading(false);
      }
    })();
    FavoritosAPI.isFavorito(mascotaId).then(setIsFav).catch(console.error);
  }, [mascotaId]);

  const toggleFav = async () => {
    if (!mascota) return;
    try {
      await FavoritosAPI.toggle(mascota);
      setIsFav(!isFav);
    } catch (e) {
      console.error('Error toggling favorito:', e);
    }
  };

  const solicitarAdopcion = async () => {
    if (!mascota || !usuario) return;
    Alert.alert(
      'Confirmar solicitud',
      `¿Deseas solicitar la adopción de ${mascota.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, solicitar',
          onPress: async () => {
            try {
              await AdopcionesAPI.solicitar(mascota.id, usuario.id);
              await MensajesAPI.enviar(
                usuario.id,
                mascota.usuario_id,
                `¡Hola! Me interesa adoptar a ${mascota.nombre}. Espero tu respuesta. 🐾`
              );
              Alert.alert('✅ Solicitud enviada', 'Se envió un mensaje automático al encargado. Pronto te contactarán.');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const contactarEncargado = () => {
    if (!mascota) return;
    navigation.navigate('Chat', {
      otroUsuarioId: mascota.usuario_id,
      otroUsuarioNombre: mascota.encargado?.nombre || 'Encargado',
    });
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (!mascota) {
    return (
      <View style={styles.loading}>
        <Text>No encontrado</Text>
      </View>
    );
  }

  const fotos = imagenes.length > 0 ? imagenes : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Galería de fotos */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
          >
            {fotos.map((img, i) => (
              <TouchableOpacity
                key={img.id ?? i}
                onPress={() => setFotoModal(img.url)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: img.url }} style={styles.mainImg} resizeMode="cover" />
              </TouchableOpacity>
            ))}
            {fotos.length === 0 && (
              <View style={[styles.mainImg, styles.photoPlaceholder]}>
                <Text style={styles.photoPlaceholderText}>Sin foto</Text>
              </View>
            )}
          </ScrollView>

          {/* Indicadores */}
          {fotos.length > 1 && (
            <View style={styles.dotsRow}>
              {fotos.map((_, i) => (
                <View key={i} style={[styles.imgDot, i === imgIndex && styles.imgDotActive]} />
              ))}
            </View>
          )}

          {/* Badge disponibilidad */}
          <View
            style={[
              styles.availBadge,
              { backgroundColor: mascota.estado === 'Disponible' ? GREEN : '#e57373' },
            ]}
          >
            <Text style={styles.availText}>
              {mascota.estado === 'Disponible' ? '● Disponible' : '● No disponible'}
            </Text>
          </View>

          {/* Botones superiores */}
          <View style={styles.topBtns}>
            <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 18 }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBtn} onPress={toggleFav}>
              <Text style={{ fontSize: 18 }}>{isFav ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          {/* Zoom hint */}
          <View style={styles.zoomBadge}>
            <Text style={styles.zoomText}>🔍 Toca para ampliar</Text>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.body}>
          {/* Nombre y especie */}
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{mascota.nombre}</Text>
            <View style={styles.especieBadge}>
              <Text style={styles.especieText}>{mascota.tipo}</Text>
            </View>
          </View>

          {/* Pills */}
          <View style={styles.pillsRow}>
            <InfoPill icon="🐕" label="Raza" value={mascota.raza || mascota.tipo} />
            <InfoPill
              icon="🎂"
              label="Edad"
              value={
                mascota.edad != null
                  ? `${mascota.edad} ${mascota.edad === 1 ? 'año' : 'años'}`
                  : '—'
              }
            />
          </View>

          {/* Vacunas */}
          {mascota.vacunas?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💉 Vacunas</Text>
              <View style={styles.chipsRow}>
                {mascota.vacunas.map((v) => (
                  <View key={v} style={styles.chip}>
                    <Text style={styles.chipText}>✓ {v}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Descripción */}
          {!!mascota.descripcion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Sobre mí</Text>
              <Text style={styles.desc}>{mascota.descripcion}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Encargado */}
          <Text style={styles.sectionTitle}>👤 Encargado de adopción</Text>
          <TouchableOpacity style={styles.encargadoCard} onPress={contactarEncargado}>
            <View style={styles.encargadoAvatar}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.encargadoNombre}>
                {mascota.encargado?.nombre || 'Encargado'}
              </Text>
              <Text style={styles.encargadoEmail}>{mascota.encargado?.email || ''}</Text>
            </View>
            <Text style={{ fontSize: 18, color: GREEN }}>💬</Text>
          </TouchableOpacity>

          {/* Acciones */}
          {mascota.estado === 'Disponible' && mascota.usuario_id !== usuario?.id ? (
            <TouchableOpacity style={styles.btnAdoptar} onPress={solicitarAdopcion}>
              <Text style={styles.btnAdoptarText}>🐾  Solicitar adopción</Text>
            </TouchableOpacity>
          ) : mascota.usuario_id === usuario?.id ? (
            <View style={styles.ownerNote}>
              <Text style={styles.ownerNoteText}>📌 Esta es tu publicación</Text>
            </View>
          ) : (
            <View style={[styles.btnAdoptar, { backgroundColor: '#e0e0e0' }]}>
              <Text style={[styles.btnAdoptarText, { color: '#999' }]}>
                No disponible para adopción
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Modal foto ampliada */}
      <Modal visible={!!fotoModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.fotoModal}
          activeOpacity={1}
          onPress={() => setFotoModal(null)}
        >
          <Image source={{ uri: fotoModal! }} style={styles.fotoModalImg} resizeMode="contain" />
          <Text style={styles.fotoModalClose}>✕ Cerrar</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function InfoPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <View>
        <Text style={styles.pillLabel}>{label}</Text>
        <Text style={styles.pillValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  galleryWrap: { position: 'relative' },
  mainImg: { width, height: 340 },
  photoPlaceholder: { backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { color: '#888', fontSize: 14 },
  dotsRow: {
    position: 'absolute',
    bottom: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  imgDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  imgDotActive: { backgroundColor: '#fff', width: 20 },
  availBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  availText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  topBtns: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topBtn: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zoomText: { color: '#fff', fontSize: 10 },
  body: { backgroundColor: BG, paddingHorizontal: 22, paddingTop: 20 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  petName: { fontSize: 30, fontWeight: '900', color: '#1a1a1a' },
  especieBadge: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  especieText: { fontSize: 13, color: GREEN_DARK, fontWeight: '700' },
  pillsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pillLabel: { fontSize: 10, color: '#aaa', fontWeight: '600', textTransform: 'uppercase' },
  pillValue: { fontSize: 14, color: '#222', fontWeight: '700' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: GREEN_LIGHT, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, color: GREEN_DARK, fontWeight: '700' },
  desc: { fontSize: 14, color: '#555', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  encargadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  encargadoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encargadoNombre: { fontSize: 15, fontWeight: '700', color: '#222' },
  encargadoEmail: { fontSize: 12, color: '#888' },
  btnAdoptar: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnAdoptarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ownerNote: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GREEN,
  },
  ownerNoteText: { color: GREEN_DARK, fontWeight: '700', fontSize: 14 },
  fotoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoModalImg: { width: '95%', height: '75%', borderRadius: 12 },
  fotoModalClose: { color: '#fff', marginTop: 20, fontSize: 15, fontWeight: '600' },
});
