import React, { useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { DASHBOARD_METRICS, MONTHLY_REVENUE, formatPKR } from "@/constants/demoData";
import * as Haptics from "expo-haptics";

const REPORTS = [
  {
    id: "1", title: "Revenue Report", desc: "Monthly fee collection & forecasts",
    icon: "bar-chart" as const, color: "#10b981", period: "March 2025",
  },
  {
    id: "2", title: "Attendance Report", desc: "Class-wise daily & monthly trends",
    icon: "calendar" as const, color: "#0ea5e9", period: "March 2025",
  },
  {
    id: "3", title: "Fee Collection", desc: "Defaulters, recovery & payment status",
    icon: "wallet" as const, color: "#f59e0b", period: "March 2025",
  },
  {
    id: "4", title: "Teacher Report", desc: "Performance, attendance & feedback",
    icon: "people" as const, color: "#8b5cf6", period: "March 2025",
  },
  {
    id: "5", title: "Academic Report", desc: "Student grades & exam results",
    icon: "school" as const, color: "#f43f5e", period: "Spring Term 2025",
  },
  {
    id: "6", title: "Admissions Report", desc: "Leads, conversions & pipeline",
    icon: "person-add" as const, color: "#06b6d4", period: "March 2025",
  },
];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [exporting, setExporting] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handleExport = (id: string, format: "pdf" | "excel") => {
    setExporting(`${id}-${format}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setExporting(null), 2000);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#0f2744", "#0d1b2e"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Reports</Text>
            <Text style={styles.headerSub}>Export & analyze school data</Text>
          </View>
          <Pressable style={[styles.scheduleBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.scheduleBtnText}>Schedule</Text>
          </Pressable>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          {[
            { label: "Revenue", value: formatPKR(DASHBOARD_METRICS.feeCollectionMonth), color: "#10b981" },
            { label: "Attendance", value: `${DASHBOARD_METRICS.attendanceToday}%`, color: "#0ea5e9" },
            { label: "Recovery", value: "91%", color: "#f59e0b" },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: "rgba(255,255,255,0.07)" }]}>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        {/* Quick Export */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available Reports</Text>
        <View style={{ gap: 10 }}>
          {REPORTS.map((report) => {
            const pdfKey = `${report.id}-pdf`;
            const excelKey = `${report.id}-excel`;
            return (
              <View
                key={report.id}
                style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <View style={[styles.reportIcon, { backgroundColor: report.color + "20" }]}>
                  <Ionicons name={report.icon} size={20} color={report.color} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={[styles.reportTitle, { color: colors.foreground }]}>{report.title}</Text>
                  <Text style={[styles.reportDesc, { color: colors.mutedForeground }]}>{report.desc}</Text>
                  <Text style={[styles.reportPeriod, { color: report.color }]}>{report.period}</Text>
                </View>
                <View style={styles.exportBtns}>
                  <Pressable
                    onPress={() => handleExport(report.id, "pdf")}
                    style={[styles.exportBtn, {
                      backgroundColor: exporting === pdfKey ? "#f43f5e" : "#f43f5e15",
                      borderRadius: 8,
                    }]}
                  >
                    <Ionicons
                      name={exporting === pdfKey ? "checkmark" : "document-text-outline"}
                      size={13}
                      color={exporting === pdfKey ? "#fff" : "#f43f5e"}
                    />
                    <Text style={[styles.exportBtnText, { color: exporting === pdfKey ? "#fff" : "#f43f5e" }]}>PDF</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleExport(report.id, "excel")}
                    style={[styles.exportBtn, {
                      backgroundColor: exporting === excelKey ? "#10b981" : "#10b98115",
                      borderRadius: 8,
                    }]}
                  >
                    <Ionicons
                      name={exporting === excelKey ? "checkmark" : "grid-outline"}
                      size={13}
                      color={exporting === excelKey ? "#fff" : "#10b981"}
                    />
                    <Text style={[styles.exportBtnText, { color: exporting === excelKey ? "#fff" : "#10b981" }]}>XLS</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Monthly Revenue Snapshot */}
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Revenue Snapshot</Text>
          <View style={[styles.snapshotCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {MONTHLY_REVENUE.map((m, i) => {
              const maxAmt = Math.max(...MONTHLY_REVENUE.map((r) => r.amount));
              const pct = (m.amount / maxAmt) * 100;
              const isLast = i === MONTHLY_REVENUE.length - 1;
              return (
                <View key={m.month} style={styles.snapshotRow}>
                  <Text style={[styles.snapshotMonth, { color: isLast ? colors.primary : colors.mutedForeground }]}>{m.month}</Text>
                  <View style={[styles.snapshotBarBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.snapshotBarFill, {
                      width: `${pct}%`,
                      backgroundColor: isLast ? colors.primary : (colors.mutedForeground + "60"),
                    }]} />
                  </View>
                  <Text style={[styles.snapshotValue, { color: isLast ? colors.primary : colors.mutedForeground }]}>
                    {formatPKR(m.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Scheduled Reports */}
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Scheduled Reports</Text>
          {[
            { label: "Weekly Fee Summary", freq: "Every Monday · 8:00 AM", icon: "calendar-outline" as const, color: "#f59e0b" },
            { label: "Monthly Revenue Report", freq: "1st of each month", icon: "bar-chart-outline" as const, color: "#10b981" },
            { label: "Attendance Digest", freq: "Daily · 4:00 PM", icon: "people-outline" as const, color: "#0ea5e9" },
          ].map((s) => (
            <View
              key={s.label}
              style={[styles.scheduledRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
            >
              <View style={[styles.scheduledIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scheduledLabel, { color: colors.foreground }]}>{s.label}</Text>
                <Text style={[styles.scheduledFreq, { color: colors.mutedForeground }]}>{s.freq}</Text>
              </View>
              <View style={[styles.activeBadge, { backgroundColor: "#10b98120" }]}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  scheduleBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  scheduleBtnText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center" },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  reportCard: { flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1, gap: 12 },
  reportIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reportInfo: { flex: 1, gap: 3 },
  reportTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reportDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reportPeriod: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  exportBtns: { gap: 6 },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  exportBtnText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  snapshotCard: { padding: 16, borderWidth: 1, gap: 10 },
  snapshotRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  snapshotMonth: { width: 30, fontSize: 12, fontFamily: "Inter_500Medium" },
  snapshotBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  snapshotBarFill: { height: "100%", borderRadius: 4 },
  snapshotValue: { width: 80, fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  scheduledRow: { flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  scheduledIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  scheduledLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scheduledFreq: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  activeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#10b981" },
});
