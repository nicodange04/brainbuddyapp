import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">👤 PERFIL - Información del Usuario</ThemedText>
        <ThemedText type="defaultSemiBold">
          Esta será la pantalla de perfil y configuración
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">📋 ELEMENTOS QUE IRÁN AQUÍ:</ThemedText>
        
        <ThemedText type="subtitle">👤 INFORMACIÓN PERSONAL</ThemedText>
        <ThemedText>• Avatar grande (círculo con iniciales + color)</ThemedText>
        <ThemedText>• Nombre del usuario</ThemedText>
        <ThemedText>• Email</ThemedText>
        <ThemedText>• Fecha de nacimiento (solo alumnos)</ThemedText>
        <ThemedText>• Tipo de usuario (Alumno/Padre)</ThemedText>
        
        <ThemedText type="subtitle">⭐ ESTADÍSTICAS PRINCIPALES</ThemedText>
        <ThemedText>• Puntos totales: 1,250 pts</ThemedText>
        <ThemedText>• Racha actual: 🔥 14 días</ThemedText>
        <ThemedText>• Racha máxima: 🔥 21 días</ThemedText>
        <ThemedText>• Sesiones completadas: 45</ThemedText>
        <ThemedText>• Horas de estudio: 33.75h</ThemedText>
        
        <ThemedText type="subtitle">🏆 TROFEOS OBTENIDOS</ThemedText>
        <ThemedText>• Grid con trofeos desbloqueados</ThemedText>
        <ThemedText>• Contador: "5 de 6 trofeos"</ThemedText>
        <ThemedText>• Botón "Ver todos los trofeos"</ThemedText>
        
        <ThemedText type="subtitle">🔗 CÓDIGO DE VINCULACIÓN</ThemedText>
        <ThemedText>• Código de 6 dígitos: "ABC123"</ThemedText>
        <ThemedText>• Botón "Copiar código"</ThemedText>
        <ThemedText>• Botón "Compartir con padres"</ThemedText>
        <ThemedText>• Explicación: "Comparte este código con tus padres"</ThemedText>
        
        <ThemedText type="subtitle">⚙️ CONFIGURACIÓN</ThemedText>
        <ThemedText>• Botón "Editar perfil"</ThemedText>
        <ThemedText>• Botón "Cambiar contraseña"</ThemedText>
        <ThemedText>• Botón "Notificaciones"</ThemedText>
        
        {/* Botón de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>🚪 Cerrar Sesión</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle">🎨 DISEÑO:</ThemedText>
        <ThemedText>• Avatar centrado en la parte superior</ThemedText>
        <ThemedText>• Cards para cada sección</ThemedText>
        <ThemedText>• Iconos para cada opción</ThemedText>
        <ThemedText>• Colores consistentes con el tema</ThemedText>
        <ThemedText>• Scroll vertical para todo el contenido</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fondo consistente
    padding: 20,
  },
  header: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    gap: 16,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
