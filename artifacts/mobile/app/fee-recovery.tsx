import React, { useMemo, useState } from "react";
import {
  FlatList, Platform, Pressable, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import {
  STUDENTS, formatPKR,
  getRecoveryScore, getRecoveryLabel, getRecoveryColor,
} from "@/constants/demoData";

type SortKey = "score_desc" | "score_asc" | "amount_desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score_desc", label: "Most Likely First" },
  { key: "score_asc", label: "Least Likely First" },
  { key: "amount_desc", label: "Highest Amount" },
];

const FACTOR_MAP = (student: { attendance: number; riskScore: number; feeStatus: string }): string[] => {
  const factors: string[] = [];
  if (student.attendance >= 85) factors.push("High attendance");
  else if (student.attendance < 70) factors.push("Poor attendance");
  if (student.feeStatus === "partial") factors.push("Part-paid before");
  if (student.riskScore < 30) factors.push("No prior defaults");
  if (student.riskScore > 70) factors.push("Repeat defaulter");
  if (student.attendance >= 90) factors.push("Engaged parent");
  return factors.slice(0, 2);
};

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const color = getRecoveryColor(score);
  const strokeW = 4;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size, height: size, borderRadius: size / 2,
          borderWidth: strokeW, borderColor: color + "30",
          position: "absolute",
        }}
      />
      <View
        style={{
          width: size - strokeW * 2.5, height: size - strokeW * 2.5,
          borderRadius: size / 2, backgroundColor: color + "15",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: size * 0.27, fontFamily: "Inter_700Bold", color }}>{score}</Text>
        <Text style={{ fontSize: size * 0.16, fontFamily: "Inter_400Regular", color, opacity: 0.7 }}>%</Text>
      </View>
    </View>
  );
}

function RecoveryCard({ student, rank }: {
  student: ReturnType<typeof STUDENTS>[number];
  rank?: number;
}) {
  const colors = useColors();
  const score = getRecoveryScore(student);
  const label = getRecoveryLabel(score);
  const color = getRecoveryColor(score);
  const factors = FACTOR_MAP(student);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
      {rank != null && (
        <View style={[styles.rankBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.rankTxt, { color }]}>#{rank}</Text>
        </View>
      )}
      <ScoreRing score={score} size={52} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>{student.name}</Text>
          <View style={[styles.labelPill, { backgroundColor: color + "18" }]}>
            <Text style={[styles.labelTxt, { color }]}>{label}</Text>
          </View>
        </View>
        <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
          {student.class} · {student.attendance}% att.
        </Text>
        <View style={styles.factorRow}>
          {factors.map((f) => (
            <View key={f} style={[styles.factorPill, { backgroundColor: colors.muted }]}>
              <Text style={[styles.factorTxt, { color: colors.mutedForeground }]}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={[styles.amount, { color: "#f43f5e" }]}>
        {formatPKR(student.outstandingBalance)}
      </Text>
    </View>
  );
}

export default function FeeRecoveryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>("score_desc");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const nonPaid = useMemo(
    () => STUDENTS.filter((s) => s.feeStatus !== "paid"),
    []
  );

  const sorted = useMemo(() => {
    const list = [...nonPaid];
    if (sort === "score_desc") return list.sort((a, b) => getRecoveryScore(b) - getRecoveryScore(a));
    if (sort === "score_asc") return list.sort((a, b) => getRecoveryScore(a) - getRecoveryScore(b));
    return list.sort((a, b) => b.outstandingBalance - a.outstandingBalance);
  }, [nonPaid, sort]);

  const topThree = useMemo(
    () => [...nonPaid].sort((a, b) => getRecoveryScore(b) - getRecoveryScore(a)).slice(0, 3),
    [nonPaid]
  );

  const avgScore = useMemo(
    () => Math.round(nonPaid.reduce((acc, s) => acc + getRecoveryScore(s), 0) / nonPaid.length),
    [nonPaid]
  );

  const totalOutstanding = nonPaid.reduce((acc, s) => acc + s.outstandingBalance, 0);

  const highCount = nonPaid.filter((s) => getRecoveryScore(s) >= 70).length;
  const medCount = nonPaid.filter((s) => getRecoveryScore(s) >= 40 && getRecoveryScore(s) < 70).length;
  const lowCount = nonPaid.filter((s) => getRecoveryScore(s) < 40).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <LinearGradient colors={["#0f172a", "#0d1b2e"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
              <View style={styles.headerRow}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <View style={styles.aiLabel}>
                    <Ionicons name="sparkles" size={12} color="#10b981" />
                    <Text style={styles.aiLabelTxt}>AI-Powered</Text>
                  </View>
                  <Text style={styles.headerTitle}>Fee Recovery Score</Text>
                  <Text style={styles.headerSub}>Likelihood to pay within 7 days</Text>
                </View>
                <ScoreRing score={avgScore} size={58} />
              </View>

              {/* Model note */}
              <View style={styles.modelNote}>
                <Ionicons name="analytics-outline" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.modelTxt}>
                  Model trained on 2,400+ Pakistani school payment patterns
                </Text>
              </View>

              {/* Distribution bar */}
              <View style={[styles.distCard, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                <View style={{ flexDirection: "row", height: 10, borderRadius: 6, overflow: "hidden" }}>
                  <View style={{ flex: highCount, backgroundColor: "#10b981" }} />
                  <View style={{ flex: medCount, backgroundColor: "#f59e0b" }} />
                  <View style={{ flex: lowCount, backgroundColor: "#f43f5e" }} />
                </View>
                <View style={styles.distLegend}>
                  {[
                    { label: `High (${highCount})`, color: "#10b981" },
                    { label: `Medium (${medCount})`, color: "#f59e0b" },
                    { label: `Low (${lowCount})`, color: "#f43f5e" },
                  ].map((d) => (
                    <View key={d.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <Text style={styles.legendTxt}>{d.label}</Text>
                    </View>
                  ))}
                  <Text style={styles.legendTotal}>{formatPKR(totalOutstanding)} total</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Priority Actions */}
            <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="flash" size={14} color="#f59e0b" />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Priority — Send Today</Text>
                </View>
                <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Highest chance of recovery</Text>
              </View>
              <View style={{ gap: 8, marginBottom: 20 }}>
                {topThree.map((s, i) => <RecoveryCard key={s.id} student={s} rank={i + 1} />)}
              </View>

              {/* Sort Controls */}
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>
                All Students ({nonPaid.length})
              </Text>
              <View style={styles.sortRow}>
                {SORT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setSort(opt.key)}
                    style={[
                      styles.sortPill,
                      {
                        backgroundColor: sort === opt.key ? colors.primary : colors.muted,
                        borderRadius: 20,
                      },
                    ]}
                  >
                    <Text style={[styles.sortTxt, { color: sort === opt.key ? "#fff" : colors.mutedForeground }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <RecoveryCard student={item} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 18, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  aiLabel: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 },
  aiLabelTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#10b981" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  modelNote: { flexDirection: "row", alignItems: "center", gap: 6 },
  modelTxt: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", fontStyle: "italic" },
  distCard: { padding: 12, borderRadius: 12, gap: 10 },
  distLegend: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)" },
  legendTotal: { marginLeft: "auto", fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  sectionHeader: { marginBottom: 10, gap: 2 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sortRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  sortPill: { paddingHorizontal: 10, paddingVertical: 6 },
  sortTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  card: {
    flexDirection: "row", alignItems: "center", padding: 12,
    borderWidth: 1, gap: 10, position: "relative",
  },
  rankBadge: {
    position: "absolute", top: 8, right: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  rankTxt: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 32 },
  cardName: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  labelPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  labelTxt: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  factorRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  factorPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  factorTxt: { fontSize: 10, fontFamily: "Inter_500Medium" },
  amount: { fontSize: 13, fontFamily: "Inter_700Bold", minWidth: 56, textAlign: "right" },
});
