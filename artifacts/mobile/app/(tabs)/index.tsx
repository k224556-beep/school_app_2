import React, { useRef, useEffect } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable,
  FlatList, useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { MetricCard } from "@/components/MetricCard";
import { AIInsightCard } from "@/components/AIInsightCard";
import {
  DASHBOARD_METRICS, AI_INSIGHTS, MONTHLY_REVENUE, UPCOMING_EVENTS, BIRTHDAYS,
  formatPKR,
} from "@/constants/demoData";
import { BarChart } from "@/components/Charts";

function SectionHeader({ title, action }: { title: string; action?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && (
        <Pressable>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const METRICS = [
  {
    title: "Total Students", value: "900", color: "#6366f1",
    icon: "people" as const, gradientStart: "#6366f1", gradientEnd: "#8b5cf6", trend: 4.2,
  },
  {
    title: "Attendance Today", value: `${DASHBOARD_METRICS.attendanceToday}%`, color: "#0ea5e9",
    icon: "calendar" as const, gradientStart: "#0ea5e9", gradientEnd: "#0284c7", trend: 1.5,
  },
  {
    title: "Fee Collection", value: formatPKR(DASHBOARD_METRICS.feeCollectionMonth), color: "#10b981",
    icon: "wallet" as const, gradientStart: "#10b981", gradientEnd: "#059669", trend: -8.0,
  },
  {
    title: "Expected Revenue", value: formatPKR(DASHBOARD_METRICS.expectedRevenue), color: "#f59e0b",
    icon: "trending-up" as const, gradientStart: "#f59e0b", gradientEnd: "#d97706", trend: 2.1,
  },
  {
    title: "Outstanding Fees", value: formatPKR(DASHBOARD_METRICS.outstandingFees), color: "#f43f5e",
    icon: "alert-circle" as const, gradientStart: "#f43f5e", gradientEnd: "#e11d48",
  },
  {
    title: "Admissions (Mar)", value: `${DASHBOARD_METRICS.admissionsMonth}`, color: "#8b5cf6",
    icon: "school" as const, gradientStart: "#8b5cf6", gradientEnd: "#7c3aed", trend: 16.7,
  },
  {
    title: "Teacher Attendance", value: `${DASHBOARD_METRICS.teacherAttendance}%`, color: "#06b6d4",
    icon: "person" as const, gradientStart: "#06b6d4", gradientEnd: "#0891b2",
  },
  {
    title: "Parent Satisfaction", value: `${DASHBOARD_METRICS.parentSatisfaction}%`, color: "#ec4899",
    icon: "heart" as const, gradientStart: "#ec4899", gradientEnd: "#db2777",
  },
  {
    title: "Monthly Growth", value: `+${DASHBOARD_METRICS.monthlyGrowth}%`, color: "#10b981",
    icon: "bar-chart" as const, gradientStart: "#10b981", gradientEnd: "#6366f1",
  },
];

const QUICK_ACTIONS: Array<{ label: string; icon: keyof typeof Ionicons.glyphMap; color: string; route: string }> = [
  { label: "Mark Attendance", icon: "checkbox", color: "#f59e0b", route: "/attendance" },
  { label: "New Admission", icon: "person-add", color: "#8b5cf6", route: "/admissions" },
  { label: "Send Reminder", icon: "logo-whatsapp", color: "#25d366", route: "/whatsapp" },
  { label: "AI Question Paper", icon: "sparkles", color: "#a855f7", route: "/ai-tools" },
];

const HEATMAP_WEEKS = 12;
function generateHeatmapData(seed: number) {
  const days: number[] = [];
  let s = seed;
  for (let i = 0; i < HEATMAP_WEEKS * 7; i++) {
    s = (s * 9301 + 49297) % 233280;
    days.push(70 + (s / 233280) * 30);
  }
  return days;
}
const HEATMAP_DATA = generateHeatmapData(42);
function heatColor(value: number) {
  if (value >= 95) return "#10b981";
  if (value >= 88) return "#34d399cc";
  if (value >= 80) return "#f59e0b99";
  return "#f43f5e99";
}

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslate.value = withSpring(0, { damping: 14 });
  }, [headerOpacity, headerTranslate]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View style={[headerStyle, styles.headerSection]}>
        <LinearGradient
          colors={isDark ? ["#0d1b2e", "#060d1f"] : ["#0f2744", "#0d4a6b"]}
          style={[styles.headerGrad, { borderRadius: colors.radius + 4 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Good Morning,</Text>
              <Text style={styles.headerName}>Principal Ahmed</Text>
              <Text style={styles.headerDate}>Tuesday, March 18 · Spring Term</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerBtn}>
                <View style={styles.notifDot} />
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.headerBtn}>
                <Ionicons name="search-outline" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { backgroundColor: "rgba(16,185,129,0.2)" }]}>
              <Ionicons name="star" size={12} color="#10b981" />
              <Text style={styles.scoreText}>School Growth Score</Text>
              <Text style={styles.scoreValue}>87/100</Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: "rgba(245,158,11,0.2)" }]}>
              <Ionicons name="analytics" size={12} color="#f59e0b" />
              <Text style={styles.scoreText}>Fee Recovery</Text>
              <Text style={styles.scoreValue}>91%</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((qa) => (
            <Pressable
              key={qa.label}
              onPress={() => router.push(qa.route as never)}
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: qa.color + "20" }]}>
                <Ionicons name={qa.icon} size={18} color={qa.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.foreground }]} numberOfLines={2}>{qa.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Overview Metrics */}
      <View style={styles.section}>
        <SectionHeader title="School Overview" action="See All" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll}>
          {METRICS.map((m, i) => (
            <MetricCard key={m.title} {...m} index={i} />
          ))}
        </ScrollView>
      </View>

      {/* AI Insights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.aiTitleRow}>
            <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.aiIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="sparkles" size={14} color="#fff" />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Insights</Text>
          </View>
          <Pressable>
            <Text style={[styles.sectionAction, { color: colors.primary }]}>All Insights</Text>
          </Pressable>
        </View>
        {AI_INSIGHTS.map((insight, i) => (
          <AIInsightCard key={insight.id} insight={insight} index={i} />
        ))}
      </View>

      {/* Revenue Chart */}
      <View style={styles.section}>
        <SectionHeader title="Monthly Revenue" action="Full Report" />
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.chartMeta}>
            <View>
              <Text style={[styles.chartBig, { color: colors.foreground }]}>{formatPKR(DASHBOARD_METRICS.feeCollectionMonth)}</Text>
              <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>March 2025 collection</Text>
            </View>
            <View style={[styles.trendPill, { backgroundColor: "#f43f5e20" }]}>
              <Ionicons name="trending-down" size={12} color="#f43f5e" />
              <Text style={[styles.trendPillText, { color: "#f43f5e" }]}>-8% vs Feb</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart data={MONTHLY_REVENUE} height={140} activeColor={colors.primary} />
          </ScrollView>
        </View>
      </View>

      {/* Attendance Heatmap */}
      <View style={styles.section}>
        <SectionHeader title="Attendance Heatmap" action="12 Weeks" />
        <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.heatmapGrid}>
              {Array.from({ length: HEATMAP_WEEKS }).map((_, week) => (
                <View key={week} style={styles.heatmapCol}>
                  {Array.from({ length: 7 }).map((_, day) => {
                    const value = HEATMAP_DATA[week * 7 + day];
                    return <View key={day} style={[styles.heatmapCell, { backgroundColor: heatColor(value) }]} />;
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.heatmapLegend}>
            <Text style={[styles.heatmapLegendText, { color: colors.mutedForeground }]}>Less</Text>
            {["#f43f5e99", "#f59e0b99", "#34d399cc", "#10b981"].map((c) => (
              <View key={c} style={[styles.heatmapLegendDot, { backgroundColor: c }]} />
            ))}
            <Text style={[styles.heatmapLegendText, { color: colors.mutedForeground }]}>More</Text>
          </View>
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <SectionHeader title="Upcoming Events" action="Calendar" />
        <View style={[styles.eventsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {UPCOMING_EVENTS.map((event, i) => {
            const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
              event: "flag", exam: "document-text", fee: "wallet", meeting: "people", holiday: "sunny",
            };
            const colorMap: Record<string, string> = {
              event: "#8b5cf6", exam: "#0ea5e9", fee: "#f59e0b", meeting: "#10b981", holiday: "#f43f5e",
            };
            return (
              <View key={event.id} style={[styles.eventRow, i < UPCOMING_EVENTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.eventIconWrap, { backgroundColor: (colorMap[event.type] ?? "#6366f1") + "20" }]}>
                  <Ionicons name={iconMap[event.type] ?? "calendar"} size={14} color={colorMap[event.type] ?? "#6366f1"} />
                </View>
                <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={1}>{event.title}</Text>
                <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{event.date}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Birthday Alerts */}
      <View style={styles.section}>
        <SectionHeader title="Birthday Alerts" />
        {BIRTHDAYS.map((b) => (
          <View key={b.name} style={[styles.birthdayRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
            <View style={[styles.birthdayIcon, { backgroundColor: "#ec489920" }]}>
              <Ionicons name="gift-outline" size={18} color="#ec4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.birthdayName, { color: colors.foreground }]}>{b.name}</Text>
              <Text style={[styles.birthdayClass, { color: colors.mutedForeground }]}>{b.class}</Text>
            </View>
            <View style={[styles.birthdayBadge, { backgroundColor: "#ec489920" }]}>
              <Text style={styles.birthdayBadgeText}>{b.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  headerSection: { marginBottom: 20 },
  headerGrad: { padding: 20, gap: 14 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerGreeting: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  headerName: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  headerDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 4 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  notifDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#f43f5e", position: "absolute", top: 8, right: 8, zIndex: 1 },
  scoreRow: { flexDirection: "row", gap: 10 },
  scoreBadge: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  scoreText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)", flex: 1 },
  scoreValue: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionAction: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  metricsScroll: { marginHorizontal: -16, paddingLeft: 16 },
  aiTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  chartCard: { padding: 16, borderWidth: 1, gap: 16 },
  chartMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  chartBig: { fontSize: 22, fontFamily: "Inter_700Bold" },
  chartSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  trendPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  eventsCard: { borderWidth: 1, overflow: "hidden" },
  eventRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  eventIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  eventTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  eventDate: { fontSize: 12, fontFamily: "Inter_500Medium" },
  birthdayRow: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, marginBottom: 6, gap: 10 },
  birthdayIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  birthdayName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  birthdayClass: { fontSize: 11, fontFamily: "Inter_400Regular" },
  birthdayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  birthdayBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#ec4899" },
  quickActionsRow: { flexDirection: "row", gap: 8 },
  quickAction: { flex: 1, padding: 10, borderWidth: 1, alignItems: "center", gap: 6 },
  quickActionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  heatmapCard: { padding: 16, borderWidth: 1, gap: 12 },
  heatmapGrid: { flexDirection: "row", gap: 3 },
  heatmapCol: { gap: 3 },
  heatmapCell: { width: 12, height: 12, borderRadius: 3 },
  heatmapLegend: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end" },
  heatmapLegendDot: { width: 10, height: 10, borderRadius: 3 },
  heatmapLegendText: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
