import React, { useState, useMemo } from "react";
import {
  StyleSheet, Text, View, Platform, Pressable, FlatList, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { STUDENTS } from "@/constants/demoData";

type Channel = "whatsapp" | "call" | "sms" | "email";
type ResponseStatus = "replied" | "read" | "sent" | "no_response";

const CHANNEL_CONFIG: Record<Channel, { icon: string; color: string; label: string }> = {
  whatsapp: { icon: "logo-whatsapp", color: "#25d366", label: "WhatsApp" },
  call:     { icon: "call",          color: "#0ea5e9", label: "Call"      },
  sms:      { icon: "chatbubble",    color: "#8b5cf6", label: "SMS"       },
  email:    { icon: "mail",          color: "#f59e0b", label: "Email"     },
};

const RESPONSE_CONFIG: Record<ResponseStatus, { color: string; label: string; icon: string }> = {
  replied:     { color: "#10b981", label: "Replied",    icon: "checkmark-done" },
  read:        { color: "#53bdeb", label: "Read",       icon: "checkmark-done" },
  sent:        { color: "#94a3b8", label: "Sent",       icon: "checkmark"      },
  no_response: { color: "#f43f5e", label: "No Reply",   icon: "time-outline"   },
};

function rng(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
}

const CHANNELS: Channel[] = ["whatsapp", "call", "sms", "email"];
const STATUSES: ResponseStatus[] = ["replied", "replied", "read", "sent", "no_response"];

const MESSAGES = [
  "Fee reminder: Your child's fee of PKR {amount} is due. Please pay at the earliest.",
  "Assalam-o-Alaikum! Attendance notification: {name} was absent today.",
  "Parent-Teacher Meeting scheduled for next Monday at 2 PM. Please confirm attendance.",
  "Your child's exam results are ready. Please visit the school office to collect the report card.",
  "Reminder: School bus timings have changed. New pickup time is 7:15 AM.",
  "PTM tomorrow at 3:00 PM. Please bring your child's previous report card.",
  "Fee due date is approaching — PKR {amount} outstanding. Pay now to avoid fine.",
];

const PARENT_MSGS = [
  "Thank you, will pay today InshaAllah.",
  "Okay, understood. We will be there.",
  "JazakAllah khair for the reminder.",
  "Please give us 2 more days.",
  "",
  "",
];

interface CommRecord {
  id: string;
  studentId: string;
  studentName: string;
  guardian: string;
  phone: string;
  class: string;
  lastChannel: Channel;
  lastStatus: ResponseStatus;
  daysAgo: number;
  totalContacts: number;
  thread: Array<{ from: "school" | "parent"; text: string; time: string; channel: Channel }>;
}

function generateThread(seed: number, channel: Channel, studentName: string, amount: number): CommRecord["thread"] {
  const count = rng(seed, 1, 3);
  const thread: CommRecord["thread"] = [];
  const hrs = [10, 14, 16, 9, 11];
  const mins = [30, 15, 45, 0, 20];

  for (let i = 0; i < count; i++) {
    const msgTemplate = MESSAGES[rng(seed + i * 7, 0, MESSAGES.length - 1)];
    const msg = msgTemplate.replace("{amount}", `${(rng(seed + i, 5, 18) * 1000).toLocaleString()}`).replace("{name}", studentName);
    const h = hrs[(seed + i) % hrs.length];
    const m = mins[(seed + i) % mins.length];
    thread.push({
      from: "school",
      text: msg,
      time: `${h}:${String(m).padStart(2, "0")} AM`,
      channel,
    });
    const reply = PARENT_MSGS[rng(seed + i * 13, 0, PARENT_MSGS.length - 1)];
    if (reply) {
      thread.push({ from: "parent", text: reply, time: `${h + 1}:${String(m).padStart(2, "0")} AM`, channel });
    }
  }
  return thread;
}

const NON_PAID = STUDENTS.filter((s) => s.feeStatus !== "paid").slice(0, 40);

const COMM_RECORDS: CommRecord[] = NON_PAID.map((s, i) => {
  const seed = i * 97 + 37;
  const channel = CHANNELS[rng(seed, 0, CHANNELS.length - 1)];
  const status = STATUSES[rng(seed * 3, 0, STATUSES.length - 1)];
  const daysAgo = rng(seed * 7, 0, 14);
  const totalContacts = rng(seed * 11, 1, 8);
  const thread = generateThread(seed, channel, s.name, s.outstandingBalance);

  return {
    id: s.id,
    studentId: s.id,
    studentName: s.name,
    guardian: s.guardian,
    phone: s.phone,
    class: s.class,
    lastChannel: channel,
    lastStatus: status,
    daysAgo,
    totalContacts,
    thread,
  };
}).sort((a, b) => b.daysAgo - a.daysAgo);

function ThreadBubble({ msg }: { msg: CommRecord["thread"][number] }) {
  const colors = useColors();
  const isSchool = msg.from === "school";
  const channelCfg = CHANNEL_CONFIG[msg.channel];

  return (
    <View style={[styles.bubble, isSchool ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isSchool && (
        <View style={[styles.bubbleAvatar, { backgroundColor: "#0ea5e920" }]}>
          <Ionicons name="person-outline" size={12} color="#0ea5e9" />
        </View>
      )}
      <View style={{ maxWidth: "80%" }}>
        <View style={[styles.bubbleBody, {
          backgroundColor: isSchool ? "#10b98120" : colors.card,
          borderColor: isSchool ? "#10b98140" : colors.border,
          alignSelf: isSchool ? "flex-end" : "flex-start",
        }]}>
          {isSchool && (
            <View style={styles.bubbleChannel}>
              <Ionicons name={channelCfg.icon as any} size={10} color={channelCfg.color} />
              <Text style={[styles.bubbleChannelTxt, { color: channelCfg.color }]}>{channelCfg.label}</Text>
            </View>
          )}
          <Text style={[styles.bubbleText, { color: isSchool ? "#e2fde8" : colors.foreground }]}>{msg.text}</Text>
        </View>
        <Text style={[styles.bubbleTime, { color: colors.mutedForeground, alignSelf: isSchool ? "flex-end" : "flex-start" }]}>
          {msg.time}
        </Text>
      </View>
    </View>
  );
}

function CommRow({ rec, onPress }: { rec: CommRecord; onPress: () => void }) {
  const colors = useColors();
  const chanCfg = CHANNEL_CONFIG[rec.lastChannel];
  const resCfg = RESPONSE_CONFIG[rec.lastStatus];
  const initials = rec.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const timeStr = rec.daysAgo === 0 ? "Today" : rec.daysAgo === 1 ? "Yesterday" : `${rec.daysAgo}d ago`;

  return (
    <Pressable onPress={onPress} style={[styles.commRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.commAvatar, { backgroundColor: chanCfg.color + "20" }]}>
        <Text style={[styles.commInitials, { color: chanCfg.color }]}>{initials}</Text>
        <View style={[styles.commChannelDot, { backgroundColor: chanCfg.color }]}>
          <Ionicons name={chanCfg.icon as any} size={8} color="#fff" />
        </View>
      </View>
      <View style={styles.commInfo}>
        <View style={styles.commTopRow}>
          <Text style={[styles.commGuardian, { color: colors.foreground }]} numberOfLines={1}>{rec.guardian}</Text>
          <Text style={[styles.commTime, { color: colors.mutedForeground }]}>{timeStr}</Text>
        </View>
        <Text style={[styles.commStudent, { color: colors.mutedForeground }]} numberOfLines={1}>
          {rec.studentName} · {rec.class}
        </Text>
        <View style={styles.commBottomRow}>
          <View style={[styles.responseChip, { backgroundColor: resCfg.color + "18" }]}>
            <Ionicons name={resCfg.icon as any} size={10} color={resCfg.color} />
            <Text style={[styles.responseChipTxt, { color: resCfg.color }]}>{resCfg.label}</Text>
          </View>
          <Text style={[styles.contactCount, { color: colors.mutedForeground }]}>{rec.totalContacts} contacts</Text>
        </View>
      </View>
    </Pressable>
  );
}

type FilterKey = "all" | "no_response" | "replied" | Channel;

export default function ParentCommsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<CommRecord | null>(null);

  const filtered = useMemo(() => {
    return COMM_RECORDS.filter((r) => {
      const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.guardian.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ? true :
        filter === "no_response" ? r.lastStatus === "no_response" :
        filter === "replied" ? r.lastStatus === "replied" :
        r.lastChannel === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const noResponseCount = COMM_RECORDS.filter((r) => r.lastStatus === "no_response").length;

  const FILTER_OPTIONS: Array<{ key: FilterKey; label: string; color: string }> = [
    { key: "all", label: "All", color: colors.primary },
    { key: "no_response", label: `No Reply (${noResponseCount})`, color: "#f43f5e" },
    { key: "replied", label: "Replied", color: "#10b981" },
    { key: "whatsapp", label: "WhatsApp", color: "#25d366" },
    { key: "call", label: "Calls", color: "#0ea5e9" },
  ];

  if (selected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.threadHeader, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => setSelected(null)}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.threadTitle, { color: colors.foreground }]}>{selected.guardian}</Text>
            <Text style={[styles.threadSub, { color: colors.mutedForeground }]}>
              {selected.studentName} · {selected.phone}
            </Text>
          </View>
          <Pressable style={[styles.callBtn, { backgroundColor: "#0ea5e920" }]}>
            <Ionicons name="call" size={18} color="#0ea5e9" />
          </Pressable>
          <Pressable style={[styles.callBtn, { backgroundColor: "#25d36620" }]}>
            <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
          </Pressable>
        </View>
        <FlatList
          data={selected.thread}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: bottomPad + 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ThreadBubble msg={item} />}
          ListHeaderComponent={() => (
            <View style={[styles.threadDate, { backgroundColor: colors.muted }]}>
              <Text style={[styles.threadDateTxt, { color: colors.mutedForeground }]}>March 2025</Text>
            </View>
          )}
        />
        <View style={[styles.composerBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.composer, { backgroundColor: colors.muted, color: colors.foreground }]}
          />
          <Pressable style={[styles.sendBtn, { backgroundColor: "#25d366" }]}>
            <Ionicons name="paper-plane" size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Parent Comms</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{COMM_RECORDS.length} active threads</Text>
          </View>
          <View style={[styles.urgentBadge, { backgroundColor: "#f43f5e20" }]}>
            <Ionicons name="warning" size={12} color="#f43f5e" />
            <Text style={styles.urgentTxt}>{noResponseCount} no reply</Text>
          </View>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search parent or student..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={{ gap: 6 }}
          renderItem={({ item: f }) => (
            <Pressable
              onPress={() => setFilter(f.key)}
              style={[styles.filterPill, { backgroundColor: filter === f.key ? f.color : colors.muted }]}
            >
              <Text style={[styles.filterTxt, { color: filter === f.key ? "#fff" : colors.mutedForeground }]}>{f.label}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: bottomPad + 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CommRow rec={item} onPress={() => setSelected(item)} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTxt, { color: colors.mutedForeground }]}>No conversations found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 14, paddingBottom: 12, gap: 10, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  urgentBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 },
  urgentTxt: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#f43f5e" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  filterTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  commRow: { flexDirection: "row", padding: 12, borderWidth: 1, borderRadius: 14, gap: 10 },
  commAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "relative" },
  commInitials: { fontSize: 14, fontFamily: "Inter_700Bold" },
  commChannelDot: { position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  commInfo: { flex: 1, gap: 4 },
  commTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commGuardian: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  commTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  commStudent: { fontSize: 12, fontFamily: "Inter_400Regular" },
  commBottomRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  responseChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  responseChipTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  contactCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTxt: { fontSize: 15, fontFamily: "Inter_500Medium" },
  threadHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingBottom: 14, borderBottomWidth: 1 },
  threadTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  threadSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  callBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  bubble: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  bubbleLeft: { justifyContent: "flex-start" },
  bubbleRight: { justifyContent: "flex-end" },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bubbleBody: { padding: 10, borderRadius: 14, borderWidth: 1, gap: 4 },
  bubbleChannel: { flexDirection: "row", alignItems: "center", gap: 4 },
  bubbleChannelTxt: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  bubbleText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2, paddingHorizontal: 2 },
  threadDate: { alignSelf: "center", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 12 },
  threadDateTxt: { fontSize: 12, fontFamily: "Inter_500Medium" },
  composerBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  composer: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, fontSize: 14, fontFamily: "Inter_400Regular" },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
