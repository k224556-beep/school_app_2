import React, { useState, useMemo } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { STUDENTS } from "@/constants/demoData";

const EXAMS = [
  { id: "mid", label: "Mid Term",   period: "Feb 2025", seed: 1 },
  { id: "final", label: "Final Term", period: "Jun 2025", seed: 7 },
  { id: "unit1", label: "Unit Test 1",period: "Jan 2025", seed: 3 },
  { id: "unit2", label: "Unit Test 2",period: "Mar 2025", seed: 5 },
];

const SUBJECTS = ["Mathematics", "English", "Science", "Urdu", "Islamiyat", "Pak Studies"];

function rng(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
}

function getExamScore(studentIdx: number, subjectIdx: number, examSeed: number): number {
  return rng(studentIdx * 17 + subjectIdx * 31 + examSeed * 53, 28, 98);
}

function getAvgScore(studentIdx: number, examSeed: number): number {
  return Math.round(
    SUBJECTS.reduce((acc, _, si) => acc + getExamScore(studentIdx, si, examSeed), 0) / SUBJECTS.length
  );
}

const MEDAL_COLORS = ["#fbbf24", "#94a3b8", "#cd7c2e"];
const MEDAL_LABELS = ["Gold", "Silver", "Bronze"];

function TopperCard({ student, rank, avg, examSeed }: {
  student: typeof STUDENTS[number]; rank: number; avg: number; examSeed: number;
}) {
  const colors = useColors();
  const medalColor = MEDAL_COLORS[rank];
  const initials = student.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <View style={[styles.topperCard, { backgroundColor: colors.card, borderColor: medalColor + "40", borderRadius: colors.radius }]}>
      <View style={[styles.topperMedal, { backgroundColor: medalColor + "20" }]}>
        <Ionicons name="trophy" size={18} color={medalColor} />
        <Text style={[styles.topperRank, { color: medalColor }]}>#{rank + 1}</Text>
      </View>
      <View style={[styles.topperAvatar, { backgroundColor: medalColor + "30" }]}>
        <Text style={[styles.topperInitials, { color: medalColor }]}>{initials}</Text>
      </View>
      <Text style={[styles.topperName, { color: colors.foreground }]} numberOfLines={1}>{student.name}</Text>
      <Text style={[styles.topperClass, { color: colors.mutedForeground }]}>{student.class}</Text>
      <View style={[styles.topperScore, { backgroundColor: medalColor + "20" }]}>
        <Text style={[styles.topperScoreVal, { color: medalColor }]}>{avg}%</Text>
      </View>
    </View>
  );
}

export default function ExamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [examId, setExamId] = useState("mid");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const exam = EXAMS.find((e) => e.id === examId)!;

  const studentScores = useMemo(() => {
    return STUDENTS.slice(0, 100).map((s, i) => ({
      student: s,
      avg: getAvgScore(i, exam.seed),
      idx: i,
    })).sort((a, b) => b.avg - a.avg);
  }, [exam]);

  const toppers = studentScores.slice(0, 3);
  const atRisk = studentScores.filter((s) => s.avg < 45).slice(0, 8);

  const subjectAvgs = useMemo(() => {
    return SUBJECTS.map((sub, si) => {
      const avg = Math.round(
        STUDENTS.slice(0, 100).reduce((acc, _, i) => acc + getExamScore(i, si, exam.seed), 0) / 100
      );
      return { sub, avg };
    });
  }, [exam]);

  const distribution = useMemo(() => {
    const bins = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    studentScores.forEach(({ avg }) => {
      if (avg >= 80) bins.A++;
      else if (avg >= 65) bins.B++;
      else if (avg >= 50) bins.C++;
      else if (avg >= 35) bins.D++;
      else bins.F++;
    });
    return bins;
  }, [studentScores]);

  const maxBin = Math.max(...Object.values(distribution));

  const handleGenerate = () => {
    setGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={["#1e0a3c", "#0d1b2e"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Exam Results</Text>
            <Text style={styles.headerSub}>{exam.label} · {exam.period}</Text>
          </View>
          <Pressable
            onPress={handleGenerate}
            style={[styles.generateBtn, { backgroundColor: generated ? "#10b981" : "#8b5cf6" }]}
          >
            <Ionicons name={generated ? "checkmark" : generating ? "hourglass-outline" : "document-text-outline"} size={15} color="#fff" />
            <Text style={styles.generateTxt}>{generated ? "Generated!" : generating ? "Generating..." : "Report Cards"}</Text>
          </Pressable>
        </View>

        {/* Exam Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          {EXAMS.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => { setExamId(e.id); setGenerated(false); }}
              style={[styles.examTab, { backgroundColor: examId === e.id ? "#8b5cf6" : "rgba(255,255,255,0.08)" }]}
            >
              <Text style={[styles.examTabTxt, { color: examId === e.id ? "#fff" : "rgba(255,255,255,0.5)" }]}>{e.label}</Text>
              <Text style={[styles.examTabPeriod, { color: examId === e.id ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }]}>{e.period}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, paddingTop: 18, gap: 16 }}>
        {/* Top 3 */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Class Toppers</Text>
        <View style={styles.toppersRow}>
          {toppers.map((t, i) => (
            <TopperCard key={t.student.id} student={t.student} rank={i} avg={t.avg} examSeed={exam.seed} />
          ))}
        </View>

        {/* Grade Distribution */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Grade Distribution</Text>
          <View style={styles.distRow}>
            {(Object.entries(distribution) as [string, number][]).map(([grade, count]) => {
              const gradeColors: Record<string, string> = { A: "#10b981", B: "#0ea5e9", C: "#f59e0b", D: "#f97316", F: "#f43f5e" };
              const color = gradeColors[grade];
              const pct = Math.round((count / studentScores.length) * 100);
              const barH = Math.max(8, Math.round((count / maxBin) * 80));
              return (
                <View key={grade} style={styles.distCol}>
                  <Text style={[styles.distCount, { color }]}>{count}</Text>
                  <View style={[styles.distBar, { height: barH, backgroundColor: color }]} />
                  <View style={[styles.distGrade, { backgroundColor: color + "20" }]}>
                    <Text style={[styles.distGradeTxt, { color }]}>{grade}</Text>
                  </View>
                  <Text style={[styles.distPct, { color: colors.mutedForeground }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: "#10b981" }]}>{studentScores[0].avg}%</Text>
              <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Highest</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.foreground }]}>
                {Math.round(studentScores.reduce((a, s) => a + s.avg, 0) / studentScores.length)}%
              </Text>
              <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Class Avg</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: "#f43f5e" }]}>{studentScores[studentScores.length - 1].avg}%</Text>
              <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Lowest</Text>
            </View>
          </View>
        </View>

        {/* Subject Averages */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Subject Averages</Text>
          <View style={{ gap: 10 }}>
            {subjectAvgs.sort((a, b) => b.avg - a.avg).map(({ sub, avg }) => {
              const color = avg >= 70 ? "#10b981" : avg >= 50 ? "#f59e0b" : "#f43f5e";
              return (
                <View key={sub} style={styles.subjectRow}>
                  <Text style={[styles.subjectName, { color: colors.mutedForeground }]}>{sub}</Text>
                  <View style={[styles.subjectBarBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.subjectBarFill, { width: `${avg}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.subjectScore, { color }]}>{avg}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* At Risk */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: "#f43f5e40", borderRadius: colors.radius }]}>
          <View style={styles.atRiskHeader}>
            <Ionicons name="warning" size={16} color="#f43f5e" />
            <Text style={[styles.cardTitle, { color: "#f43f5e" }]}>At-Risk Students ({atRisk.length})</Text>
          </View>
          <Text style={[styles.atRiskSub, { color: colors.mutedForeground }]}>Below 45% — immediate intervention needed</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {atRisk.map(({ student, avg }) => {
              const initials = student.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              return (
                <View key={student.id} style={[styles.riskRow, { borderColor: colors.border }]}>
                  <View style={[styles.riskAvatar, { backgroundColor: "#f43f5e20" }]}>
                    <Text style={styles.riskInitials}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.riskName, { color: colors.foreground }]}>{student.name}</Text>
                    <Text style={[styles.riskClass, { color: colors.mutedForeground }]}>{student.class} · {student.attendance}% attendance</Text>
                  </View>
                  <View style={[styles.riskScore, { backgroundColor: "#f43f5e20" }]}>
                    <Text style={styles.riskScoreVal}>{avg}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  generateBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  generateTxt: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  examTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 2 },
  examTabTxt: { fontSize: 13, fontFamily: "Inter_700Bold" },
  examTabPeriod: { fontSize: 10, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  toppersRow: { flexDirection: "row", gap: 8 },
  topperCard: { flex: 1, padding: 12, borderWidth: 1, alignItems: "center", gap: 6 },
  topperMedal: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  topperRank: { fontSize: 12, fontFamily: "Inter_700Bold" },
  topperAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topperInitials: { fontSize: 14, fontFamily: "Inter_700Bold" },
  topperName: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  topperClass: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  topperScore: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  topperScoreVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  card: { padding: 16, borderWidth: 1 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  distRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 110 },
  distCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  distCount: { fontSize: 12, fontFamily: "Inter_700Bold" },
  distBar: { width: "70%", borderRadius: 4 },
  distGrade: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  distGradeTxt: { fontSize: 12, fontFamily: "Inter_700Bold" },
  distPct: { fontSize: 10, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginVertical: 14 },
  summaryRow: { flexDirection: "row" },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  subjectName: { width: 88, fontSize: 12, fontFamily: "Inter_500Medium" },
  subjectBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  subjectBarFill: { height: "100%", borderRadius: 4 },
  subjectScore: { width: 36, fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "right" },
  atRiskHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  atRiskSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  riskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  riskAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  riskInitials: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#f43f5e" },
  riskName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  riskClass: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  riskScore: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  riskScoreVal: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#f43f5e" },
});
