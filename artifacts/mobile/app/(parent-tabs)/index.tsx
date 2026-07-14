import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { STUDENTS } from "@/constants/demoData";
import { MetricCard } from "@/components/MetricCard";
import { useRole } from "@/app/auth/context/RoleContext";

export default function ParentDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useRole();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const child = STUDENTS[0];

  const QUICK = [
    { label: "Pay Fee", icon: "wallet", route: "/(parent-tabs)/fees" },
    { label: "Homework", icon: "book", route: "/(parent-tabs)/homework" },
    { label: "Messages", icon: "chatbubbles", route: "/(parent-tabs)/messages" },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 100, paddingHorizontal: 16 }}>
      <View style={[styles.header, { backgroundColor: colors.card, borderRadius: colors.radius, padding: 16 }]}>
        <Text style={[styles.hi, { color: colors.foreground }]}>Welcome Back</Text>
        <Text style={[styles.childName, { color: colors.foreground }]}>{child.name}</Text>
        <Text style={[styles.childSub, { color: colors.mutedForeground }]}>{child.class} · Guardian: {child.guardian}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable key={q.label} onPress={() => router.push(q.route as never)} style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={q.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Performance</Text>
        <View style={{ marginTop: 12 }}>
          <MetricCard title="Attendance" value={`${child.attendance}%`} icon="calendar" color={colors.primary} gradientStart={colors.primary} gradientEnd={colors.accent} index={0} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 16 },
  hi: { fontSize: 13, fontFamily: "Inter_500Medium" },
  childName: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 6 },
  childSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  quickRow: { flexDirection: "row", gap: 8 },
  quickAction: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 12, alignItems: "center", gap: 6 },
  quickLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 6 },
});
