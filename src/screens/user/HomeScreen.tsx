import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  RefreshControl, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PetCard from '../../components/PetCard';
import { getMascotas } from '../../services/petService';
import { getImagenesByMascota } from '../../services/petService';
import { Mascota } from '../../types';
import { colors } from '../../styles/shared/colors';

export default function HomeScreen({ navigation }: any) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [filtradas, setFiltradas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const fetchMascotas = useCallback(async () => {
    try {
      setError(null);
      const data = await getMascotas();
      // Enriquecer con imágenes
      const enriquecidas = await Promise.all(
        data.map(async (m) => {
          try {
            const imgs = await getImagenesByMascota(m.id);
            return { ...m, imagenes: imgs };
          } catch {
            return m;
          }
        })
      );
      setMascotas(enriquecidas);
      setFiltradas(enriquecidas);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMascotas(); }, [fetchMascotas]);

  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltradas(mascotas);
    } else {
      const q = busqueda.toLowerCase().trim();
      setFiltradas(
        mascotas.filter((m) => {
          const nombre = (m.nombre || '').toLowerCase();
          const tipo = (m.tipo || '').toLowerCase();
          const estado = (m.estado || '').toLowerCase();
          const descripcion = (m.descripcion || '').toLowerCase();
          return (
            nombre.includes(q) ||
            tipo.includes(q) ||
            estado.includes(q) ||
            descripcion.includes(q)
          );
        })
      );
    }
  }, [busqueda, mascotas]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={fetchMascotas} style={{ marginTop: 12 }}>
          <Text style={{ color: '#4A90E2', fontWeight: '600' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Text style={styles.title}>🐾 Mascotas disponibles</Text>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>❤️ ¡Adopta y cambia una vida!</Text>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Buscar por nombre, tipo o estado..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMascotas(); }} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: '#888', marginTop: 40 }}>No hay mascotas disponibles</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PetCard
              nombre={item.nombre}
              estado={item.estado}
              tipo={item.tipo}
              imagen={item.imagenes?.[0]?.url ?? ''}
              onPress={() => navigation.navigate('Detail', { mascota: item })}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 12 },
  banner: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  bannerText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  search: {
    backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, marginBottom: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#ddd',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { fontSize: 14, color: '#e57373', textAlign: 'center' },
});
