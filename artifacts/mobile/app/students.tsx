import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { STUDENTS } from "@/constants/demoData";
import { useRouter } from "expo-router";

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}> 
      <View style={{ padding: 12 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>Students</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{STUDENTS.length} students</Text>
      </View>
      <FlatList data={STUDENTS} keyExtractor={(s) => s.id} renderItem={({ item }) => (
        <Pressable style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/student/${item.id}` as never)}>
          <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.class} · {item.section}</Text>
        </Pressable>
      )} contentContainerStyle={{ paddingBottom: 80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  row: { padding: 12, borderWidth: 1, marginHorizontal: 12, marginBottom: 8, borderRadius: 8 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
