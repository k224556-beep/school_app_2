import React, { useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable, FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { DonutChart, ProgressBar } from "@/components/Charts";
import { TOP_DEFAULTERS, FEE_RECOVERY, MONTHLY_REVENUE, STUDENTS, formatPKR, getRecoveryScore } from "@/constants/demoData";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function FeesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sending, setSending] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const nonPaid = STUDENTS.filter((s) => s.feeStatus !== "paid");
  const avgRecovery = Math.round(nonPaid.reduce((acc, s) => acc + getRecoveryScore(s), 0) / nonPaid.length);
  const highCount = nonPaid.filter((s) => getRecoveryScore(s) >= 70).length;

  const handleReminder = (type: string) => {
    setSending(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setSending(null), 2000);
  };

  const recoveryPercent = Math.round((FEE_RECOVERY.collected / FEE_RECOVERY.expected) * 100);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 100, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Fee Recovery</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>March 2025</Text>
        </View>
        <Pressable style={[styles.exportBtn, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          <Ionicons name="download-outline" size={16} color={colors.foreground} />
          <Text style={[styles.exportText, { color: colors.foreground }]}>Export</Text>
        </Pressable>
      </View>

      {/* AI Recovery Card */}
      <Pressable
        onPress={() => router.push("/fee-recovery")}
        style={[styles.aiCard, { borderRadius: colors.radius }]}
      >
        <LinearGradient
          colors={["#064e3b", "#065f46"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.aiCardInner, { borderRadius: colors.radius }]}
        >
          <View style={styles.aiCardLeft}>
            <View style={styles.aiTitleRow}>
              <Ionicons name="sparkles" size={14} color="#10b981" />
              <Text style={styles.aiCardLabel}>AI-Powered</Text>
            </View>
            <Text style={styles.aiCardTitle}>Fee Recovery Score</Text>
            <Text style={styles.aiCardSub}>
              {highCount} of {nonPaid.length} unpaid parents likely to pay this week
            </Text>
          </View>
          <View style={styles.aiCardRight}>
            <Text style={styles.aiScore}>{avgRecovery}%</Text>
            <Text style={styles.aiScoreLabel}>avg score</Text>
            <View style={styles.aiViewBtn}>
              <Text style={styles.aiViewTxt}>View</Text>
              <Ionicons name="arrow-forward" size={12} color="#10b981" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      <Pressable
        onPress={() => router.push("/fee-vouchers")}
        style={[styles.feeActionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
      >
        <View style={styles.feeActionLeft}>
          <Text style={[styles.feeActionTitle, { color: colors.foreground }]}>Fee Vouchers</Text>
          <Text style={[styles.feeActionSubtitle, { color: colors.mutedForeground }]}>Generate QR-enabled challans and bulk export PDFs.</Text>
        </View>
        <Ionicons name="receipt" size={24} color={colors.primary} />
      </Pressable>

      {/* Donut Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={styles.donutSection}>
          <DonutChart
            percentage={recoveryPercent}
            size={140}
            strokeWidth={16}
            color={recoveryPercent >= 90 ? "#10b981" : recoveryPercent >= 75 ? "#f59e0b" : "#f43f5e"}
            label={`${recoveryPercent}%`}
            sublabel="Collected"
          />
          <View style={styles.donutStats}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
              <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Paid</Text>
              <Text style={[styles.legendValue, { color: colors.foreground }]}>{FEE_RECOVERY.paid}%</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
              <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Partial</Text>
              <Text style={[styles.legendValue, { color: colors.foreground }]}>{FEE_RECOVERY.partial}%</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#f43f5e" }]} />
              <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>Overdue</Text>
              <Text style={[styles.legendValue, { color: colors.foreground }]}>{FEE_RECOVERY.overdue}%</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.revenueRow}>
          <View style={styles.revenueItem}>
            <Text style={[styles.revenueLabel, { color: colors.mutedForeground }]}>Expected</Text>
            <Text style={[styles.revenueValue, { color: colors.foreground }]}>{formatPKR(FEE_RECOVERY.expected)}</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={[styles.revenueLabel, { color: colors.mutedForeground }]}>Collected</Text>
            <Text style={[styles.revenueValue, { color: "#10b981" }]}>{formatPKR(FEE_RECOVERY.collected)}</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={[styles.revenueLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
            <Text style={[styles.revenueValue, { color: "#f43f5e" }]}>{formatPKR(FEE_RECOVERY.outstanding)}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bars by Class */}
      <View style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Collection by Grade</Text>
        {[
          { grade: "Grade 6", pct: 72, color: "#f43f5e" },
          { grade: "Grade 7", pct: 68, color: "#f59e0b" },
          { grade: "Grade 8", pct: 88, color: "#10b981" },
          { grade: "Grade 9", pct: 95, color: "#10b981" },
          { grade: "Grade 10", pct: 97, color: "#10b981" },
          { grade: "Grade 5", pct: 91, color: "#10b981" },
          { grade: "Lower Grades", pct: 94, color: "#10b981" },
        ].map((item) => (
          <View key={item.grade} style={styles.gradeRow}>
            <Text style={[styles.gradeLabel, { color: colors.mutedForeground }]}>{item.grade}</Text>
            <View style={styles.gradeBar}>
              <ProgressBar value={item.pct} color={item.color} height={6} />
            </View>
            <Text style={[styles.gradePct, { color: item.color }]}>{item.pct}%</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        {[
          { label: "WhatsApp", icon: "logo-whatsapp" as const, color: "#25d366", action: "whatsapp" },
          { label: "Reminder", icon: "mail-outline" as const, color: "#0ea5e9", action: "reminder" },
          { label: "Bulk SMS", icon: "chatbubbles-outline" as const, color: "#8b5cf6", action: "bulk" },
        ].map((btn) => (
          <Pressable
            key={btn.action}
            onPress={() => handleReminder(btn.action)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: sending === btn.action ? btn.color : colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius - 4,
              },
            ]}
          >
            <Ionicons
              name={sending === btn.action ? "checkmark-circle" : btn.icon}
              size={20}
              color={sending === btn.action ? "#fff" : btn.color}
            />
            <Text style={[styles.actionLabel, { color: sending === btn.action ? "#fff" : colors.foreground }]}>
              {sending === btn.action ? "Sent!" : btn.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Top Defaulters */}
      <View style={{ marginTop: 4 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Top Defaulters</Text>
          <View style={[styles.countBadge, { backgroundColor: "#f43f5e20" }]}>
            <Text style={styles.countText}>{TOP_DEFAULTERS.length}</Text>
          </View>
        </View>
        {TOP_DEFAULTERS.map((student) => (
          <View
            key={student.id}
            style={[styles.defaulterRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
          >
            <View style={[styles.defaulterAvatar, { backgroundColor: "#f43f5e20" }]}>
              <Text style={styles.defaulterInitials}>
                {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </Text>
            </View>
            <View style={styles.defaulterInfo}>
              <Text style={[styles.defaulterName, { color: colors.foreground }]}>{student.name}</Text>
              <Text style={[styles.defaulterClass, { color: colors.mutedForeground }]}>{student.class}-{student.section}</Text>
            </View>
            <View style={styles.defaulterRight}>
              <Text style={styles.defaulterAmount}>{formatPKR(student.outstandingBalance)}</Text>
              <Text style={[styles.defaulterLabel, { color: colors.mutedForeground }]}>outstanding</Text>
            </View>
            <Pressable
              onPress={() => handleReminder(student.id)}
              style={[styles.reminderBtn, { backgroundColor: "#25d36620" }]}
            >
              <Ionicons name={sending === student.id ? "checkmark" : "logo-whatsapp"} size={14} color="#25d366" />
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  exportText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: { padding: 18, borderWidth: 1, marginBottom: 14 },
  donutSection: { flexDirection: "row", alignItems: "center", gap: 20 },
  donutStats: { flex: 1, gap: 12 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  legendValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  divider: { height: 1, marginVertical: 14 },
  revenueRow: { flexDirection: "row" },
  revenueItem: { flex: 1, alignItems: "center" },
  revenueLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  revenueValue: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  classCard: { padding: 16, borderWidth: 1, marginBottom: 14, gap: 12 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  gradeLabel: { width: 90, fontSize: 12, fontFamily: "Inter_500Medium" },
  gradeBar: { flex: 1 },
  gradePct: { width: 36, fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "right" },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderWidth: 1, gap: 6 },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#f43f5e" },
  defaulterRow: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, marginBottom: 6, gap: 10 },
  defaulterAvatar: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  defaulterInitials: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#f43f5e" },
  defaulterInfo: { flex: 1 },
  defaulterName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  defaulterClass: { fontSize: 11, fontFamily: "Inter_400Regular" },
  defaulterRight: { alignItems: "flex-end" },
  defaulterAmount: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#f43f5e" },
  defaulterLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  reminderBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statBox: { flex: 1, alignItems: "center", padding: 12, borderWidth: 1 },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  aiCard: { marginBottom: 14, overflow: "hidden" },
  aiCardInner: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  aiCardLeft: { flex: 1, gap: 5 },
  aiTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  aiCardLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#10b981" },
  aiCardTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  aiCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", lineHeight: 17 },
  aiCardRight: { alignItems: "center", gap: 2 },
  aiScore: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#10b981" },
  aiScoreLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  aiViewBtn: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  aiViewTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#10b981" },
  feeActionCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderWidth: 1, marginBottom: 14 },
  feeActionLeft: { flex: 1, gap: 4 },
  feeActionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  feeActionSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
