import React from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { STUDENTS, formatPKR } from "@/constants/demoData";
import { ProgressBar, DonutChart } from "@/components/Charts";

const AVATAR_COLORS = [
  ["#6366f1", "#8b5cf6"], ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#059669"], ["#f59e0b", "#d97706"],
];

function getAvatarColor(name: string): [string, string] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] as [string, string];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const FEE_COLORS = { paid: "#10b981", partial: "#f59e0b", overdue: "#f43f5e" };
const FEE_LABELS = { paid: "All Paid", partial: "Partial Payment", overdue: "Overdue" };
const RISK_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#f43f5e" };

function getRiskLevel(score: number) {
  if (score > 60) return "high";
  if (score > 30) return "medium";
  return "low";
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: keyof typeof Ionicons.glyphMap }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function StudentDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const student = STUDENTS.find((s) => s.id === id) ?? STUDENTS[0];

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const [c1, c2] = getAvatarColor(student.name);
  const feeColor = FEE_COLORS[student.feeStatus];
  const riskLevel = getRiskLevel(student.riskScore);
  const riskColor = RISK_COLORS[riskLevel];

  const PAYMENT_HISTORY = [
    { month: "Nov", status: "paid" as const, amount: 6500 },
    { month: "Dec", status: "paid" as const, amount: 6500 },
    { month: "Jan", status: "paid" as const, amount: 6500 },
    { month: "Feb", status: student.feeStatus === "overdue" ? "overdue" as const : "paid" as const, amount: 6500 },
    { month: "Mar", status: student.feeStatus, amount: 6500 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <LinearGradient
        colors={[c1, c2]}
        style={[styles.hero, { paddingTop: topPad + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </View>
        </Pressable>
        <View style={styles.heroContent}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
          </View>
          <Text style={styles.heroName}>{student.name}</Text>
          <Text style={styles.heroMeta}>
            {student.class} – Section {student.section} · {student.id}
          </Text>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: feeColor + "30" }]}>
              <Text style={[styles.badgeText, { color: feeColor === "#10b981" ? "#10b981" : "#fff" }]}>
                {FEE_LABELS[student.feeStatus]}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: riskColor + "30" }]}>
              <Text style={[styles.badgeText, { color: "#fff" }]}>
                Risk: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 16 }}>
        {/* Guardian Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Guardian Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Guardian</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{student.guardian}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>{student.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>DOB</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{student.dob}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="school" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Admitted</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{student.admissionDate}</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={[styles.contactBtn, { backgroundColor: "#25d36620", borderRadius: 10 }]}>
              <Ionicons name="logo-whatsapp" size={16} color="#25d366" />
              <Text style={[styles.contactBtnText, { color: "#25d366" }]}>WhatsApp</Text>
            </Pressable>
            <Pressable style={[styles.contactBtn, { backgroundColor: colors.primary + "20", borderRadius: 10 }]}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={[styles.contactBtnText, { color: colors.primary }]}>Call</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Attendance" value={`${student.attendance}%`} color={student.attendance >= 80 ? "#10b981" : "#f43f5e"} icon="calendar" />
          <StatCard label="Academic" value={`${student.academicScore}%`} color="#0ea5e9" icon="school" />
          <StatCard label="Behavior" value={`${student.behaviorScore}%`} color="#8b5cf6" icon="happy" />
          <StatCard label="Homework" value={`${student.homeworkCompletion}%`} color="#f59e0b" icon="book" />
        </View>

        {/* Performance Overview */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Academic Progress</Text>
          {[
            { label: "Academic Score", value: student.academicScore, color: "#0ea5e9" },
            { label: "Homework Completion", value: student.homeworkCompletion, color: "#8b5cf6" },
            { label: "Attendance Rate", value: student.attendance, color: student.attendance >= 80 ? "#10b981" : "#f43f5e" },
            { label: "Behavior Score", value: student.behaviorScore, color: "#f59e0b" },
          ].map((item) => (
            <View key={item.label} style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.progressValue, { color: item.color }]}>{item.value}%</Text>
              </View>
              <ProgressBar value={item.value} color={item.color} height={8} />
            </View>
          ))}
        </View>

        {/* Fee Status */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.feeTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Fee Status</Text>
            <View style={[styles.feeStatusBadge, { backgroundColor: feeColor + "20" }]}>
              <Text style={[styles.feeStatusText, { color: feeColor }]}>{FEE_LABELS[student.feeStatus]}</Text>
            </View>
          </View>
          {student.outstandingBalance > 0 && (
            <View style={[styles.outstandingBox, { backgroundColor: "#f43f5e10", borderRadius: 10, borderColor: "#f43f5e30" }]}>
              <Ionicons name="alert-circle" size={16} color="#f43f5e" />
              <Text style={[styles.outstandingText, { color: "#f43f5e" }]}>
                Outstanding: {formatPKR(student.outstandingBalance)}
              </Text>
            </View>
          )}
          <Text style={[styles.paymentTitle, { color: colors.mutedForeground }]}>Payment Timeline</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_HISTORY.map((p) => (
              <View key={p.month} style={styles.paymentItem}>
                <View style={[styles.paymentDot, {
                  backgroundColor: p.status === "paid" ? "#10b981" : p.status === "partial" ? "#f59e0b" : "#f43f5e",
                }]} />
                <Text style={[styles.paymentMonth, { color: colors.mutedForeground }]}>{p.month}</Text>
                <Text style={[styles.paymentStatus, {
                  color: p.status === "paid" ? "#10b981" : p.status === "partial" ? "#f59e0b" : "#f43f5e",
                }]}>
                  {p.status === "paid" ? "Paid" : p.status === "partial" ? "Part" : "Due"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Recommendation */}
        <View style={[styles.aiCard, { borderRadius: colors.radius }]}>
          <LinearGradient
            colors={["#1e1040", "#0d1b2e"]}
            style={[styles.aiGrad, { borderRadius: colors.radius }]}
          >
            <View style={styles.aiHeader}>
              <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.aiIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.aiTitle}>AI Recommendation</Text>
            </View>
            <Text style={styles.aiText}>
              {student.riskScore > 60
                ? `${student.name} shows signs of disengagement with ${student.attendance}% attendance and ${student.feeStatus === "overdue" ? "overdue fees" : "partial payment"}. Recommend an urgent parent meeting and payment plan discussion.`
                : student.riskScore > 30
                ? `Monitor ${student.name} closely. Attendance is borderline and fees need attention. A WhatsApp reminder to the guardian may help.`
                : `${student.name} is performing well. Attendance is strong at ${student.attendance}% and academic scores are healthy. Keep up the good work.`}
            </Text>
            <View style={[styles.riskMeter, { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8 }]}>
              <Text style={styles.riskLabel}>Risk Score</Text>
              <View style={styles.riskBarBg}>
                <View style={[styles.riskBarFill, { width: `${student.riskScore}%`, backgroundColor: riskColor }]} />
              </View>
              <Text style={[styles.riskValue, { color: riskColor }]}>{student.riskScore}/100</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 16, paddingBottom: 28, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 16 },
  backBtnInner: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroContent: { alignItems: "center", gap: 8 },
  avatarLarge: { width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  heroName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  heroMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  heroBadges: { flexDirection: "row", gap: 8, marginTop: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  infoCard: { padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { width: 70, fontSize: 12, fontFamily: "Inter_400Regular" },
  infoValue: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  contactBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 12, borderWidth: 1, alignItems: "center", gap: 6 },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  progressItem: { gap: 6 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  progressValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  feeTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  feeStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  feeStatusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  outstandingBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderWidth: 1 },
  outstandingText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  paymentTitle: { fontSize: 12, fontFamily: "Inter_500Medium" },
  paymentRow: { flexDirection: "row", justifyContent: "space-between" },
  paymentItem: { alignItems: "center", gap: 4 },
  paymentDot: { width: 12, height: 12, borderRadius: 6 },
  paymentMonth: { fontSize: 11, fontFamily: "Inter_500Medium" },
  paymentStatus: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  aiCard: { overflow: "hidden" },
  aiGrad: { padding: 16, gap: 12 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  aiTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" },
  aiText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  riskMeter: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10 },
  riskLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)", width: 70 },
  riskBarBg: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" },
  riskBarFill: { height: "100%", borderRadius: 3 },
  riskValue: { fontSize: 12, fontFamily: "Inter_700Bold", width: 45, textAlign: "right" },
});
