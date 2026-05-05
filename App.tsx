import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
