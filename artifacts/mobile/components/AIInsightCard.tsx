import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { AIInsight } from "@/constants/demoData";

const TYPE_CONFIG = {
  alert: { icon: "alert-circle" as const, color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
  warning: { icon: "warning" as const, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  success: { icon: "bar-chart" as const, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  info: { icon: "people" as const, color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
};

interface AIInsightCardProps {
  insight: AIInsight;
  index?: number;
}

export function AIInsightCard({ insight, index = 0 }: AIInsightCardProps) {
  const colors = useColors();
  const cfg = TYPE_CONFIG[insight.type];
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 14 });
      opacity.value = withTiming(1, { duration: 400 });
    }, index * 120);
    return () => clearTimeout(timer);
  }, [index, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const pressed = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  return (
    <Animated.View style={[animStyle, pressStyle, { marginBottom: 10 }]}>
      <Pressable
        onPressIn={() => { pressed.value = withSpring(0.98); }}
        onPressOut={() => { pressed.value = withSpring(1); }}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderColor: colors.border,
            borderLeftColor: cfg.color,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{insight.title}</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {insight.description}
          </Text>
          {insight.value && (
            <View style={[styles.metricRow, { backgroundColor: cfg.bg, borderRadius: 8 }]}>
              <Text style={[styles.metricLabel, { color: cfg.color }]}>{insight.metric}</Text>
              <Text style={[styles.metricValue, { color: cfg.color }]}>{insight.value}</Text>
            </View>
          )}
        </View>
        <View style={[styles.actionBtn, { backgroundColor: cfg.bg }]}>
          <Ionicons name="chevron-forward" size={14} color={cfg.color} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, gap: 4 },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  desc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  metricValue: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
