import { View, Text, Image, TouchableOpacity } from 'react-native';
import { profileStyles as styles } from '../styles/profileStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen({ navigation }: any) {
  
  //  Datos simulados (luego vendrán del backend)
  const user = {
    nombre: 'Omar',
    email: 'omar@email.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.nombre}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Sección */}
        <Text style={styles.sectionTitle}>Mis publicaciones</Text>

        <Text>Aún no tienes mascotas publicadas 🐾</Text>

        {/* Botón logout */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}