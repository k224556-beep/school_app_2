import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Platform, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { STAFF, formatPKR, type StaffMember } from "@/constants/demoData";
import { ProgressBar } from "@/components/Charts";

type SortKey = "name" | "salary" | "attendance";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function StaffCard({ item }: { item: StaffMember }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(item.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>{item.role} · {item.department}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: item.status === "active" ? "#10b981" : "#f59e0b" }]} />
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Salary</Text>
          <Text style={[styles.metaValue, { color: colors.foreground }]}>{formatPKR(item.salary)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Leave Balance</Text>
          <Text style={[styles.metaValue, { color: colors.foreground }]}>{item.leaveBalance} days</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Joined</Text>
          <Text style={[styles.metaValue, { color: colors.foreground }]}>{item.joinDate}</Text>
        </View>
      </View>

      <View style={{ marginTop: 4 }}>
        <View style={styles.attendanceRow}>
          <Text style={[styles.attendanceLabel, { color: colors.mutedForeground }]}>Attendance</Text>
          <Text style={[styles.attendanceValue, { color: item.attendance >= 90 ? "#10b981" : "#f59e0b" }]}>{item.attendance}%</Text>
        </View>
        <ProgressBar value={item.attendance} color={item.attendance >= 90 ? "#10b981" : "#f59e0b"} />
      </View>
    </View>
  );
}

export default function HrPayrollScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  const departments = useMemo(() => Array.from(new Set(STAFF.map((s) => s.department))), []);
  const totalPayroll = useMemo(() => STAFF.reduce((sum, s) => sum + s.salary, 0), []);
  const onLeaveCount = STAFF.filter((s) => s.status === "on-leave").length;
  const avgAttendance = Math.round(STAFF.reduce((sum, s) => sum + s.attendance, 0) / STAFF.length);

  const filtered = useMemo(() => {
    let list = STAFF.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter) list = list.filter((s) => s.department === deptFilter);
    list = [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "salary") return b.salary - a.salary;
      return b.attendance - a.attendance;
    });
    return list;
  }, [search, deptFilter, sortKey]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>HR & Payroll</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{STAFF.length} staff members</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 30, gap: 16 }}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Ionicons name="cash-outline" size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{formatPKR(totalPayroll)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Monthly Payroll</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Ionicons name="people-outline" size={16} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{avgAttendance}%</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Avg Attendance</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Ionicons name="airplane-outline" size={16} color="#f59e0b" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{onLeaveCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>On Leave</Text>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search staff..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Pressable
            onPress={() => setDeptFilter(null)}
            style={[styles.filterChip, { backgroundColor: !deptFilter ? colors.primary : colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.filterChipText, { color: !deptFilter ? "#fff" : colors.mutedForeground }]}>All</Text>
          </Pressable>
          {departments.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDeptFilter(d)}
              style={[styles.filterChip, { backgroundColor: deptFilter === d ? colors.primary : colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.filterChipText, { color: deptFilter === d ? "#fff" : colors.mutedForeground }]}>{d}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: colors.mutedForeground }]}>Sort by</Text>
          {(["name", "salary", "attendance"] as SortKey[]).map((k) => (
            <Pressable key={k} onPress={() => setSortKey(k)} style={styles.sortBtn}>
              <Text style={[styles.sortBtnText, { color: sortKey === k ? colors.primary : colors.mutedForeground }]}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No staff members found</Text>
          </View>
        ) : (
          filtered.map((s) => <StaffCard key={s.id} item={s} />)
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
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 12, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sortLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sortBtn: { paddingVertical: 4 },
  sortBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  card: { padding: 14, borderWidth: 1, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  role: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  metaGrid: { flexDirection: "row", justifyContent: "space-between" },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  metaValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  attendanceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  attendanceLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  attendanceValue: { fontSize: 11, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 50, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
