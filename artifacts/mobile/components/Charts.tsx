import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Rect, G } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
  sublabel?: string;
}

export function DonutChart({ percentage, size = 130, strokeWidth = 14, color, label, sublabel }: DonutChartProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={[styles.donutLabel, { width: size, height: size }]}>
        {label && <Text style={[styles.donutPercent, { color: colors.foreground }]}>{label}</Text>}
        {sublabel && <Text style={[styles.donutSub, { color: colors.mutedForeground }]}>{sublabel}</Text>}
      </View>
    </View>
  );
}

interface BarChartProps {
  data: Array<{ month: string; amount: number }>;
  height?: number;
  activeColor: string;
  inactiveColor?: string;
}

export function BarChart({ data, height = 120, activeColor, inactiveColor }: BarChartProps) {
  const colors = useColors();
  const maxVal = Math.max(...data.map((d) => d.amount));
  const barWidth = 20;
  const gap = 8;
  const totalWidth = data.length * (barWidth + gap) - gap;
  const chartHeight = height - 24;
  const inactive = inactiveColor ?? colors.border;

  return (
    <View>
      <Svg width={totalWidth} height={chartHeight + 20}>
        <G>
          {data.map((item, i) => {
            const barH = (item.amount / maxVal) * chartHeight;
            const x = i * (barWidth + gap);
            const y = chartHeight - barH;
            const isLast = i === data.length - 1;
            return (
              <G key={item.month}>
                <Rect
                  x={x} y={y}
                  width={barWidth} height={barH}
                  rx={6} ry={6}
                  fill={isLast ? activeColor : inactive}
                />
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={[styles.barLabels, { width: totalWidth }]}>
        {data.map((item, i) => (
          <Text
            key={item.month}
            style={[styles.barLabel, {
              color: i === data.length - 1 ? activeColor : colors.mutedForeground,
              width: barWidth + gap,
              marginRight: i < data.length - 1 ? 0 : 0,
            }]}
          >
            {item.month}
          </Text>
        ))}
      </View>
    </View>
  );
}

interface ProgressBarProps {
  value: number;
  color: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  const colors = useColors();
  return (
    <View style={[styles.progressBg, { height, borderRadius: height / 2, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(value, 100)}%`, backgroundColor: color, height, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  donutContainer: { alignItems: "center", justifyContent: "center" },
  donutLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    left: 0,
  },
  donutPercent: { fontSize: 26, fontFamily: "Inter_700Bold" },
  donutSub: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  barLabels: { flexDirection: "row", marginTop: 4 },
  barLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },
  progressBg: { width: "100%", overflow: "hidden" },
  progressFill: {},
});
