import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet, Text, View, Platform, Pressable, FlatList,
  TextInput,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { DEMO_CHAT } from "@/constants/demoData";
import * as Haptics from "expo-haptics";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  data?: string;
}

function AIPulse() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.3, { duration: 900 }), withTiming(1, { duration: 900 })), -1, false);
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.4, { duration: 900 })), -1, false);
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.pulseBg, style]} />
  );
}

function UserBubble({ message }: { message: Message }) {
  const colors = useColors();
  return (
    <View style={styles.userRow}>
      <LinearGradient
        colors={[colors.primary, colors.accent ?? "#0ea5e9"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.userBubble, { borderRadius: 18, borderBottomRightRadius: 4 }]}
      >
        <Text style={styles.userText}>{message.text}</Text>
      </LinearGradient>
    </View>
  );
}

function AIBubble({ message }: { message: Message }) {
  const colors = useColors();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 14 });
    opacity.value = withTiming(1, { duration: 400 });
  }, [opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.aiRow, style]}>
      <View style={styles.aiAvatar}>
        <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.aiAvatarGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="sparkles" size={14} color="#fff" />
        </LinearGradient>
      </View>
      <View style={styles.aiBubbleWrap}>
        <View style={[styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18, borderTopLeftRadius: 4 }]}>
          <Text style={[styles.aiText, { color: colors.foreground }]}>{message.text}</Text>
          {message.data && (
            <View style={[styles.dataChip, { backgroundColor: colors.primary + "20", borderRadius: 8 }]}>
              <Ionicons name="bar-chart" size={12} color={colors.primary} />
              <Text style={[styles.dataText, { color: colors.primary }]}>{message.data}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function TypingIndicator() {
  const colors = useColors();
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);

  useEffect(() => {
    const animate = (v: typeof d1, delay: number) => {
      setTimeout(() => {
        v.value = withRepeat(withSequence(withTiming(-6, { duration: 300 }), withTiming(0, { duration: 300 })), -1, false);
      }, delay);
    };
    animate(d1, 0);
    animate(d2, 150);
    animate(d3, 300);
  }, [d1, d2, d3]);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: d1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: d2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: d3.value }] }));

  return (
    <View style={styles.aiRow}>
      <View style={styles.aiAvatar}>
        <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.aiAvatarGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="sparkles" size={14} color="#fff" />
        </LinearGradient>
      </View>
      <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.mutedForeground }, s1]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.mutedForeground }, s2]} />
        <Animated.View style={[styles.dot, { backgroundColor: colors.mutedForeground }, s3]} />
      </View>
    </View>
  );
}

const QUICK_PROMPTS = [
  "Why has fee collection dropped?",
  "Which students are at risk?",
  "Show Grade 7 attendance",
  "Revenue forecast this month",
];

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(
    DEMO_CHAT.map((m, i) => ({ ...m, id: String(i) }))
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const AI_RESPONSES = [
    "I'm analyzing your school data... Based on current trends, fee collection is down primarily in Grade 6 and Grade 7. Sending targeted reminders can improve recovery by 15%.",
    "Based on attendance and fee data, I've identified 12 high-risk students. Would you like me to generate a parent outreach list?",
    "Your school's overall performance score is 87/100. Attendance is strong at 87% but fee recovery needs attention in lower grades.",
    "Revenue forecast for this month: PKR 3,910,000 with 92% confidence. This is 8% below last month's collection.",
  ];

  let aiResponseIdx = 0;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: AI_RESPONSES[aiResponseIdx % AI_RESPONSES.length],
        data: aiResponseIdx % 2 === 0 ? "Live school data · March 2025" : undefined,
      };
      aiResponseIdx += 1;
      setMessages((prev) => [...prev, aiMsg]);
    }, 1800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#1e1040", "#0a1628"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.aiLogoWrap}>
            <AIPulse />
            <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.aiLogo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>SchoolAI Assistant</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Live school data · March 2025</Text>
            </View>
          </View>
          <Pressable style={[styles.clearBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <Ionicons name="refresh-outline" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.role === "user" ? <UserBubble message={item} /> : <AIBubble message={item} />
        }
        ListFooterComponent={typing ? <TypingIndicator /> : null}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        scrollEnabled={!!messages.length}
      />

      {/* Quick Prompts */}
      <View style={[styles.quickRow, { borderTopColor: colors.border }]}>
        {QUICK_PROMPTS.map((p) => (
          <Pressable key={p} onPress={() => sendMessage(p)} style={[styles.quickChip, { backgroundColor: colors.muted, borderRadius: 20 }]}>
            <Text style={[styles.quickText, { color: colors.mutedForeground }]} numberOfLines={1}>{p}</Text>
          </Pressable>
        ))}
      </View>

      {/* Input */}
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0}>
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderRadius: 24 }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Ask about students, fees, attendance..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />
          </View>
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
          >
            <LinearGradient colors={["#8b5cf6", "#0ea5e9"]} style={styles.sendGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="send" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiLogoWrap: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  pulseBg: { borderRadius: 24, backgroundColor: "#8b5cf640" },
  aiLogo: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10b981" },
  onlineText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  clearBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  messageList: { padding: 16, gap: 12, paddingBottom: 8 },
  userRow: { alignItems: "flex-end", marginBottom: 10 },
  userBubble: { maxWidth: "78%", paddingHorizontal: 16, paddingVertical: 12 },
  userText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#fff", lineHeight: 20 },
  aiRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 10 },
  aiAvatar: { width: 32, height: 32 },
  aiAvatarGrad: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  aiBubbleWrap: { flex: 1 },
  aiBubble: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 10, maxWidth: "90%" },
  aiText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  dataChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  dataText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  typingBubble: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  quickRow: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", flexWrap: "wrap", gap: 6, borderTopWidth: 1 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 6 },
  quickText: { fontSize: 12, fontFamily: "Inter_500Medium", maxWidth: 160 },
  inputBar: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 10, gap: 10, alignItems: "flex-end", borderTopWidth: 1 },
  inputWrap: { flex: 1, paddingHorizontal: 16, paddingVertical: 10 },
  input: { fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: {},
  sendGrad: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
