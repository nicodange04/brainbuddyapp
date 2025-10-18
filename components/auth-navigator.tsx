// components/auth-navigator.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';

export function AuthNavigator() {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return null; // O un componente de loading
  }

  // Si hay usuario autenticado, ir a las tabs principales
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Si no hay usuario, ir al login
  return <Redirect href="/login" />;
}
