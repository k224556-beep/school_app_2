import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { STUDENTS } from "@/constants/demoData";
import { useRouter } from "expo-router";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [q, setQ] = useState("");

  const results = STUDENTS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}> 
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <TextInput placeholder="Search students, teachers, fees..." value={q} onChangeText={setQ} style={[styles.input, { color: colors.foreground }]} />
      </View>
      <FlatList data={results} keyExtractor={(it) => it.id} renderItem={({ item }) => (
        <Pressable style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(`/student/${item.id}` as never)}>
          <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.class}</Text>
        </Pressable>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: { padding: 10, margin: 12, borderWidth: 1, borderRadius: 10 },
  input: { height: 40 },
  row: { padding: 12, borderWidth: 1, marginHorizontal: 12, marginBottom: 8, borderRadius: 8 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
