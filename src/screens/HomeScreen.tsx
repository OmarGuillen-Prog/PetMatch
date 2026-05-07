import { View, Text, FlatList } from 'react-native';
import PetCard from '../components/PetCard';
import { homeStyles as styles } from '../styles/homeStyles';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const pets = [
  {
    id: '1',
    nombre: 'Luna',
    estado: 'Disponible',
    imagen: 'https://placedog.net/400/300?id=1',
  },
  {
    id: '2',
    nombre: 'Max',
    estado: 'Disponible',
    imagen: 'https://placedog.net/400/300?id=2',
  },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>🐾 Mascotas disponibles</Text>

        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PetCard
              nombre={item.nombre}
              estado={item.estado}
              imagen={item.imagen}
              onPress={() =>
                navigation.navigate('Detail', { mascota: item })
                
              }
            />
            
          )}
        />
      </View>
    </SafeAreaView>
  );
}