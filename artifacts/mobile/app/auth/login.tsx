import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { authService } from "./services/AuthService";

function isPakistanMobile(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("03")) return true; // 0300...
  if (digits.length === 10 && digits.startsWith("3")) return true; // 300...
  return false;
}

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [countryCode, setCountryCode] = useState("+92");
  const [phone, setPhone] = useState("");
  const valid = useMemo(() => isPakistanMobile(phone), [phone]);

  const onContinue = async () => {
    const normalized = phone.replace(/\D/g, "");
    let final = normalized;
    if (final.length === 10 && final.startsWith("3")) final = "0" + final;
    try {
      await authService.sendOtp(final);
      router.push(`/auth/otp?phone=${final}`);
    } catch (e) {
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, backgroundColor: colors.background }]}> 
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Enter your phone number to continue</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.codeInput, { color: colors.foreground, borderColor: colors.border }]}
            value={countryCode}
            onChangeText={setCountryCode}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.phoneInput, { color: colors.foreground, borderColor: colors.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 03001234567"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        <Pressable
          style={[styles.continueBtn, { backgroundColor: valid ? colors.primary : colors.muted }]}
          onPress={onContinue}
          disabled={!valid}
        >
          <Ionicons name="arrow-forward" size={18} color="#fff" />
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 16, padding: 18, borderWidth: 1, borderRadius: 14 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 14 },
  codeInput: { width: 80, padding: 12, borderWidth: 1, borderRadius: 10, textAlign: "center", fontSize: 14 },
  phoneInput: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 10, fontSize: 14 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 12, borderRadius: 12 },
  continueText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});
