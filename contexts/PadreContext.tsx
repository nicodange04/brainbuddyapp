// contexts/PadreContext.tsx
// Contexto para manejar el hijo activo seleccionado por el padre

import { getHijosVinculados, getPrimerHijo, HijoVinculado } from '@/services/padre';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface PadreContextType {
  hijosVinculados: HijoVinculado[];
  hijoActivo: HijoVinculado | null;
  loading: boolean;
  cambiarHijoActivo: (alumnoId: string) => void;
  refrescarHijos: () => Promise<void>;
}

const PadreContext = createContext<PadreContextType | undefined>(undefined);

interface PadreProviderProps {
  children: ReactNode;
}

export function PadreProvider({ children }: PadreProviderProps) {
  const { user } = useAuth();
  const [hijosVinculados, setHijosVinculados] = useState<HijoVinculado[]>([]);
  const [hijoActivo, setHijoActivo] = useState<HijoVinculado | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarHijos = async () => {
    if (!user?.padre?.padre_id) {
      setHijosVinculados([]);
      setHijoActivo(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const hijos = await getHijosVinculados(user.padre.padre_id);
      setHijosVinculados(hijos);

      // Si hay hijos, seleccionar el primero si no hay hijo activo o si el activo ya no existe
      if (hijos.length > 0) {
        setHijoActivo((prev) => {
          if (!prev) {
            return hijos[0];
          }
          // Verificar que el hijo activo todavía existe en la lista
          const hijoActivoExiste = hijos.find(h => h.alumno_id === prev.alumno_id);
          return hijoActivoExiste || hijos[0];
        });
      } else {
        setHijoActivo(null);
      }
    } catch (error) {
      console.error('Error al cargar hijos:', error);
      setHijosVinculados([]);
      setHijoActivo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHijos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.padre?.padre_id]);

  const cambiarHijoActivo = (alumnoId: string) => {
    const hijo = hijosVinculados.find(h => h.alumno_id === alumnoId);
    if (hijo) {
      setHijoActivo(hijo);
    }
  };

  const refrescarHijos = async () => {
    await cargarHijos();
  };

  const value: PadreContextType = {
    hijosVinculados,
    hijoActivo,
    loading,
    cambiarHijoActivo,
    refrescarHijos,
  };

  return (
    <PadreContext.Provider value={value}>
      {children}
    </PadreContext.Provider>
  );
}

export function usePadre() {
  const context = useContext(PadreContext);
  if (context === undefined) {
    throw new Error('usePadre debe ser usado dentro de un PadreProvider');
  }
  return context;
}

