import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { STUDENTS, formatPKR } from "@/constants/demoData";
import PaymentService from "@/app/services/PaymentService";

export default function PaymentReceipt() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const studentId = (params.student as string) ?? "";
  const amount = Number(params.amount ?? 0);
  const tx = (params.tx as string) ?? "";
  const student = STUDENTS.find((s) => s.id === studentId);
  const remaining = PaymentService.getOutstanding(studentId);
  // find transaction date if available
  const txRec = PaymentService.getTransactions().find((t) => t.tx === tx);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}> 
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12, padding: 16, margin: 12 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Payment Receipt</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Transaction ID: {tx}</Text>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.mutedForeground }}>Payer</Text>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>{student ? student.name : 'Unknown'}</Text>

          <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>Amount</Text>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{formatPKR(amount)}</Text>

          <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>Status</Text>
          <Text style={{ color: '#10b981', fontFamily: 'Inter_600SemiBold' }}>Success</Text>

          <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>Outstanding After Payment</Text>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{formatPKR(remaining)}</Text>

          {txRec && (
            <>
              <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>Transaction Date</Text>
              <Text style={{ color: colors.foreground }}>{new Date(txRec.date).toLocaleString()}</Text>
            </>
          )}

          <Pressable style={[styles.exportBtn, { marginTop: 12, padding: 10, borderRadius: 8 }]} onPress={async () => {
            // export the single receipt as CSV via FileSystem/Sharing if available
            const csv = `tx,student,amount,date\n${tx},${student ? student.name : ''},${amount},${txRec?.date ?? ''}`;
            try {
              // @ts-ignore: optional runtime dependency
              const FileSystem = await import('expo-file-system');
              // @ts-ignore
              const Sharing = await import('expo-sharing');
              const path = (FileSystem.cacheDirectory || '') + `receipt-${tx}.csv`;
              await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
              await Sharing.shareAsync(path);
            } catch (e) {
              try {
                // fallback: copy to clipboard
                // @ts-ignore
                const Clipboard = await import('expo-clipboard');
                await Clipboard.setStringAsync(csv);
                // eslint-disable-next-line no-alert
                alert('CSV copied to clipboard');
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('Export failed', err);
                // eslint-disable-next-line no-alert
                alert('Export not available on this platform.');
              }
            }
          }}>
            <Text style={{ color: colors.foreground }}>Export CSV</Text>
          </Pressable>

          <Pressable style={[styles.doneBtn, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={() => router.replace(`/student/${studentId}` as never)}>
            <Text style={{ color: '#fff' }}>View Student</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {},
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  doneBtn: { padding: 12, borderRadius: 10, alignItems: 'center' },
  exportBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
