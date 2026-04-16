import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { publishStyles as styles } from '../styles/publishStyles';

export default function PublishScreen({ navigation }: any) {

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [edad, setEdad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');

  const handlePublish = () => {
    if (!nombre || !tipo || !edad) {
      Alert.alert('Error', 'Completa los campos obligatorios');
      return;
    }

    const nuevaMascota = {
      nombre,
      tipo,
      edad,
      descripcion,
      imagen,
    };

    console.log('Mascota publicada:', nuevaMascota);

    Alert.alert('Éxito', 'Mascota publicada correctamente');

    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>🐾 Publicar Mascota</Text>

      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        placeholder="Tipo (Perro, Gato...)"
        style={styles.input}
        value={tipo}
        onChangeText={setTipo}
      />

      <TextInput
        placeholder="Edad"
        style={styles.input}
        value={edad}
        onChangeText={setEdad}
      />

      <TextInput
        placeholder="Descripción"
        style={styles.textarea}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        placeholder="URL de imagen"
        style={styles.input}
        value={imagen}
        onChangeText={setImagen}
      />

      <TouchableOpacity style={styles.button} onPress={handlePublish}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>

    </View>
  );
}