import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import UserRepository from "./services/UserRepository";
import SessionService from "./services/SessionService";
import { routeForRole } from "./routeForRole";
import { Role } from "./models";
import { Ionicons } from "@expo/vector-icons";

export default function RoleSelection() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) ?? "";
  const router = useRouter();

  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await UserRepository.findByPhone(phone);
      if (!mounted) return;
      setUser(u);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [phone]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>User not found.</Text>
      </View>
    );
  }

  const choose = async (role: Role) => {
    await SessionService.saveSession({ phone, role, loggedInAt: new Date().toISOString() });
    router.replace(routeForRole(role) as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Choose your role</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Select which role you want to operate as for this session.</Text>

        {user.roles.map((r: Role) => (
          <Pressable key={r} style={[styles.roleCard, { borderColor: colors.border }]} onPress={() => choose(r)}>
            <View style={styles.roleLeft}>
              <Ionicons name={r === "Admin" ? "shield" : r === "Teacher" ? "person" : "people"} size={22} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.roleTitle, { color: colors.foreground }]}>{r}</Text>
                <Text style={[styles.roleSub, { color: colors.mutedForeground }]}>{r === "Admin" ? "Full access" : r === "Teacher" ? "Class tools" : "Parent view"}</Text>
              </View>
            </View>
            <Text style={{ color: colors.primary }}>Select</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginTop: 40, padding: 18, borderWidth: 1, borderRadius: 14 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  roleCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 10 },
  roleLeft: { flexDirection: "row", alignItems: "center" },
  roleTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  roleSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
