import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View>
      <Text>Home Screen 🐾</Text>

      <Button
        title="Cerrar sesión"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}