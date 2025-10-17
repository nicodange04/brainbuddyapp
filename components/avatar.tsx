import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AvatarColor } from '@/services/avatar';
import React from 'react';
import { StyleSheet } from 'react-native';

interface AvatarProps {
  iniciales: string;
  color: AvatarColor;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function Avatar({ iniciales, color, size = 'medium', style }: AvatarProps) {
  const sizeStyles = {
    small: {
      width: 40,
      height: 40,
      borderRadius: 20,
      fontSize: 14,
    },
    medium: {
      width: 60,
      height: 60,
      borderRadius: 30,
      fontSize: 20,
    },
    large: {
      width: 80,
      height: 80,
      borderRadius: 40,
      fontSize: 28,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <ThemedView 
      style={[
        styles.avatar,
        {
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: currentSize.borderRadius,
          backgroundColor: color,
        },
        style,
      ]}
    >
      <ThemedText 
        style={[
          styles.avatarText,
          { fontSize: currentSize.fontSize },
        ]}
      >
        {iniciales}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
