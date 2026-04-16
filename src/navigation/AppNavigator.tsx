import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Registro' }}
        />

        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'PetMatch 🐾' }}
        />

        <Stack.Screen 
          name="Detail" 
          component={DetailScreen} 
          options={{ title: 'Detalle 🐶' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}