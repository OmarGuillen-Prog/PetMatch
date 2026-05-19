import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { petCardStyles as styles } from '../styles/petCardStyles';

type Props = {
  nombre: string;
  imagen: string;
  estado: string;
  tipo?: string;
  onPress: () => void;
};

const estadoColor = (estado: string) => {
  const e = estado.toLowerCase();
  if (e === 'disponible') return { bg: '#e8f5e9', text: '#2e7d32' };
  if (e === 'adoptado') return { bg: '#e3f2fd', text: '#1565c0' };
  return { bg: '#fce4ec', text: '#c62828' };
};

export default function PetCard({ nombre, imagen, estado, tipo, onPress }: Props) {
  const colors = estadoColor(estado);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.card}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.image,
              { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Text style={{ fontSize: 40 }}>🐾</Text>
          </View>
        )}

        <View style={styles.info}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.name}>{nombre}</Text>
            {tipo && (
              <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>{tipo}</Text>
            )}
          </View>

          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.bg,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 3,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
              {estado}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
