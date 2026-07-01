import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated, FlatList, Platform, Pressable, ScrollView,
  StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { STUDENTS, formatPKR } from "@/constants/demoData";

type SendStatus = "queued" | "sending" | "sent" | "delivered" | "read" | "failed";

interface ReminderRow {
  id: string;
  studentName: string;
  guardianName: string;
  phone: string;
  class: string;
  amount: number;
  status: SendStatus;
}

const OVERDUE_STUDENTS = STUDENTS
  .filter((s) => s.feeStatus === "overdue")
  .slice(0, 18)
  .map((s): ReminderRow => ({
    id: s.id,
    studentName: s.name,
    guardianName: s.guardian,
    phone: s.phone,
    class: s.class,
    amount: s.outstandingBalance,
    status: "queued",
  }));

const MESSAGE_TEMPLATE = (name: string, amount: number, cls: string) =>
  `Assalam-o-Alaikum ${name} Sahib,\n\nYe reminder hai ke aapke bete/beti ki school fees (${cls}) abhi pending hai.\n\nAmount Due: *${formatPKR(amount)}*\n\nMeherbani farma ke jald fees jama karwa dein. Kisi bhi sawal ke liye school office se rabta karein.\n\nShukria\nThe Educators School, Lahore\n_Powered by SchoolIQ_`;

function StatusIcon({ status }: { status: SendStatus }) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === "sending") {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [status, spinAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  if (status === "queued") {
    return <Ionicons name="time-outline" size={14} color="#94a3b8" />;
  }
  if (status === "sending") {
    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons name="reload-outline" size={14} color="#94a3b8" />
      </Animated.View>
    );
  }
  if (status === "sent") {
    return <Ionicons name="checkmark" size={14} color="#94a3b8" />;
  }
  if (status === "delivered") {
    return <Ionicons name="checkmark-done" size={14} color="#94a3b8" />;
  }
  if (status === "read") {
    return <Ionicons name="checkmark-done" size={14} color="#53bdeb" />;
  }
  if (status === "failed") {
    return <Ionicons name="close-circle" size={14} color="#f43f5e" />;
  }
  return null;
}

const STATUS_LABEL: Record<SendStatus, string> = {
  queued: "Queued",
  sending: "Sending...",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Failed",
};

const STATUS_COLOR: Record<SendStatus, string> = {
  queued: "#64748b",
  sending: "#f59e0b",
  sent: "#94a3b8",
  delivered: "#94a3b8",
  read: "#53bdeb",
  failed: "#f43f5e",
};

function ReminderCard({ row, index }: { row: ReminderRow; index: number }) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const isActive = row.status !== "queued";
  const borderColor = row.status === "read" ? "#53bdeb40" : row.status === "failed" ? "#f43f5e40" : colors.border;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor, borderRadius: colors.radius - 4 }]}>
        {/* Left: initials */}
        <View style={[styles.avatar, {
          backgroundColor: isActive ? "#25d36620" : colors.muted,
        }]}>
          <Ionicons
            name="logo-whatsapp"
            size={16}
            color={isActive ? "#25d366" : colors.mutedForeground}
          />
        </View>

        {/* Middle: info */}
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.guardianName, { color: colors.foreground }]} numberOfLines={1}>
            {row.guardianName}
          </Text>
          <Text style={[styles.studentInfo, { color: colors.mutedForeground }]} numberOfLines={1}>
            {row.studentName} · {row.class}
          </Text>
          <Text style={[styles.phone, { color: colors.mutedForeground }]}>{row.phone}</Text>
        </View>

        {/* Right: amount + status */}
        <View style={styles.right}>
          <Text style={[styles.amount, { color: "#f43f5e" }]}>{formatPKR(row.amount)}</Text>
          <View style={styles.statusRow}>
            <StatusIcon status={row.status} />
            <Text style={[styles.statusText, { color: STATUS_COLOR[row.status] }]}>
              {STATUS_LABEL[row.status]}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const SEND_SEQUENCE: SendStatus[] = ["sending", "sent", "delivered", "read"];
const SEQUENCE_DELAYS = [0, 600, 1400, 2600];

export default function WhatsAppScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [rows, setRows] = useState<ReminderRow[]>(OVERDUE_STUDENTS);
  const [isSending, setIsSending] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const sendBtnScale = useRef(new Animated.Value(1)).current;
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const counts = {
    total: rows.length,
    sent: rows.filter((r) => ["sent", "delivered", "read"].includes(r.status)).length,
    delivered: rows.filter((r) => ["delivered", "read"].includes(r.status)).length,
    read: rows.filter((r) => r.status === "read").length,
  };

  const updateRowStatus = useCallback((id: string, status: SendStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const handleSendAll = () => {
    if (isSending || allDone) return;
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(sendBtnScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(sendBtnScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    rows.forEach((row, rowIdx) => {
      const baseDelay = rowIdx * 350;
      SEND_SEQUENCE.forEach((status, seqIdx) => {
        const t = setTimeout(() => {
          updateRowStatus(row.id, status);
          if (status === "read") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, baseDelay + SEQUENCE_DELAYS[seqIdx]);
        timeoutsRef.current.push(t);
      });
    });

    const totalDuration = (rows.length - 1) * 350 + SEQUENCE_DELAYS[SEQUENCE_DELAYS.length - 1] + 400;
    const finishT = setTimeout(() => {
      setIsSending(false);
      setAllDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, totalDuration);
    timeoutsRef.current.push(finishT);
  };

  const handleReset = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setRows(OVERDUE_STUDENTS.map((r) => ({ ...r, status: "queued" })));
    setIsSending(false);
    setAllDone(false);
  };

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const sampleRow = rows[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#075e54", "#128c7e"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>WhatsApp Reminders</Text>
          <Text style={styles.headerSub}>{counts.total} overdue parents · Fee recovery</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: allDone ? "#25d36640" : "#ffffff18" }]}>
          <View style={[styles.liveDot, { backgroundColor: allDone ? "#25d366" : "rgba(255,255,255,0.6)" }]} />
          <Text style={styles.liveTxt}>{allDone ? "Done" : isSending ? "Live" : "Ready"}</Text>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { label: "Total", value: counts.total, color: colors.foreground },
          { label: "Sent", value: counts.sent, color: "#94a3b8" },
          { label: "Delivered", value: counts.delivered, color: "#25d366" },
          { label: "Read", value: counts.read, color: "#53bdeb" },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Message Preview Toggle */}
      <Pressable
        onPress={() => setShowPreview((v) => !v)}
        style={[styles.previewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="document-text-outline" size={16} color="#25d366" />
        <Text style={[styles.previewToggleTxt, { color: colors.foreground }]}>Message Template</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name={showPreview ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
      </Pressable>

      {showPreview && sampleRow && (
        <View style={[styles.previewBubble, { backgroundColor: "#dcf8c6", borderRadius: 12 }]}>
          <Text style={styles.previewText}>{MESSAGE_TEMPLATE(sampleRow.guardianName, sampleRow.amount, sampleRow.class)}</Text>
          <View style={styles.previewMeta}>
            <Text style={styles.previewTime}>10:42 AM</Text>
            <Ionicons name="checkmark-done" size={13} color="#53bdeb" />
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: bottomPad + 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <ReminderCard row={item} index={index} />}
      />

      {/* Send All Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        {allDone ? (
          <Pressable onPress={handleReset} style={[styles.resetBtn, { borderColor: colors.border }]}>
            <Ionicons name="refresh" size={16} color={colors.mutedForeground} />
            <Text style={[styles.resetTxt, { color: colors.mutedForeground }]}>Reset Demo</Text>
          </Pressable>
        ) : (
          <Animated.View style={{ transform: [{ scale: sendBtnScale }], flex: 1 }}>
            <Pressable
              onPress={handleSendAll}
              disabled={isSending}
              style={[styles.sendBtn, { backgroundColor: isSending ? "#128c7eaa" : "#25d366" }]}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.sendBtnTxt}>
                {isSending ? `Sending ${counts.sent}/${counts.total}...` : `Send ${counts.total} Reminders`}
              </Text>
              {!isSending && <Ionicons name="paper-plane" size={16} color="rgba(255,255,255,0.8)" />}
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statsRow: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  previewToggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 12, marginTop: 10, padding: 12,
    borderWidth: 1, borderRadius: 10,
  },
  previewToggleTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  previewBubble: {
    marginHorizontal: 12, marginTop: 6, padding: 12,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  previewText: { fontSize: 13, color: "#111", fontFamily: "Inter_400Regular", lineHeight: 20 },
  previewMeta: { flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 6 },
  previewTime: { fontSize: 11, color: "#888", fontFamily: "Inter_400Regular" },
  card: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  guardianName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  studentInfo: { fontSize: 12, fontFamily: "Inter_400Regular" },
  phone: { fontSize: 11, fontFamily: "Inter_400Regular" },
  right: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  bottomBar: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  sendBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 16,
  },
  sendBtnTxt: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  resetBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  resetTxt: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
