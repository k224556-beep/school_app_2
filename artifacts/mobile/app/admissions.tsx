import React, { useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { ADMISSIONS, type Admission } from "@/constants/demoData";

const STAGE_CONFIG = {
  inquiry: { label: "Inquiry", color: "#0ea5e9", icon: "mail-outline" as const },
  visit: { label: "Visit", color: "#8b5cf6", icon: "eye-outline" as const },
  followup: { label: "Follow Up", color: "#f59e0b", icon: "refresh-outline" as const },
  confirmed: { label: "Confirmed", color: "#10b981", icon: "checkmark-circle-outline" as const },
};

const STAGE_ORDER: Array<keyof typeof STAGE_CONFIG> = ["inquiry", "visit", "followup", "confirmed"];

const SOURCE_ICON: Record<Admission["source"], keyof typeof Ionicons.glyphMap> = {
  "Walk-in": "walk-outline",
  Referral: "people-outline",
  Facebook: "logo-facebook",
  Website: "globe-outline",
  WhatsApp: "logo-whatsapp",
};

function AdmissionDetailModal({ item, onClose, onAdvance }: { item: Admission | null; onClose: () => void; onAdvance: (id: string) => void }) {
  const colors = useColors();
  if (!item) return null;
  const cfg = STAGE_CONFIG[item.stage];
  const isFinal = item.stage === "confirmed";
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalName, { color: colors.foreground }]}>{item.studentName}</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Applying for {item.class}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.modalMetaRow}>
            <View style={[styles.stageTag, { backgroundColor: cfg.color + "18" }]}>
              <Ionicons name={cfg.icon} size={12} color={cfg.color} />
              <Text style={[styles.stageTagText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <View style={[styles.stageTag, { backgroundColor: colors.muted }]}>
              <Ionicons name={SOURCE_ICON[item.source]} size={12} color={colors.mutedForeground} />
              <Text style={[styles.stageTagText, { color: colors.mutedForeground }]}>{item.source}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
            <Ionicons name="person-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{item.guardianName} · {item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>Expected join: {item.expectedJoin}</Text>
          </View>
          {item.notes ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontStyle: "italic" }]}>{item.notes}</Text>
            </View>
          ) : null}

          <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Activity Timeline</Text>
          <View style={styles.timeline}>
            {item.timeline.map((t, i) => (
              <View key={t.label} style={styles.timelineRow}>
                <View style={styles.timelineDotCol}>
                  <View style={[styles.timelineDot, { backgroundColor: cfg.color }]} />
                  {i < item.timeline.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 12 }}>
                  <Text style={[styles.timelineLabel, { color: colors.foreground }]}>{t.label}</Text>
                  <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>{t.date}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.modalActions}>
            <Pressable style={[styles.contactBtn, { backgroundColor: "#25d36620" }]}>
              <Ionicons name="logo-whatsapp" size={16} color="#25d366" />
              <Text style={[styles.contactBtnText, { color: "#25d366" }]}>WhatsApp</Text>
            </Pressable>
            {!isFinal && (
              <Pressable
                style={[styles.contactBtn, { backgroundColor: colors.primary }]}
                onPress={() => { onAdvance(item.id); onClose(); }}
              >
                <Ionicons name="arrow-forward-circle-outline" size={16} color="#fff" />
                <Text style={[styles.contactBtnText, { color: "#fff" }]}>Advance Stage</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function KanbanCard({ item, onPress }: { item: Admission; onPress: () => void }) {
  const colors = useColors();
  const cfg = STAGE_CONFIG[item.stage];
  return (
    <Pressable
      onPress={onPress}
      style={[styles.kCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
    >
      <Text style={[styles.kName, { color: colors.foreground }]} numberOfLines={1}>{item.studentName}</Text>
      <Text style={[styles.kClass, { color: colors.mutedForeground }]}>{item.class}</Text>
      <View style={styles.kFooter}>
        <View style={styles.kSourceRow}>
          <Ionicons name={SOURCE_ICON[item.source]} size={11} color={colors.mutedForeground} />
          <Text style={[styles.kSource, { color: colors.mutedForeground }]}>{item.source}</Text>
        </View>
        <Text style={[styles.kDate, { color: cfg.color }]}>{item.expectedJoin.slice(5)}</Text>
      </View>
    </Pressable>
  );
}

export default function AdmissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [admissions, setAdmissions] = useState<Admission[]>(ADMISSIONS);
  const [selected, setSelected] = useState<Admission | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const conversionRate = Math.round((admissions.filter((a) => a.stage === "confirmed").length / admissions.length) * 100);

  const advanceStage = (id: string) => {
    setAdmissions((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const idx = STAGE_ORDER.indexOf(a.stage);
      if (idx >= STAGE_ORDER.length - 1) return a;
      const nextStage = STAGE_ORDER[idx + 1];
      const cfg = STAGE_CONFIG[nextStage];
      return {
        ...a,
        stage: nextStage,
        timeline: [...a.timeline, {
          label: nextStage === "confirmed" ? "Admission Confirmed" : nextStage === "visit" ? "Campus Visit" : "Follow Up Call",
          date: "2025-03-18",
          done: true,
        }],
      };
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Admissions CRM</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{admissions.length} leads · {conversionRate}% conversion</Text>
        </View>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: bottomPad + 30, gap: 10 }}
      >
        {STAGE_ORDER.map((stageKey) => {
          const cfg = STAGE_CONFIG[stageKey];
          const items = admissions.filter((a) => a.stage === stageKey);
          return (
            <View key={stageKey} style={[styles.column, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <View style={styles.columnHeader}>
                <View style={[styles.columnDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.columnTitle, { color: colors.foreground }]}>{cfg.label}</Text>
                <View style={[styles.columnCount, { backgroundColor: cfg.color + "20" }]}>
                  <Text style={[styles.columnCountText, { color: cfg.color }]}>{items.length}</Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.columnBody}>
                {items.map((item) => (
                  <KanbanCard key={item.id} item={item} onPress={() => setSelected(item)} />
                ))}
                {items.length === 0 && (
                  <Text style={[styles.emptyCol, { color: colors.mutedForeground }]}>No leads</Text>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <AdmissionDetailModal item={selected} onClose={() => setSelected(null)} onAdvance={advanceStage} />
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
  column: { width: 200, padding: 10, maxHeight: "100%" },
  columnHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, paddingHorizontal: 2 },
  columnDot: { width: 8, height: 8, borderRadius: 4 },
  columnTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_700Bold" },
  columnCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  columnCountText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  columnBody: { gap: 8 },
  emptyCol: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 20 },
  kCard: { padding: 10, borderWidth: 1, gap: 5, marginBottom: 8 },
  kName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  kClass: { fontSize: 11, fontFamily: "Inter_400Regular" },
  kFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  kSourceRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  kSource: { fontSize: 10, fontFamily: "Inter_500Medium" },
  kDate: { fontSize: 10, fontFamily: "Inter_700Bold" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { padding: 20, maxHeight: "85%", gap: 10 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start" },
  modalName: { fontSize: 19, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalClose: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  modalMetaRow: { flexDirection: "row", gap: 8 },
  stageTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  stageTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 10 },
  infoText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  timelineTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginTop: 8 },
  timeline: { marginTop: 4 },
  timelineRow: { flexDirection: "row", gap: 10 },
  timelineDotCol: { alignItems: "center", width: 14 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  timelineLine: { flex: 1, width: 2, marginTop: 2 },
  timelineLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  timelineDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  contactBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
