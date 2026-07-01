import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { getRecoveryScore, getRecoveryColor } from "@/constants/demoData";
import type { Student } from "@/constants/demoData";

const FEE_COLORS = {
  paid: "#10b981",
  partial: "#f59e0b",
  overdue: "#f43f5e",
};

const FEE_LABELS = { paid: "Paid", partial: "Partial", overdue: "Overdue" };

const AVATAR_COLORS = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#f43f5e", "#e11d48"],
  ["#8b5cf6", "#7c3aed"],
];

function getAvatarColors(name: string): [string, string] {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] as [string, string];
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

interface StudentCardProps {
  student: Student;
  onPress: () => void;
}

export function StudentCard({ student, onPress }: StudentCardProps) {
  const colors = useColors();
  const feeColor = FEE_COLORS[student.feeStatus];
  const [c1] = getAvatarColors(student.name);
  const pressed = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressed.value }] }));

  const showRecovery = student.feeStatus !== "paid";
  const recoveryScore = showRecovery ? getRecoveryScore(student) : null;
  const recoveryColor = recoveryScore != null ? getRecoveryColor(recoveryScore) : null;

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        onPressIn={() => { pressed.value = withSpring(0.97); }}
        onPressOut={() => { pressed.value = withSpring(1); }}
        onPress={onPress}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
      >
        <View style={[styles.avatar, { backgroundColor: c1 }]}>
          <Text style={styles.initials}>{getInitials(student.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{student.name}</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {student.class}-{student.section}
          </Text>
          <View style={styles.row}>
            <View style={styles.stat}>
              <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>{student.attendance}%</Text>
            </View>
            <View style={[styles.feeBadge, { backgroundColor: feeColor + "20" }]}>
              <Text style={[styles.feeText, { color: feeColor }]}>{FEE_LABELS[student.feeStatus]}</Text>
            </View>
            {recoveryScore != null && recoveryColor != null && (
              <View style={[styles.recoveryBadge, { backgroundColor: recoveryColor + "18", borderColor: recoveryColor + "40" }]}>
                <Ionicons name="sparkles" size={9} color={recoveryColor} />
                <Text style={[styles.recoveryText, { color: recoveryColor }]}>{recoveryScore}%</Text>
              </View>
            )}
          </View>
        </View>
        {student.riskScore > 60 && (
          <View style={[styles.riskDot, { backgroundColor: "#f43f5e" }]} />
        )}
        <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" },
  stat: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  feeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  feeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  recoveryBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1,
  },
  recoveryText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
});
