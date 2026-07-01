import React, { useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable, FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { TEACHERS } from "@/constants/demoData";
import { ProgressBar } from "@/components/Charts";

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#f43f5e", "#8b5cf6", "#06b6d4", "#ec4899",
];

export default function TeachersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Teachers</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{TEACHERS.length} staff members</Text>
        </View>
        <Pressable style={[styles.iconBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Summary Cards */}
      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { label: "Avg Attendance", value: "93%", color: "#10b981" },
          { label: "Avg Performance", value: "84%", color: "#0ea5e9" },
          { label: "Avg Feedback", value: "88%", color: "#8b5cf6" },
        ].map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={TEACHERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 100, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const isSelected = selected === item.id;
          return (
            <Pressable
              onPress={() => setSelected(isSelected ? null : item.id)}
              style={[
                styles.teacherCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View style={styles.teacherRow}>
                <View style={[styles.avatar, { backgroundColor: avatarColor + "25" }]}>
                  <Text style={[styles.avatarText, { color: avatarColor }]}>
                    {item.name.split(" ").slice(-1)[0].substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={[styles.teacherName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.teacherSubject, { color: colors.mutedForeground }]}>{item.subject}</Text>
                  <View style={styles.expRow}>
                    <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.expText, { color: colors.mutedForeground }]}>{item.experience}</Text>
                  </View>
                </View>
                <View style={styles.teacherRight}>
                  <View style={[styles.scoreBadge, {
                    backgroundColor: item.performanceScore >= 85 ? "#10b98120" : item.performanceScore >= 70 ? "#f59e0b20" : "#f43f5e20",
                  }]}>
                    <Text style={[styles.scoreText, {
                      color: item.performanceScore >= 85 ? "#10b981" : item.performanceScore >= 70 ? "#f59e0b" : "#f43f5e",
                    }]}>
                      {item.performanceScore}%
                    </Text>
                  </View>
                  <Ionicons name={isSelected ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                </View>
              </View>

              {isSelected && (
                <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
                  {[
                    { label: "Attendance", value: item.attendance, color: "#10b981" },
                    { label: "Homework Completion", value: item.homeworkCompletion, color: "#0ea5e9" },
                    { label: "Class Results", value: item.classResults, color: "#8b5cf6" },
                    { label: "Parent Feedback", value: item.parentFeedback, color: "#f59e0b" },
                  ].map((metric) => (
                    <View key={metric.label} style={styles.metricRow}>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{metric.label}</Text>
                      <View style={styles.metricBarWrap}>
                        <ProgressBar value={metric.value} color={metric.color} height={6} />
                      </View>
                      <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}%</Text>
                    </View>
                  ))}
                  <View style={[styles.aiSuggestion, { backgroundColor: "#8b5cf610", borderRadius: 8 }]}>
                    <Ionicons name="sparkles" size={13} color="#8b5cf6" />
                    <Text style={[styles.aiSuggestionText, { color: "#8b5cf6" }]}>
                      {item.performanceScore >= 85
                        ? "Excellent performance. Consider as department lead."
                        : item.performanceScore >= 70
                        ? "Good progress. Support with professional development."
                        : "Needs improvement. Schedule observation and coaching."}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginLeft: "auto" },
  summaryRow: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  teacherCard: { padding: 14 },
  teacherRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  teacherInfo: { flex: 1, gap: 3 },
  teacherName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  teacherSubject: { fontSize: 12, fontFamily: "Inter_400Regular" },
  expRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  expText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  teacherRight: { alignItems: "center", gap: 6 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  expandedSection: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 10 },
  metricRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metricLabel: { width: 130, fontSize: 12, fontFamily: "Inter_400Regular" },
  metricBarWrap: { flex: 1 },
  metricValue: { width: 36, fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "right" },
  aiSuggestion: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, marginTop: 4 },
  aiSuggestionText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18 },
});
