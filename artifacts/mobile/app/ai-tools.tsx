import React, { useMemo, useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { QUESTION_BANK, type QuestionBankItem } from "@/constants/demoData";

const SUBJECTS = Array.from(new Set(QUESTION_BANK.map((q) => q.subject)));
const DIFFICULTIES: Array<QuestionBankItem["difficulty"]> = ["Easy", "Medium", "Hard"];
const TYPE_ICONS: Record<QuestionBankItem["type"], keyof typeof Ionicons.glyphMap> = {
  MCQ: "list-outline",
  Short: "chatbox-outline",
  Long: "document-text-outline",
  Worksheet: "grid-outline",
};

function Chip({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color: string }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? color : colors.border, backgroundColor: active ? color + "18" : colors.card },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? color : colors.mutedForeground }]}>{label}</Text>
    </Pressable>
  );
}

export default function AiToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState<QuestionBankItem["difficulty"] | "All">("All");
  const [generating, setGenerating] = useState(false);
  const [paper, setPaper] = useState<QuestionBankItem[] | null>(null);

  const filtered = useMemo(
    () => QUESTION_BANK.filter((q) => q.subject === subject && (difficulty === "All" || q.difficulty === difficulty)),
    [subject, difficulty]
  );

  const generatePaper = () => {
    setGenerating(true);
    setPaper(null);
    setTimeout(() => {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setPaper(shuffled.slice(0, Math.min(8, shuffled.length)));
      setGenerating(false);
    }, 1400);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>AI Question Paper</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Generate papers from {QUESTION_BANK.length} bank items</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 30, gap: 16 }}>
        <LinearGradient colors={["#1e1040", "#0d1b2e"]} style={[styles.introCard, { borderRadius: colors.radius }]}>
          <View style={styles.introHeader}>
            <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.introIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.introTitle}>AI Paper Generator</Text>
          </View>
          <Text style={styles.introText}>
            Select a subject and difficulty, then generate a randomized question paper pulled from the school's question bank.
          </Text>
        </LinearGradient>

        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Subject</Text>
          <View style={styles.chipRow}>
            {SUBJECTS.map((s) => (
              <Chip key={s} label={s} active={subject === s} onPress={() => { setSubject(s); setPaper(null); }} color={colors.primary} />
            ))}
          </View>
        </View>

        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Difficulty</Text>
          <View style={styles.chipRow}>
            <Chip label="All" active={difficulty === "All"} onPress={() => setDifficulty("All")} color={colors.accent} />
            {DIFFICULTIES.map((d) => (
              <Chip key={d} label={d} active={difficulty === d} onPress={() => setDifficulty(d)} color={colors.accent} />
            ))}
          </View>
        </View>

        <View style={[styles.statRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Ionicons name="library-outline" size={16} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.foreground }]}>{filtered.length} questions available in this filter</Text>
        </View>

        <Pressable
          disabled={filtered.length === 0 || generating}
          onPress={generatePaper}
          style={[styles.generateBtn, { backgroundColor: colors.primary, opacity: filtered.length === 0 ? 0.5 : 1 }]}
        >
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="flash-outline" size={18} color="#fff" />
              <Text style={styles.generateBtnText}>Generate Question Paper</Text>
            </>
          )}
        </Pressable>

        {generating && (
          <View style={{ gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.skeleton, { backgroundColor: colors.card, borderRadius: colors.radius - 4 }]} />
            ))}
          </View>
        )}

        {paper && !generating && (
          <View style={[styles.paperCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.paperHeader}>
              <Text style={[styles.paperTitle, { color: colors.foreground }]}>{subject} — Generated Paper</Text>
              <Pressable style={[styles.exportBtn, { backgroundColor: colors.primary + "20" }]}>
                <Ionicons name="download-outline" size={14} color={colors.primary} />
                <Text style={[styles.exportBtnText, { color: colors.primary }]}>Export</Text>
              </Pressable>
            </View>
            {paper.map((q, i) => (
              <View key={q.id} style={[styles.questionRow, { borderTopColor: colors.border }]}>
                <View style={styles.questionHeader}>
                  <Text style={[styles.questionNum, { color: colors.primary }]}>Q{i + 1}</Text>
                  <View style={[styles.typeTag, { backgroundColor: colors.muted }]}>
                    <Ionicons name={TYPE_ICONS[q.type]} size={10} color={colors.mutedForeground} />
                    <Text style={[styles.typeTagText, { color: colors.mutedForeground }]}>{q.type}</Text>
                  </View>
                  <View style={[styles.typeTag, {
                    backgroundColor: q.difficulty === "Hard" ? "#f43f5e20" : q.difficulty === "Medium" ? "#f59e0b20" : "#10b98120",
                  }]}>
                    <Text style={[styles.typeTagText, {
                      color: q.difficulty === "Hard" ? "#f43f5e" : q.difficulty === "Medium" ? "#f59e0b" : "#10b981",
                    }]}>
                      {q.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.questionText, { color: colors.foreground }]}>{q.text}</Text>
                {q.options && (
                  <View style={{ marginTop: 4, gap: 2 }}>
                    {q.options.map((opt, oi) => (
                      <Text key={oi} style={[styles.optionText, { color: colors.mutedForeground }]}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {!paper && !generating && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your generated paper will appear here</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  introCard: { padding: 16, gap: 8 },
  introHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  introIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  introTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  introText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", lineHeight: 18 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderWidth: 1 },
  statText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  generateBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  skeleton: { height: 60, opacity: 0.5 },
  paperCard: { padding: 16, borderWidth: 1, gap: 4 },
  paperHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  paperTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  exportBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  questionRow: { borderTopWidth: 1, paddingVertical: 10, gap: 5 },
  questionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  questionNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  typeTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  typeTagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  questionText: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 19 },
  optionText: { fontSize: 12, fontFamily: "Inter_400Regular", paddingLeft: 8 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 50, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
