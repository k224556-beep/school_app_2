import React from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { TEACHERS, ADMISSIONS, STUDENTS } from "@/constants/demoData";

const OVERDUE_COUNT = STUDENTS.filter((s) => s.feeStatus === "overdue").length;

interface TileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color: string;
  onPress: () => void;
}

function Tile({ icon, label, value, color, onPress }: TileProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
    >
      <View style={[styles.tileIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.foreground }]}>{label}</Text>
      {value && <Text style={[styles.tileValue, { color: color }]}>{value}</Text>}
    </Pressable>
  );
}

function MenuItem({
  icon, label, value, color, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; color: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.menuRight}>
        {value && (
          <View style={[styles.menuBadge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.menuBadgeText, { color }]}>{value}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const confirmedAdmissions = ADMISSIONS.filter((a) => a.stage === "confirmed").length;
  const pendingAdmissions = ADMISSIONS.filter((a) => a.stage !== "confirmed").length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 100, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={["#0f2744", "#1a3a5c"]}
        style={[styles.profileCard, { borderRadius: colors.radius + 4 }]}
      >
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>PA</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>Principal Ahmed</Text>
          <Text style={styles.profileRole}>School Administrator</Text>
          <Text style={styles.profileSchool}>The Educators School, Lahore</Text>
        </View>
        <Pressable style={[styles.editBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
          <Ionicons name="settings-outline" size={18} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </LinearGradient>

      {/* Quick Tiles */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Management</Text>
      <View style={styles.tilesGrid}>
        <Tile icon="people" label="Teachers" value={`${TEACHERS.length}`} color="#0ea5e9" onPress={() => router.push("/teachers")} />
        <Tile icon="person-add" label="Admissions" value={`${ADMISSIONS.length} leads`} color="#8b5cf6" onPress={() => router.push("/admissions")} />
        <Tile icon="document-text" label="Reports" value="Export" color="#10b981" onPress={() => router.push("/reports")} />
        <Tile icon="checkbox" label="Attendance" value="Mark now" color="#f59e0b" onPress={() => router.push("/attendance")} />
        <Tile icon="chatbubbles" label="Parent Comms" value="Threads" color="#ec4899" onPress={() => router.push("/parent-comms")} />
        <Tile icon="school" label="Exams" value="Results" color="#8b5cf6" onPress={() => router.push("/exams")} />
        <Tile icon="calendar" label="Calendar" value="Events" color="#06b6d4" onPress={() => router.push("/calendar")} />
        <Tile icon="ribbon" label="Awards" value="Events" color="#f59e0b" onPress={() => {}} />
      </View>

      {/* Communication */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Communication</Text>
      <View style={[styles.menuGroup, { borderRadius: colors.radius, borderColor: colors.border }]}>
        <MenuItem icon="logo-whatsapp" label="WhatsApp Reminders" value={`${OVERDUE_COUNT} overdue`} color="#25d366" onPress={() => router.push("/whatsapp")} />
        <MenuItem icon="mail" label="Email Announcements" color="#0ea5e9" onPress={() => {}} />
        <MenuItem icon="chatbubble-ellipses" label="SMS Gateway" color="#8b5cf6" onPress={() => {}} />
        <MenuItem icon="megaphone" label="School Announcements" color="#f59e0b" onPress={() => {}} />
      </View>

      {/* Admissions Pipeline */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Admissions Pipeline</Text>
      <View style={[styles.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        {[
          { stage: "New Inquiry", count: ADMISSIONS.filter((a) => a.stage === "inquiry").length, color: "#0ea5e9" },
          { stage: "Parent Visit", count: ADMISSIONS.filter((a) => a.stage === "visit").length, color: "#8b5cf6" },
          { stage: "Follow Up", count: ADMISSIONS.filter((a) => a.stage === "followup").length, color: "#f59e0b" },
          { stage: "Confirmed", count: confirmedAdmissions, color: "#10b981" },
        ].map((s, i, arr) => (
          <View key={s.stage} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.stageWrap, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={[styles.stageDot, { backgroundColor: s.color }]} />
              <Text style={[styles.stageLabel, { color: colors.foreground }]}>{s.stage}</Text>
              <View style={[styles.stageCount, { backgroundColor: s.color + "20" }]}>
                <Text style={[styles.stageCountText, { color: s.color }]}>{s.count}</Text>
              </View>
              <View style={[styles.stageBar, { backgroundColor: colors.border }]}>
                <View style={[styles.stageBarFill, {
                  width: `${(s.count / ADMISSIONS.length) * 100}%`,
                  backgroundColor: s.color + "80",
                }]} />
              </View>
              <Text style={[styles.stagePct, { color: colors.mutedForeground }]}>
                {Math.round((s.count / ADMISSIONS.length) * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>Settings & Help</Text>
      <View style={[styles.menuGroup, { borderRadius: colors.radius, borderColor: colors.border }]}>
        <MenuItem icon="person-circle" label="Account Settings" color="#64748b" onPress={() => {}} />
        <MenuItem icon="shield-checkmark" label="Privacy & Security" color="#10b981" onPress={() => {}} />
        <MenuItem icon="notifications" label="Notification Preferences" color="#f59e0b" onPress={() => {}} />
        <MenuItem icon="help-circle" label="Help & Support" color="#0ea5e9" onPress={() => {}} />
        <MenuItem icon="log-out" label="Sign Out" color="#f43f5e" onPress={() => {}} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>SchoolIQ Platform v2.4.1</Text>
        <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>Powered by AI · Built for Pakistan</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14, marginBottom: 20 },
  profileAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(16,185,129,0.3)", alignItems: "center", justifyContent: "center" },
  profileInitials: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#10b981" },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  profileRole: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 2 },
  profileSchool: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", marginTop: 1 },
  editBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  tilesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  tile: { width: "47%", padding: 14, borderWidth: 1, gap: 8 },
  tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tileLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tileValue: { fontSize: 12, fontFamily: "Inter_700Bold" },
  menuGroup: { borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  menuBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  pipelineCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  stageWrap: { flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 8 },
  stageDot: { width: 10, height: 10, borderRadius: 5 },
  stageLabel: { width: 90, fontSize: 13, fontFamily: "Inter_500Medium" },
  stageCount: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  stageCountText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  stageBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  stageBarFill: { height: "100%", borderRadius: 3 },
  stagePct: { width: 32, fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "right" },
  footer: { alignItems: "center", paddingTop: 16, gap: 4 },
  footerText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  footerSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
