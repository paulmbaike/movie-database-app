import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/auth-context';

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated, otherwise to home tab
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }
  
  return <Redirect href="/(tabs)/home" />;
}
