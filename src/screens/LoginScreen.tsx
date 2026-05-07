import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { loginStyles as styles } from '../styles/loginStyles';

export default function LoginScreen({ navigation }: any) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>🐾 PetMatch</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>

    </View>
  );
}