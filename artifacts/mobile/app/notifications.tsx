import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 80 }}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border, padding: 12 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Recent alerts and system messages</Text>
      </View>

      <View style={{ padding: 12, gap: 8 }}>
        <Pressable style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/') }>
          <Ionicons name="alert-circle" size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.itemTitle, { color: colors.foreground }]}>Fee collection reminder</Text>
            <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>Class 6-8 · 2 days left</Text>
          </View>
        </Pressable>

        <Pressable style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/reports' as never)}>
          <Ionicons name="bar-chart" size={18} color="#10b981" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.itemTitle, { color: colors.foreground }]}>Monthly revenue report ready</Text>
            <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>March 2025</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 8 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderWidth: 1, borderRadius: 10 },
  itemTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  itemMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
