import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { MetricCard } from "@/components/MetricCard";
import { TEACHERS } from "@/constants/demoData";
import { useRole } from "@/app/auth/context/RoleContext";

export default function TeacherDashboard() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useRole();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const teacher = TEACHERS[0];

  const QUICK_ACTIONS = [
    { label: "Mark Attendance", icon: "checkbox", route: "/(teacher-tabs)/attendance" },
    { label: "Message Parent", icon: "chatbubbles", route: "/(teacher-tabs)/messages" },
    { label: "Create Exam", icon: "document-text", route: "/(teacher-tabs)/exams" },
    { label: "AI Question Paper", icon: "sparkles", route: "/ai-tools" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 100, paddingHorizontal: 16 }}
    >
      <View style={[styles.headerGrad, { borderRadius: colors.radius + 4, backgroundColor: colors.primary }]}>
        <Text style={[styles.headerGreeting, { color: colors.primaryForeground }]}>Good Morning,</Text>
        <Text style={[styles.headerName, { color: colors.primaryForeground }]}>{teacher.name}</Text>
        <Text style={[styles.headerSub, { color: colors.primaryForeground }]}>{teacher.subject} · {teacher.experience} experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((qa) => (
            <Pressable key={qa.label} onPress={() => router.push(qa.route as never)} style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.quickIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name={qa.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]} numberOfLines={2}>{qa.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Performance</Text>
        <View style={{ marginTop: 12 }}>
          <MetricCard title="Attendance" value={`${teacher.attendance}%`} icon="calendar" color={colors.primary} gradientStart={colors.primary} gradientEnd={colors.accent} index={0} />
          <MetricCard title="Homework" value={`${teacher.homeworkCompletion}%`} icon="checkbox" color={colors.primary} gradientStart={colors.accent} gradientEnd={colors.primary} index={1} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: { padding: 20, gap: 6, marginBottom: 20 },
  headerGreeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  headerName: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 2 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  quickRow: { flexDirection: "row", gap: 8 },
  quickAction: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 12, alignItems: "center", gap: 6 },
  quickIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
});
