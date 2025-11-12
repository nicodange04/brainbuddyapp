import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignBorderRadius, DesignColors, DesignShadows, DesignSpacing, DesignTypography } from '@/constants/design';

interface ExamProgress {
  id: string;
  name: string;
  subject: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  averageScore: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface ExamProgressCardProps {
  exam: ExamProgress;
}

export function ExamProgressCard({ exam }: ExamProgressCardProps) {
  const progressPercentage = exam.sessionsTotal > 0
    ? (exam.sessionsCompleted / exam.sessionsTotal) * 100
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: exam.color },
          ]}
        >
          <Ionicons
            name={exam.icon}
            size={24}
            color={DesignColors.secondary.white}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.examName}>{exam.name}</Text>
          <Text style={styles.subject}>{exam.subject}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Sesiones</Text>
          <Text style={styles.progressValue}>
            {exam.sessionsCompleted}/{exam.sessionsTotal}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercentage}%`,
                backgroundColor: exam.color,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Promedio</Text>
          <Text style={[styles.scoreValue, { color: exam.color }]}>
            {exam.averageScore}/100
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: DesignBorderRadius.card,
    padding: DesignSpacing.lg,
    marginBottom: DesignSpacing.md,
    ...DesignShadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSpacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: DesignBorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSpacing.md,
  },
  headerText: {
    flex: 1,
  },
  examName: {
    fontSize: DesignTypography.fontSize.lg,
    fontWeight: DesignTypography.fontWeight.bold,
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.xs / 2,
  },
  subject: {
    fontSize: DesignTypography.fontSize.sm,
    color: DesignColors.neutral.mediumGray,
  },
  progressSection: {
    marginBottom: DesignSpacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSpacing.sm,
  },
  progressLabel: {
    fontSize: DesignTypography.fontSize.sm,
    fontWeight: DesignTypography.fontWeight.medium,
    color: DesignColors.neutral.mediumGray,
  },
  progressValue: {
    fontSize: DesignTypography.fontSize.sm,
    fontWeight: DesignTypography.fontWeight.semibold,
    color: DesignColors.neutral.black,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: DesignColors.neutral.lightGray,
    borderRadius: DesignBorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: DesignBorderRadius.full,
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: DesignTypography.fontSize.xs,
    color: DesignColors.neutral.mediumGray,
    marginBottom: DesignSpacing.xs / 2,
  },
  scoreValue: {
    fontSize: DesignTypography.fontSize['2xl'],
    fontWeight: DesignTypography.fontWeight.bold,
  },
});


