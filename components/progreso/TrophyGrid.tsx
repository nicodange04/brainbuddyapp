import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignBorderRadius, DesignColors, DesignShadows, DesignSpacing, DesignTypography } from '@/constants/design';

interface Trophy {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  unlocked: boolean;
  color: string;
}

interface TrophyGridProps {
  trophies: Trophy[];
}

export function TrophyGrid({ trophies }: TrophyGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Trofeos</Text>
      <View style={styles.grid}>
        {trophies.map((trophy) => (
          <View
            key={trophy.id}
            style={[
              styles.trophyCard,
              !trophy.unlocked && styles.trophyCardLocked,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: trophy.unlocked
                    ? trophy.color
                    : DesignColors.neutral.lightGray,
                },
              ]}
            >
              <Ionicons
                name={trophy.icon}
                size={32}
                color={trophy.unlocked ? DesignColors.secondary.white : DesignColors.neutral.mediumGray}
              />
            </View>
            <Text
              style={[
                styles.trophyName,
                !trophy.unlocked && styles.trophyNameLocked,
              ]}
              numberOfLines={2}
            >
              {trophy.name}
            </Text>
            {trophy.unlocked && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: DesignTypography.fontSize.xl,
    fontWeight: DesignTypography.fontWeight.bold,
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSpacing.md,
    justifyContent: 'space-between',
  },
  trophyCard: {
    width: '47%',
    backgroundColor: DesignColors.secondary.white,
    borderRadius: DesignBorderRadius.xl,
    padding: DesignSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
    ...DesignShadows.base,
  },
  trophyCardLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: DesignBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSpacing.sm,
  },
  trophyName: {
    fontSize: DesignTypography.fontSize.sm,
    fontWeight: DesignTypography.fontWeight.semibold,
    color: DesignColors.neutral.black,
    textAlign: 'center',
  },
  trophyNameLocked: {
    color: DesignColors.neutral.mediumGray,
  },
  badge: {
    position: 'absolute',
    top: DesignSpacing.xs,
    right: DesignSpacing.xs,
    width: 24,
    height: 24,
    borderRadius: DesignBorderRadius.full,
    backgroundColor: DesignColors.supporting.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: DesignColors.secondary.white,
    fontSize: DesignTypography.fontSize.xs,
    fontWeight: DesignTypography.fontWeight.bold,
  },
});


