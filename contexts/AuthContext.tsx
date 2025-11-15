// contexts/AuthContext.tsx
import { AuthUser, getCurrentUser, login, LoginCredentials, logout, register, RegisterData, vincularPadreAlumno } from '@/services/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  vincularPadreAlumno: (codigo: string) => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión existente al cargar la app
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error verificando estado de autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const userData = await login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setLoading(true);
      const userData = await register(data);
      setUser(userData);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleVincularPadreAlumno = async (codigo: string) => {
    if (!user?.padre) {
      throw new Error('Solo los padres pueden vincularse con alumnos');
    }

    try {
      await vincularPadreAlumno(codigo, user.padre.padre_id);
      // Refrescar datos del usuario
      await checkAuthState();
    } catch (error) {
      console.error('Error en vinculación:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    vincularPadreAlumno: handleVincularPadreAlumno,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
