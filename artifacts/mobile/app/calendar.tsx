import React, { useState, useMemo } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

type EventType = "exam" | "fee" | "event" | "holiday" | "meeting";

interface CalEvent {
  id: string;
  date: number;
  month: number;
  title: string;
  type: EventType;
  time?: string;
  desc?: string;
}

const EVENT_CONFIG: Record<EventType, { color: string; bg: string; icon: string; label: string }> = {
  exam:    { color: "#8b5cf6", bg: "#8b5cf620", icon: "school-outline",      label: "Exam"    },
  fee:     { color: "#f43f5e", bg: "#f43f5e20", icon: "wallet-outline",      label: "Fee Due" },
  event:   { color: "#0ea5e9", bg: "#0ea5e920", icon: "star-outline",        label: "Event"   },
  holiday: { color: "#10b981", bg: "#10b98120", icon: "sunny-outline",       label: "Holiday" },
  meeting: { color: "#f59e0b", bg: "#f59e0b20", icon: "people-outline",      label: "Meeting" },
};

const EVENTS: CalEvent[] = [
  { id: "1",  date: 3,  month: 3, title: "Unit Test 2 — All Classes",   type: "exam",    time: "8:00 AM",  desc: "Written test covering chapters 5–8. Students must bring stationery." },
  { id: "2",  date: 7,  month: 3, title: "Pakistan Day Holiday",         type: "holiday",              desc: "School closed for Pakistan Day." },
  { id: "3",  date: 10, month: 3, title: "Fee Due Date — March",         type: "fee",     time: "Last day",desc: "Monthly fee deadline. Late fee fine of PKR 500 applies after this date." },
  { id: "4",  date: 12, month: 3, title: "Parent-Teacher Meeting",       type: "meeting", time: "2:00 PM", desc: "PTM for Grade 6, 7, and 8. Parents must bring last term report card." },
  { id: "5",  date: 15, month: 3, title: "Science Fair — Grade 8-10",    type: "event",   time: "10:00 AM",desc: "Annual science exhibition. Judges from University of Lahore attending." },
  { id: "6",  date: 18, month: 3, title: "Mid-Term Exams Begin",         type: "exam",    time: "8:00 AM", desc: "Mid-term exams for all grades. Schedule distributed separately." },
  { id: "7",  date: 20, month: 3, title: "Annual Sports Day",            type: "event",   time: "9:00 AM", desc: "Track & field events, prizes for top performers in each category." },
  { id: "8",  date: 23, month: 3, title: "Mid-Term Exams End",           type: "exam",    time: "12:00 PM",desc: "Final day of mid-term examinations." },
  { id: "9",  date: 25, month: 3, title: "Report Cards Distribution",    type: "meeting", time: "3:00 PM", desc: "Parents must collect report cards in person from class teachers." },
  { id: "10", date: 28, month: 3, title: "Staff Training Day",           type: "holiday",              desc: "School closed for students. Staff professional development day." },
  { id: "11", date: 31, month: 3, title: "Fee Due — Next Month",         type: "fee",     time: "Deadline",desc: "April fee submission deadline. Online payment available." },
  { id: "12", date: 5,  month: 4, title: "Quran Competition",            type: "event",   time: "9:00 AM", desc: "School-wide Quran recitation competition. Open to all students." },
  { id: "13", date: 8,  month: 4, title: "Eid Holidays Begin",           type: "holiday",              desc: "School closed for Eid ul-Fitr. Duration subject to moon sighting." },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [month, setMonth] = useState(3);
  const [year] = useState(2025);
  const [selectedDay, setSelectedDay] = useState<number | null>(18);
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  const monthEvents = useMemo(
    () => EVENTS.filter((e) => e.month === month),
    [month]
  );

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalEvent[]> = {};
    monthEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [monthEvents]);

  const selectedEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dayEvts = eventsByDay[selectedDay] ?? [];
    return typeFilter === "all" ? dayEvts : dayEvts.filter((e) => e.type === typeFilter);
  }, [selectedDay, eventsByDay, typeFilter]);

  const upcomingEvents = useMemo(() => {
    const today = 18;
    return monthEvents
      .filter((e) => e.date >= today && (typeFilter === "all" || e.type === typeFilter))
      .sort((a, b) => a.date - b.date)
      .slice(0, 6);
  }, [monthEvents, typeFilter]);

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const prevMonth = () => {
    setMonth((m) => (m === 1 ? 12 : m - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setMonth((m) => (m === 12 ? 1 : m + 1));
    setSelectedDay(null);
  };

  const calendarCells: Array<{ day: number | null }> = [
    ...Array(firstDay).fill({ day: null }),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1 })),
  ];

  const today = 18;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={["#0a1628", "#0d1b2e"]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Text style={styles.headerTitle}>School Calendar</Text>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
          <Pressable onPress={nextMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        {/* Days of week */}
        <View style={styles.weekRow}>
          {DAYS_OF_WEEK.map((d) => (
            <Text key={d} style={[styles.weekDay, d === "Fri" || d === "Sun" ? styles.weekendDay : {}]}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {calendarCells.map((cell, idx) => {
            if (!cell.day) return <View key={`empty-${idx}`} style={styles.calCell} />;
            const day = cell.day;
            const dayEvts = eventsByDay[day] ?? [];
            const isToday = day === today;
            const isSelected = day === selectedDay;
            const isFriday = (idx) % 7 === 5;
            const isSunday = (idx) % 7 === 0;

            return (
              <Pressable
                key={day}
                onPress={() => handleDayPress(day)}
                style={[
                  styles.calCell,
                  isSelected && { backgroundColor: colors.primary, borderRadius: 10 },
                  isToday && !isSelected && { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10 },
                ]}
              >
                <Text style={[
                  styles.calDayTxt,
                  { color: isSelected ? "#fff" : (isFriday || isSunday) ? "#f43f5e" : "rgba(255,255,255,0.8)" },
                  isToday && !isSelected && { color: colors.primary, fontFamily: "Inter_700Bold" },
                ]}>
                  {day}
                </Text>
                <View style={styles.dotRow}>
                  {dayEvts.slice(0, 3).map((e) => (
                    <View
                      key={e.id}
                      style={[styles.eventDot, { backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : EVENT_CONFIG[e.type].color }]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {(Object.keys(EVENT_CONFIG) as EventType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(typeFilter === t ? "all" : t)}
              style={styles.legendItem}
            >
              <View style={[styles.legendDot, {
                backgroundColor: EVENT_CONFIG[t].color,
                opacity: typeFilter !== "all" && typeFilter !== t ? 0.3 : 1,
              }]} />
              <Text style={[styles.legendTxt, { opacity: typeFilter !== "all" && typeFilter !== t ? 0.3 : 1 }]}>
                {EVENT_CONFIG[t].label}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Selected day events */}
        {selectedDay && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {selectedDay} {MONTHS[month - 1]}
              {selectedEvents.length === 0 && " — No events"}
            </Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {selectedEvents.map((evt) => {
                const cfg = EVENT_CONFIG[evt.type];
                return (
                  <View key={evt.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: cfg.color + "40", borderRadius: colors.radius - 4 }]}>
                    <View style={[styles.eventColorBar, { backgroundColor: cfg.color }]} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.eventCardTop}>
                        <View style={[styles.eventTypePill, { backgroundColor: cfg.bg }]}>
                          <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
                          <Text style={[styles.eventTypeTxt, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                        {evt.time && <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>{evt.time}</Text>}
                      </View>
                      <Text style={[styles.eventTitle, { color: colors.foreground }]}>{evt.title}</Text>
                      {evt.desc && <Text style={[styles.eventDesc, { color: colors.mutedForeground }]}>{evt.desc}</Text>}
                    </View>
                  </View>
                );
              })}
              {selectedEvents.length === 0 && (
                <View style={[styles.noEventCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
                  <Ionicons name="calendar-outline" size={24} color={colors.mutedForeground} />
                  <Text style={[styles.noEventTxt, { color: colors.mutedForeground }]}>No events scheduled</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Upcoming Events */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>
          Upcoming — {MONTHS[month - 1]}
        </Text>
        <View style={{ gap: 8 }}>
          {upcomingEvents.map((evt) => {
            const cfg = EVENT_CONFIG[evt.type];
            return (
              <Pressable
                key={evt.id}
                onPress={() => handleDayPress(evt.date)}
                style={[styles.upcomingRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
              >
                <View style={[styles.upcomingDate, { backgroundColor: cfg.color + "20" }]}>
                  <Text style={[styles.upcomingDateDay, { color: cfg.color }]}>{evt.date}</Text>
                  <Text style={[styles.upcomingDateMo, { color: cfg.color + "aa" }]}>{MONTHS[month - 1].slice(0, 3)}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.upcomingTitle, { color: colors.foreground }]} numberOfLines={1}>{evt.title}</Text>
                  <View style={styles.upcomingMeta}>
                    <View style={[styles.eventTypePill, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.eventTypeTxt, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    {evt.time && <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>{evt.time}</Text>}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  monthNavBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthLabel: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  weekRow: { flexDirection: "row", marginBottom: 8 },
  weekDay: { flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  weekendDay: { color: "#f43f5e" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: "14.285%", aspectRatio: 0.9, alignItems: "center", justifyContent: "center", gap: 2, padding: 2 },
  calDayTxt: { fontSize: 13, fontFamily: "Inter_500Medium" },
  dotRow: { flexDirection: "row", gap: 2 },
  eventDot: { width: 4, height: 4, borderRadius: 2 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, paddingTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  eventCard: { flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderRadius: 12, overflow: "hidden", gap: 12 },
  eventColorBar: { width: 4, alignSelf: "stretch" },
  eventCardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  eventTypePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  eventTypeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  eventTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  eventTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  eventDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  noEventCard: { borderWidth: 1, padding: 24, alignItems: "center", gap: 8 },
  noEventTxt: { fontSize: 14, fontFamily: "Inter_500Medium" },
  upcomingRow: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, gap: 12 },
  upcomingDate: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 1 },
  upcomingDateDay: { fontSize: 18, fontFamily: "Inter_700Bold" },
  upcomingDateMo: { fontSize: 10, fontFamily: "Inter_500Medium" },
  upcomingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  upcomingMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
});
