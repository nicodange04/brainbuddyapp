import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignBorderRadius, DesignColors, DesignShadows, DesignSpacing, DesignTypography } from '@/constants/design';

interface Activity {
  id: string;
  date: string;
  action: string;
  points: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Timeline de Actividades</Text>
      <View style={styles.timeline}>
        {activities.map((activity, index) => (
          <View key={activity.id} style={styles.activityItem}>
            {index < activities.length - 1 && <View style={styles.line} />}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: activity.iconColor },
              ]}
            >
              <Ionicons
                name={activity.icon}
                size={20}
                color={DesignColors.secondary.white}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.date}>{activity.date}</Text>
              <Text style={styles.action}>{activity.action}</Text>
            </View>
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>+{activity.points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
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
  timeline: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: DesignBorderRadius.card,
    padding: DesignSpacing.md,
    ...DesignShadows.soft,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSpacing.md,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 2,
    height: '100%',
    backgroundColor: DesignColors.neutral.lightGray,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: DesignBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSpacing.md,
    zIndex: 1,
  },
  content: {
    flex: 1,
    marginRight: DesignSpacing.sm,
  },
  date: {
    fontSize: DesignTypography.fontSize.xs,
    color: DesignColors.neutral.mediumGray,
    marginBottom: DesignSpacing.xs / 2,
  },
  action: {
    fontSize: DesignTypography.fontSize.base,
    fontWeight: DesignTypography.fontWeight.medium,
    color: DesignColors.neutral.black,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: DesignTypography.fontSize.lg,
    fontWeight: DesignTypography.fontWeight.bold,
    color: DesignColors.accent.orange,
  },
  pointsLabel: {
    fontSize: DesignTypography.fontSize.xs,
    color: DesignColors.neutral.mediumGray,
  },
});


