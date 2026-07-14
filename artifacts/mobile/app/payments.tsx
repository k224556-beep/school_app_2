import React, { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { STUDENTS, formatPKR } from "@/constants/demoData";
import PaymentService from "@/app/services/PaymentService";
import { useRouter } from "expo-router";

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [studentId, setStudentId] = useState(STUDENTS[0].id);
  const student = STUDENTS.find((s) => s.id === studentId)!;
  const [amount, setAmount] = useState(String(PaymentService.getOutstanding(studentId) || 5000));
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return Alert.alert("Invalid amount", "Enter a valid payment amount.");
    if (cardNumber.replace(/\s/g, "").length < 12) return Alert.alert("Card required", "Enter a valid card number (demo)");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // mark as paid in demo service and get transaction
      const t = PaymentService.markPaid(studentId, amt);
      router.push(`/payment-receipt?student=${studentId}&amount=${amt}&tx=${t.tx}` as never);
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}> 
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12, padding: 12, margin: 12 }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Online Payment (Demo)</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Simulated gateway for testing flows</Text>

        <View style={{ marginTop: 12 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Student</Text>
          <Pressable style={[styles.select, { backgroundColor: colors.background }]} onPress={() => router.push('/students' as never)}>
            <Text style={{ color: colors.foreground }}>{student.name} · {student.class}</Text>
          </Pressable>

          <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 10 }]}>Amount</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />

          <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 10 }]}>Card Number (demo)</Text>
          <TextInput value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" placeholder="4242 4242 4242 4242" style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput value={expiry} onChangeText={setExpiry} placeholder="MM/YY" style={[styles.input, { color: colors.foreground, borderColor: colors.border, flex: 1 }]} />
            <TextInput value={cvc} onChangeText={setCvc} placeholder="CVC" keyboardType="number-pad" style={[styles.input, { color: colors.foreground, borderColor: colors.border, width: 100 }]} />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pressable onPress={() => setAmount(String(student.outstandingBalance || 0))} style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.foreground }}>Use Outstanding</Text>
            </Pressable>
            <Pressable onPress={() => setAmount('5000')} style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.foreground }}>PKR 5,000</Text>
            </Pressable>
          </View>

          <Pressable onPress={handlePay} style={[styles.payBtn, { backgroundColor: '#10b981', marginTop: 14 }]} disabled={loading}>
            <Text style={{ color: '#fff' }}>{loading ? 'Processing...' : `Pay ${formatPKR(Number(amount || 0))}`}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 8 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  select: { padding: 12, borderWidth: 1, borderRadius: 8, marginTop: 6 },
  input: { borderWidth: 1, padding: 10, borderRadius: 8, marginTop: 6 },
  quickBtn: { padding: 10, borderWidth: 1, borderRadius: 8 },
  payBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});
