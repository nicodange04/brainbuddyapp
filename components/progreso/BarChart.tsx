import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignBorderRadius, DesignColors, DesignShadows, DesignSpacing, DesignTypography } from '@/constants/design';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  title?: string;
}

export function BarChart({ data, maxValue, title }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 0);
  const chartHeight = 200;

  /**
   * Formatea las horas de manera legible
   */
  const formatearHoras = (horas: number): string => {
    if (horas === 0) return '0h';
    
    // Si es menos de 1 hora, mostrar en minutos
    if (horas < 1) {
      const minutos = Math.round(horas * 60);
      return `${minutos} min`;
    }
    
    // Si es 1 hora o más, mostrar horas con 1 decimal
    const horasRedondeadas = Math.round(horas * 10) / 10;
    return `${horasRedondeadas}h`;
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        <View style={[styles.chart, { height: chartHeight }]}>
          {data.map((item, index) => {
            const height = max > 0 ? (item.value / max) * chartHeight : 0;
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 8), // Minimum height for visibility
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                  {item.value > 0 && (
                    <Text style={styles.barValue} numberOfLines={1}>
                      {formatearHoras(item.value)}
                    </Text>
                  )}
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
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
  chartContainer: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: DesignBorderRadius.card,
    padding: DesignSpacing.lg,
    ...DesignShadows.soft,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: DesignSpacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 8,
  },
  bar: {
    width: '80%',
    borderRadius: DesignBorderRadius.md,
    minHeight: 8,
    position: 'relative',
  },
  barValue: {
    position: 'absolute',
    top: -20,
    fontSize: DesignTypography.fontSize.xs,
    fontWeight: DesignTypography.fontWeight.semibold,
    color: DesignColors.neutral.darkGray,
  },
  barLabel: {
    marginTop: DesignSpacing.sm,
    fontSize: DesignTypography.fontSize.xs,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
  },
});


