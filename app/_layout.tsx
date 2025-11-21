import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import { PadreProvider } from '@/contexts/PadreContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PadreProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="disponibilidad" options={{ headerShown: false }} />
            <Stack.Screen name="crear-examen" options={{ headerShown: false }} />
            <Stack.Screen name="sesion-estudio" options={{ headerShown: false }} />
            <Stack.Screen name="editar-perfil" options={{ headerShown: false }} />
            <Stack.Screen name="cambiar-contrasena" options={{ headerShown: false }} />
            <Stack.Screen name="recuperar-contrasena" options={{ headerShown: false }} />
            <Stack.Screen name="notificaciones" options={{ headerShown: false }} />
            <Stack.Screen name="vincular-hijo" options={{ headerShown: false }} />
            <Stack.Screen name="agregar-amigo" options={{ headerShown: false }} />
            <Stack.Screen name="detalle-examen" options={{ headerShown: false }} />
            <Stack.Screen name="configuracion" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        </PadreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
