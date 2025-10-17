import { Redirect } from 'expo-router';

export default function Index() {
  // Por ahora redirigimos directamente a login
  // Más adelante aquí verificaremos si el usuario está autenticado
  return <Redirect href="/login" />;
}

