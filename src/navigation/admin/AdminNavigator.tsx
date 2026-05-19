import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboard from '../../screens/admin/AdminDashboard';
import AdminUsuarios from '../../screens/admin/AdminUsuarios';
import AdminMascotas from '../../screens/admin/AdminMascotas';
import AdminAdopciones from '../../screens/admin/AdminAdopciones';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#e65100',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = 'grid';
          else if (route.name === 'Usuarios') iconName = 'people';
          else if (route.name === 'Mascotas') iconName = 'paw';
          else if (route.name === 'Adopciones') iconName = 'home';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Usuarios" component={AdminUsuarios} options={{ title: 'Usuarios' }} />
      <Tab.Screen name="Mascotas" component={AdminMascotas} options={{ title: 'Mascotas' }} />
      <Tab.Screen name="Adopciones" component={AdminAdopciones} options={{ title: 'Adopciones' }} />
    </Tab.Navigator>
  );
}
