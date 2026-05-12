import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import PetCard from '../components/PetCard';
import { homeStyles as styles } from '../styles/homeStyles';

import { getMascotas, Mascota } from '../services/petService';

export default function HomeScreen({ navigation }: any) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMascotas = async () => {
    try {
      setError(null);

      const data = await getMascotas();

      setMascotas(data);
    } catch (err) {
      setError('No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMascotas();
  };

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
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>🐾 Mascotas disponibles</Text>

        <FlatList
          data={mascotas}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          renderItem={({ item }) => (
            <PetCard
              nombre={item.nombre}
              estado={item.estado}
              imagen={item.imagen}
              onPress={() =>
                navigation.navigate('Detail', {
                  mascota: item,
                })
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}