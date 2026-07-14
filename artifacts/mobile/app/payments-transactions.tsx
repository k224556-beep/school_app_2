import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import PaymentService from "@/app/services/PaymentService";
import { STUDENTS, formatPKR } from "@/constants/demoData";

export default function PaymentsTransactions() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tx = PaymentService.getTransactions();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}> 
      <View style={{ padding: 12 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>Transactions (demo)</Text>
      </View>
      <FlatList
        data={tx}
        keyExtractor={(t) => t.tx}
        renderItem={({ item }) => {
          const student = STUDENTS.find((s) => s.id === item.studentId);
          return (
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.name, { color: colors.foreground }]}>{student ? student.name : item.studentId}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{formatPKR(item.amount)}</Text>
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <View style={{ padding: 12 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Transactions ({tx.length})</Text>
            <Pressable style={{ marginTop: 8 }} onPress={async () => {
              // export all transactions to CSV
              const rows = tx.map((t) => `${t.tx},${t.studentId},${t.amount},${t.date}`).join('\n');
              const csv = `tx,studentId,amount,date\n${rows}`;
              try {
                // @ts-ignore
                const FileSystem = await import('expo-file-system');
                // @ts-ignore
                const Sharing = await import('expo-sharing');
                const path = (FileSystem.cacheDirectory || '') + `transactions-${Date.now()}.csv`;
                await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
                await Sharing.shareAsync(path);
              } catch (e) {
                try {
                  // @ts-ignore
                  const Clipboard = await import('expo-clipboard');
                  await Clipboard.setStringAsync(csv);
                  alert('CSV copied to clipboard');
                } catch (err) {
                  console.warn('Export failed', err);
                  alert('Export not available on this platform.');
                }
              }
            }}>
              <Text style={{ color: colors.primary }}>Export CSV</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  row: { padding: 12, borderWidth: 1, marginHorizontal: 12, marginBottom: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
