import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { registerStyles as styles } from '../styles/registerStyles';

export default function RegisterScreen({ navigation }: any) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>🐾 PetMatch</Text>
      <Text style={styles.subtitle}>Crear cuenta</Text>

      <TextInput
        placeholder="Nombre"
        style={styles.input}
      />

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>

    </View>
  );
}