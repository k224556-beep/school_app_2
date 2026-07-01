import React, { useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable, FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { ADMISSIONS, type Admission } from "@/constants/demoData";

const STAGE_CONFIG = {
  inquiry: { label: "New Inquiry", color: "#0ea5e9", icon: "mail-outline" as const },
  visit: { label: "Parent Visit", color: "#8b5cf6", icon: "eye-outline" as const },
  followup: { label: "Follow Up", color: "#f59e0b", icon: "refresh-outline" as const },
  confirmed: { label: "Confirmed", color: "#10b981", icon: "checkmark-circle-outline" as const },
};

function AdmissionCard({ item }: { item: Admission }) {
  const colors = useColors();
  const cfg = STAGE_CONFIG[item.stage];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: cfg.color + "40", borderRadius: colors.radius - 4 }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.stageTag, { backgroundColor: cfg.color + "18" }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.stageTagText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>{item.date}</Text>
      </View>
      <Text style={[styles.cardName, { color: colors.foreground }]}>{item.studentName}</Text>
      <Text style={[styles.cardClass, { color: colors.mutedForeground }]}>Applying for: {item.class}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.guardianRow}>
          <Ionicons name="person-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.guardianText, { color: colors.mutedForeground }]}>{item.guardianName}</Text>
        </View>
        <Pressable style={[styles.whatsappBtn, { backgroundColor: "#25d36620" }]}>
          <Ionicons name="logo-whatsapp" size={13} color="#25d366" />
        </Pressable>
      </View>
      {item.notes ? (
        <Text style={[styles.notes, { color: colors.mutedForeground, borderTopColor: colors.border }]} numberOfLines={1}>
          {item.notes}
        </Text>
      ) : null}
    </View>
  );
}

type Stage = "all" | keyof typeof STAGE_CONFIG;

export default function AdmissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const filtered = stage === "all" ? ADMISSIONS : ADMISSIONS.filter((a) => a.stage === stage);
  const conversionRate = Math.round((ADMISSIONS.filter((a) => a.stage === "confirmed").length / ADMISSIONS.length) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Admissions CRM</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{ADMISSIONS.length} leads · {conversionRate}% conversion</Text>
        </View>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Pipeline Overview */}
      <View style={[styles.pipelineRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(Object.keys(STAGE_CONFIG) as Array<keyof typeof STAGE_CONFIG>).map((key, i, arr) => {
          const cfg = STAGE_CONFIG[key];
          const count = ADMISSIONS.filter((a) => a.stage === key).length;
          return (
            <React.Fragment key={key}>
              <Pressable onPress={() => setStage(key)} style={styles.pipelineItem}>
                <View style={[styles.pipelineDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.pipelineCount, { color: stage === key ? cfg.color : colors.foreground }]}>{count}</Text>
                <Text style={[styles.pipelineLabel, { color: stage === key ? cfg.color : colors.mutedForeground }]} numberOfLines={1}>
                  {cfg.label}
                </Text>
              </Pressable>
              {i < arr.length - 1 && (
                <Ionicons name="chevron-forward" size={12} color={colors.border} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Stage Filters */}
      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {(["all", ...Object.keys(STAGE_CONFIG)] as Stage[]).map((s) => {
          const cfg = s === "all" ? null : STAGE_CONFIG[s];
          return (
            <Pressable
              key={s}
              onPress={() => setStage(s)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: stage === s ? (cfg?.color ?? colors.primary) : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: stage === s ? "#fff" : colors.mutedForeground }]}>
                {s === "all" ? "All" : cfg?.label ?? s}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 100, gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <AdmissionCard item={item} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="person-add-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No leads in this stage</Text>
          </View>
        )}
        scrollEnabled
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
  addBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pipelineRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1 },
  pipelineItem: { flex: 1, alignItems: "center", gap: 3 },
  pipelineDot: { width: 8, height: 8, borderRadius: 4 },
  pipelineCount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  pipelineLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  filterRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderBottomWidth: 1 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  card: { padding: 14, borderWidth: 1, gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stageTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  stageTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardClass: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  guardianRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  guardianText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  whatsappBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  notes: { fontSize: 11, fontFamily: "Inter_400Regular", fontStyle: "italic", paddingTop: 6, borderTopWidth: 1 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
