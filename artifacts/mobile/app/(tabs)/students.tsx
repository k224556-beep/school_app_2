import React, { useState, useMemo } from "react";
import {
  StyleSheet, Text, View, TextInput, ScrollView,
  FlatList, Pressable, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { StudentCard } from "@/components/StudentCard";
import { DISPLAY_STUDENTS, DASHBOARD_METRICS } from "@/constants/demoData";

const ALL_CLASSES = [
  "All", "Reception", "Nursery", "KG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [filter, setFilter] = useState<"all" | "paid" | "partial" | "overdue" | "risk">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const filtered = useMemo(() => {
    return DISPLAY_STUDENTS.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase());
      const matchClass = selectedClass === "All" || s.class === selectedClass;
      const matchFilter =
        filter === "all" ? true :
        filter === "risk" ? s.riskScore > 60 :
        s.feeStatus === filter;
      return matchSearch && matchClass && matchFilter;
    });
  }, [search, selectedClass, filter]);

  const stats = useMemo(() => ({
    paid: DISPLAY_STUDENTS.filter((s) => s.feeStatus === "paid").length,
    partial: DISPLAY_STUDENTS.filter((s) => s.feeStatus === "partial").length,
    overdue: DISPLAY_STUDENTS.filter((s) => s.feeStatus === "overdue").length,
    risk: DISPLAY_STUDENTS.filter((s) => s.riskScore > 60).length,
  }), []);

  const FILTER_PILLS: Array<{ key: typeof filter; label: string; color: string; count: number }> = [
    { key: "all", label: "All", color: colors.primary, count: DISPLAY_STUDENTS.length },
    { key: "paid", label: "Paid", color: "#10b981", count: stats.paid },
    { key: "partial", label: "Partial", color: "#f59e0b", count: stats.partial },
    { key: "overdue", label: "Overdue", color: "#f43f5e", count: stats.overdue },
    { key: "risk", label: "At Risk", color: "#8b5cf6", count: stats.risk },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Students</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {DASHBOARD_METRICS.totalStudents} enrolled · {DISPLAY_STUDENTS.length} shown
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
              <Ionicons name="funnel-outline" size={18} color={colors.foreground} />
            </Pressable>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="person-add-outline" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or ID..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTER_PILLS.map((pill) => (
            <Pressable
              key={pill.key}
              onPress={() => setFilter(pill.key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filter === pill.key ? pill.color : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === pill.key ? "#fff" : colors.mutedForeground }]}>
                {pill.label}
              </Text>
              <View style={[styles.filterCount, { backgroundColor: filter === pill.key ? "rgba(255,255,255,0.25)" : colors.border }]}>
                <Text style={[styles.filterCountText, { color: filter === pill.key ? "#fff" : colors.mutedForeground }]}>
                  {pill.count}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Class Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
          {ALL_CLASSES.map((cls) => (
            <Pressable
              key={cls}
              onPress={() => setSelectedClass(cls)}
              style={[
                styles.classPill,
                {
                  backgroundColor: selectedClass === cls ? colors.primary + "20" : "transparent",
                  borderColor: selectedClass === cls ? colors.primary : colors.border,
                  borderRadius: 20,
                },
              ]}
            >
              <Text style={[styles.classPillText, { color: selectedClass === cls ? colors.primary : colors.mutedForeground }]}>
                {cls}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={[styles.resultsRow, { backgroundColor: colors.background }]}>
        <Text style={[styles.resultsText, { color: colors.mutedForeground }]}>
          {filtered.length} students found
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentCard
            student={item}
            onPress={() => router.push(`/student/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad + 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No students found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterScroll: { marginHorizontal: -16, paddingLeft: 16 },
  filterPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, gap: 6 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  filterCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  filterCountText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  classScroll: { marginHorizontal: -16, paddingLeft: 16 },
  classPill: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, borderWidth: 1 },
  classPillText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  resultsRow: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
