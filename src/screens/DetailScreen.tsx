import { View, Text, Image } from 'react-native';

export default function DetailScreen({ route }: any) {
  const { mascota } = route.params;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Image 
        source={{ uri: mascota.imagen }} 
        style={{ width: '100%', height: 250, borderRadius: 10 }}
      />

      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
        {mascota.nombre}
      </Text>

      <Text style={{ color: '#666', marginTop: 5 }}>
        Estado: {mascota.estado}
      </Text>
    </View>
  );
}