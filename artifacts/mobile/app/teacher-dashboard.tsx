import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import SessionService from "./auth/services/SessionService";
import { useRouter } from "expo-router";

export default function TeacherDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onLogout = async () => {
    await SessionService.clearSession();
    router.replace("/auth/login");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120, paddingHorizontal: 16 }}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, padding: 16 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Teacher Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Overview and class tools</Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Today's Classes</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>3 scheduled</Text>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]} onPress={onLogout}>
          <Text style={[styles.cardTitle, { color: "#f43f5e" }]}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  card: { padding: 14, borderWidth: 1, borderRadius: 12 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6 },
});
