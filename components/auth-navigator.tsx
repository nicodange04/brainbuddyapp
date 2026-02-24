// components/auth-navigator.tsx
import { useAuth } from '@/contexts/AuthContext';
import { tienePerfilCompletado } from '@/services/perfilAprendizaje';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

export function AuthNavigator() {
  const { user, loading } = useAuth();
  const [tienePerfil, setTienePerfil] = useState<boolean | null>(null);
  const [verificandoPerfil, setVerificandoPerfil] = useState(false);

  // Verificar si el alumno tiene perfil completado
  useEffect(() => {
    const verificarPerfil = async () => {
      if (user?.alumno?.alumno_id && !verificandoPerfil) {
        setVerificandoPerfil(true);
        try {
          const tiene = await tienePerfilCompletado(user.alumno.alumno_id);
          setTienePerfil(tiene);
        } catch (error) {
          console.error('Error verificando perfil:', error);
          setTienePerfil(false);
        } finally {
          setVerificandoPerfil(false);
        }
      } else if (!user?.alumno) {
        // Si no es alumno, no necesita perfil
        setTienePerfil(true);
      }
    };

    if (!loading && user) {
      verificarPerfil();
    }
  }, [user, loading, verificandoPerfil]);

  // Mostrar loading mientras se verifica la autenticación o el perfil
  if (loading || (user?.alumno && tienePerfil === null)) {
    return null; // O un componente de loading
  }

  // Si hay usuario autenticado
  if (user) {
    // Si es alumno y no tiene perfil, ir a onboarding
    if (user.alumno && tienePerfil === false) {
      return <Redirect href="/onboarding" />;
    }
    // Si tiene perfil o es padre, ir a las tabs
    return <Redirect href="/(tabs)" />;
  }

  // Si no hay usuario, ir al login
  return <Redirect href="/login" />;
}
