import { View, Text, Button } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  return (
    <View>
      <Text>Register Screen</Text>

      <Button
        title="Volver a Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}