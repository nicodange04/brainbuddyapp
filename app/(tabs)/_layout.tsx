import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const esPadre = user?.usuario?.rol === 'padre';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6', // Violeta
        tabBarInactiveTintColor: '#9CA3AF', // Gris
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}>
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {esPadre && (
        <Tabs.Screen
          name="progreso"
          options={{
            title: 'Progreso',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      {!esPadre && (
        <Tabs.Screen
          name="progreso"
          options={{
            href: null, // Oculta el tab pero mantiene la ruta accesible
          }}
        />
      )}
    </Tabs>
  );
}
