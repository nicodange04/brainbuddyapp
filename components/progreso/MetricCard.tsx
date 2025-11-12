import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignBorderRadius, DesignColors, DesignShadows, DesignSpacing, DesignTypography } from '@/constants/design';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor?: string;
  borderColor?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  iconColor,
  backgroundColor = DesignColors.secondary.white,
  borderColor,
}: MetricCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: borderColor || DesignColors.neutral.lightGray,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text 
            style={styles.value}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          >
            {value}
          </Text>
          <Text 
            style={styles.label}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {label.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignBorderRadius.xl,
    padding: DesignSpacing.md,
    borderWidth: 2,
    height: 110,
    width: '100%',
    ...DesignShadows.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: DesignBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: DesignSpacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  value: {
    fontSize: DesignTypography.fontSize['2xl'],
    fontWeight: DesignTypography.fontWeight.bold,
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.xs / 2,
    lineHeight: DesignTypography.fontSize['2xl'] * 1.1,
    flexShrink: 1,
  },
  label: {
    fontSize: DesignTypography.fontSize.xs,
    fontWeight: DesignTypography.fontWeight.medium,
    color: DesignColors.neutral.mediumGray,
    letterSpacing: 0.3,
    lineHeight: DesignTypography.fontSize.xs * 1.3,
    flexShrink: 1,
  },
});


