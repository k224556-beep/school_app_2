import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  trend?: number;
  index?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  gradientStart,
  gradientEnd,
  trend,
  index = 0,
}: MetricCardProps) {
  const colors = useColors();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 14, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 350 });
    }, delay);
    return () => clearTimeout(timer);
  }, [index, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pressed = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  return (
    <Animated.View style={[animStyle, pressStyle]}>
      <Pressable
        onPressIn={() => { pressed.value = withSpring(0.95); }}
        onPressOut={() => { pressed.value = withSpring(1); }}
      >
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderRadius: colors.radius }]}
        >
          <View style={styles.header}>
            <View style={[styles.iconBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name={icon} size={18} color="#fff" />
            </View>
            {trend !== undefined && (
              <View style={[styles.trendBadge, {
                backgroundColor: trend >= 0 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"
              }]}>
                <Ionicons
                  name={trend >= 0 ? "trending-up" : "trending-down"}
                  size={11}
                  color="#fff"
                />
                <Text style={styles.trendText}>
                  {trend >= 0 ? "+" : ""}{trend}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.value} numberOfLines={1}>{value}</Text>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    padding: 16,
    marginRight: 12,
    height: 140,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  value: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginTop: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
});
