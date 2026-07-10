import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { authService } from "./services/AuthService";
import UserRepository from "./services/UserRepository";
import SessionService from "./services/SessionService";

export default function OTPScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) ?? "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // autofocus first
    inputs.current[0]?.focus();
  }, []);

  const onChange = (i: number, v: string) => {
    const cleaned = v.replace(/\D/g, "");
    // If user pasted the whole code into one box, spread it across inputs
    if (cleaned.length > 1) {
      const chars = cleaned.split("").slice(0, 6);
      const next = [...digits];
      for (let k = 0; k < chars.length; k++) next[k] = chars[k];
      setDigits(next);
      // focus last filled
      const lastIdx = Math.min(5, chars.length - 1);
      inputs.current[lastIdx]?.focus();
      return;
    }

    const ch = cleaned.slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const otp = digits.join("");

  useEffect(() => {
    if (otp.length === 6 && !loading) {
      const id = setTimeout(() => {
        onVerify();
      }, 150);
      return () => clearTimeout(id);
    }
  }, [otp]);

  const onVerify = async () => {
    setLoading(true);
    const res = await authService.verifyOtp(phone, otp);
    setLoading(false);
    if (!res.success) {
      Alert.alert("OTP Failed", res.message ?? "Invalid OTP");
      return;
    }
    const user = await UserRepository.findByPhone(phone);
    if (!user) {
      Alert.alert("User not registered.", "Please contact admin.");
      return;
    }
    if (user.roles.length === 1) {
      // save session and go
      await SessionService.saveSession({ phone, role: user.roles[0], loggedInAt: new Date().toISOString() });
      if (user.roles[0] === "Admin") router.replace("/");
      else if (user.roles[0] === "Teacher") router.replace("/teacher-dashboard");
      else router.replace("/parent-dashboard");
    } else {
      router.push(`/auth/role-selection?phone=${phone}`);
    }
  };

  const onResend = async () => {
    await authService.sendOtp(phone);
    setSeconds(60);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Enter the 6-digit code sent to {phone}</Text>

        <View style={styles.otpRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TextInput
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digits[i]}
              onChangeText={(v) => onChange(i, v)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && digits[i] === "" && i > 0) {
                  inputs.current[i - 1]?.focus();
                }
              }}
              style={[styles.otpBox, { borderColor: colors.border, color: colors.foreground }]}
              keyboardType="number-pad"
              maxLength={6}
              accessible
              accessibilityLabel={`OTP digit ${i + 1}`}
            />
          ))}
        </View>

        <View style={styles.rowBetween}>
          <Text style={{ color: colors.mutedForeground }}>{seconds > 0 ? `Resend in ${seconds}s` : "You can resend now"}</Text>
          <Pressable onPress={onResend} disabled={seconds > 0}>
            <Text style={{ color: seconds > 0 ? colors.mutedForeground : colors.primary }}>Resend</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.verifyBtn, { backgroundColor: colors.primary }]} onPress={onVerify} disabled={loading}>
          <Text style={styles.verifyText}>{loading ? "Verifying..." : "Verify"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginTop: 40, padding: 18, borderWidth: 1, borderRadius: 14 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  otpBox: { width: 44, height: 52, borderWidth: 1, borderRadius: 8, textAlign: "center", fontSize: 20 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  verifyBtn: { padding: 12, borderRadius: 12, alignItems: "center" },
  verifyText: { color: "#fff", fontFamily: "Inter_700Bold" },
});
