import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet, Text, View, Platform, Pressable, FlatList, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { STUDENTS } from "@/constants/demoData";

type AttendanceStatus = "present" | "absent" | "late" | "unmarked";

const STATUS_CONFIG: Record<AttendanceStatus, { color: string; bg: string; iconName: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap; label: string }> = {
  present:  { color: "#10b981", bg: "#10b98125", iconName: "checkmark-circle", label: "Present" },
  late:     { color: "#f59e0b", bg: "#f59e0b25", iconName: "time",             label: "Late"    },
  absent:   { color: "#f43f5e", bg: "#f43f5e25", iconName: "close-circle",     label: "Absent"  },
  unmarked: { color: "#64748b", bg: "#64748b18", iconName: "ellipse-outline",  label: "—"       },
};

const NEXT_STATUS: Record<AttendanceStatus, AttendanceStatus> = {
  unmarked: "present",
  present: "late",
  late: "absent",
  absent: "unmarked",
};

const CLASSES = [
  "Grade 9", "Grade 8", "Grade 7", "Grade 6",
  "Grade 10", "Grade 5", "Grade 4", "Grade 3",
  "Grade 2", "Grade 1", "KG", "Nursery",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function AttendanceAvatar({
  name, status, onTap,
}: { name: string; status: AttendanceStatus; onTap: () => void }) {
  const cfg = STATUS_CONFIG[status];

  return (
    <Pressable
      onPress={onTap}
      style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.7 }]}
    >
      <View style={[
        styles.avatar,
        { backgroundColor: cfg.bg, borderColor: cfg.color, borderWidth: status === "unmarked" ? 1 : 2 },
      ]}>
        <Text style={[styles.avatarInitials, { color: cfg.color }]}>{getInitials(name)}</Text>
        {status !== "unmarked" && (
          <View style={[styles.statusDot, { backgroundColor: cfg.color }]}>
            <Ionicons name={cfg.iconName} size={9} color="#fff" />
          </View>
        )}
      </View>
      <Text style={styles.avatarName} numberOfLines={1}>
        {name.split(" ")[0]}
      </Text>
    </Pressable>
  );
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [submitted, setSubmitted] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  const classStudents = useMemo(
    () => STUDENTS.filter((s) => s.class === selectedClass).slice(0, 28),
    [selectedClass]
  );

  const getStatus = useCallback(
    (id: string): AttendanceStatus => statuses[id] ?? "unmarked",
    [statuses]
  );

  const handleTap = useCallback((id: string) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: NEXT_STATUS[prev[id] ?? "unmarked"],
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const counts = useMemo(() => {
    const present = classStudents.filter((s) => getStatus(s.id) === "present").length;
    const late    = classStudents.filter((s) => getStatus(s.id) === "late").length;
    const absent  = classStudents.filter((s) => getStatus(s.id) === "absent").length;
    const unmarked = classStudents.filter((s) => getStatus(s.id) === "unmarked").length;
    const pct = classStudents.length > 0
      ? Math.round(((present + late) / classStudents.length) * 100)
      : 0;
    return { present, late, absent, unmarked, marked: present + late + absent, pct };
  }, [statuses, classStudents, getStatus]);

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => { next[s.id] = status; });
    setStatuses((prev) => ({ ...prev, ...next }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const today = "Tuesday, March 18";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#0a1628", "#0d1b2e"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSub}>{today}</Text>
          </View>
          <View style={styles.counterRing}>
            <Text style={styles.counterPct}>{counts.pct}%</Text>
            <Text style={styles.counterLabel}>present</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { label: "Present", count: counts.present, color: "#10b981" },
            { label: "Late",    count: counts.late,    color: "#f59e0b" },
            { label: "Absent",  count: counts.absent,  color: "#f43f5e" },
            { label: "Left",    count: counts.unmarked, color: "#64748b" },
          ].map((s) => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: s.color + "18" }]}>
              <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
              <Text style={[styles.statLabel, { color: s.color + "cc" }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Class Picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.classPicker, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        {CLASSES.map((cls) => (
          <Pressable
            key={cls}
            onPress={() => { setSelectedClass(cls); setStatuses({}); setSubmitted(false); }}
            style={[
              styles.classPill,
              { backgroundColor: selectedClass === cls ? colors.primary : colors.muted, borderRadius: 20 },
            ]}
          >
            <Text style={[styles.classPillText, { color: selectedClass === cls ? "#fff" : colors.mutedForeground }]}>
              {cls}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={[styles.quickRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => markAll("present")} style={[styles.quickBtn, { backgroundColor: "#10b98118" }]}>
          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
          <Text style={[styles.quickTxt, { color: "#10b981" }]}>All Present</Text>
        </Pressable>
        <Pressable onPress={() => markAll("absent")} style={[styles.quickBtn, { backgroundColor: "#f43f5e18" }]}>
          <Ionicons name="close-circle" size={14} color="#f43f5e" />
          <Text style={[styles.quickTxt, { color: "#f43f5e" }]}>All Absent</Text>
        </Pressable>
        <Pressable onPress={() => markAll("unmarked")} style={[styles.quickBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="refresh" size={14} color={colors.mutedForeground} />
          <Text style={[styles.quickTxt, { color: colors.mutedForeground }]}>Reset</Text>
        </Pressable>
      </View>

      {/* Legend hint */}
      <View style={[styles.legendBar, { borderBottomColor: colors.border }]}>
        {(["present","late","absent"] as AttendanceStatus[]).map((s) => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_CONFIG[s].color }]} />
            <Text style={[styles.legendTxt, { color: colors.mutedForeground }]}>{STATUS_CONFIG[s].label}</Text>
          </View>
        ))}
        <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>Tap to cycle</Text>
      </View>

      {/* Avatar Grid */}
      <FlatList
        data={classStudents}
        keyExtractor={(s) => s.id}
        numColumns={5}
        contentContainerStyle={{ padding: 14, paddingBottom: bottomPad + 130 }}
        columnWrapperStyle={{ gap: 4, justifyContent: "flex-start", marginBottom: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AttendanceAvatar
            name={item.name}
            status={getStatus(item.id)}
            onTap={() => handleTap(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTxt, { color: colors.mutedForeground }]}>No students in {selectedClass}</Text>
          </View>
        )}
      />

      {/* Submit Bar */}
      <View style={[styles.submitBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        <Text style={[styles.submitInfo, { color: colors.mutedForeground }]}>
          {counts.marked}/{classStudents.length} marked · {classStudents.length - counts.marked} remaining
        </Text>
        <Pressable
          onPress={handleSubmit}
          style={[styles.submitBtn, { backgroundColor: submitted ? "#10b981" : colors.primary }]}
        >
          <Ionicons name={submitted ? "checkmark" : "cloud-upload-outline"} size={18} color="#fff" />
          <Text style={styles.submitBtnTxt}>
            {submitted ? "Submitted! Parents notified" : "Submit & Notify Parents"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  counterRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 3, borderColor: "#10b981", alignItems: "center", justifyContent: "center" },
  counterPct: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#10b981" },
  counterLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  statsStrip: { flexDirection: "row", gap: 8 },
  statChip: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, gap: 2 },
  statCount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  classPicker: { maxHeight: 60, borderBottomWidth: 1 },
  classPill: { paddingHorizontal: 14, paddingVertical: 7 },
  classPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  quickRow: { flexDirection: "row", padding: 10, gap: 8, borderBottomWidth: 1 },
  quickBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 10 },
  quickTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  legendBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, gap: 12, borderBottomWidth: 1 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, fontFamily: "Inter_500Medium" },
  tapHint: { marginLeft: "auto", fontSize: 11, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  avatarWrap: { width: "20%", alignItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", position: "relative" },
  avatarInitials: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statusDot: { position: "absolute", bottom: -3, right: -3, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#0d1b2e" },
  avatarName: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 5, textAlign: "center", maxWidth: 56, color: "#94a3b8" },
  submitBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, gap: 6, position: "absolute", bottom: 0, left: 0, right: 0 },
  submitInfo: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  submitBtnTxt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTxt: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
