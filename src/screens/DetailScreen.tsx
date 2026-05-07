import { View, Text, Image, TouchableOpacity } from 'react-native';
import { detailStyles as styles } from '../styles/detailStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetailScreen({ route }: any) {
  const { mascota } = route.params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        <Image 
          source={{ uri: mascota.imagen }} 
          style={styles.image}
        />

        <Text style={styles.name}>{mascota.nombre}</Text>

        <Text style={styles.status}>
          Estado: {mascota.estado}
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Solicitar adopción</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}