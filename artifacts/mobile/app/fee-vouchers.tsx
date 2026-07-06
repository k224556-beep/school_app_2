import React, { useMemo, useState } from "react";
import {
  ScrollView, StyleSheet, Text, View, Platform, Pressable, TextInput, Modal, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { useColors } from "@/hooks/useColors";
import {
  DISPLAY_STUDENTS, formatPKR, generateVoucher, type FeeVoucher, type Student,
} from "@/constants/demoData";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CURRENT_MONTH = "March";
const CURRENT_YEAR = 2025;

const STATUS_COLORS: Record<FeeVoucher["status"], string> = {
  paid: "#10b981",
  unpaid: "#0ea5e9",
  overdue: "#f43f5e",
};

function VoucherDetailModal({ voucher, onClose }: { voucher: FeeVoucher | null; onClose: () => void }) {
  const colors = useColors();
  if (!voucher) return null;
  const qrPayload = JSON.stringify({
    challan: voucher.challanNo,
    student: voucher.student.name,
    amount: voucher.totalAmount,
    due: voucher.dueDate,
  });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: colors.radius }]} contentContainerStyle={{ padding: 20, gap: 12 }}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Fee Voucher</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>{voucher.challanNo}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={[styles.challanCard, { borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
            <View style={styles.challanHeader}>
              <View>
                <Text style={[styles.schoolName, { color: colors.foreground }]}>The Educators School</Text>
                <Text style={[styles.schoolAddr, { color: colors.mutedForeground }]}>Model Town, Lahore</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[voucher.status] + "20" }]}>
                <Text style={[styles.statusPillText, { color: STATUS_COLORS[voucher.status] }]}>{voucher.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.studentInfoRow}>
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Student</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{voucher.student.name}</Text>
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Class</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{voucher.student.class}-{voucher.student.section}</Text>
              </View>
            </View>
            <View style={styles.studentInfoRow}>
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Month</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{voucher.month} {voucher.year}</Text>
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Due Date</Text>
                <Text style={[styles.infoValue, { color: "#f59e0b" }]}>{voucher.dueDate}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.feeLine}>
              <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Tuition Fee</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>{formatPKR(voucher.tuitionFee)}</Text>
            </View>
            <View style={styles.feeLine}>
              <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Transport Fee</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>{formatPKR(voucher.transportFee)}</Text>
            </View>
            {voucher.examFee > 0 && (
              <View style={styles.feeLine}>
                <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Exam Fee</Text>
                <Text style={[styles.feeValue, { color: colors.foreground }]}>{formatPKR(voucher.examFee)}</Text>
              </View>
            )}
            <View style={styles.feeLine}>
              <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Miscellaneous</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>{formatPKR(voucher.miscFee)}</Text>
            </View>
            {voucher.fine > 0 && (
              <View style={styles.feeLine}>
                <Text style={[styles.feeLabel, { color: "#f43f5e" }]}>Late Fine</Text>
                <Text style={[styles.feeValue, { color: "#f43f5e" }]}>{formatPKR(voucher.fine)}</Text>
              </View>
            )}
            {voucher.previousBalance > 0 && (
              <View style={styles.feeLine}>
                <Text style={[styles.feeLabel, { color: "#f43f5e" }]}>Previous Balance</Text>
                <Text style={[styles.feeValue, { color: "#f43f5e" }]}>{formatPKR(voucher.previousBalance)}</Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.feeLine}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Payable</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPKR(voucher.totalAmount)}</Text>
            </View>

            <View style={styles.qrSection}>
              <View style={styles.qrWrap}>
                <QRCode value={qrPayload} size={90} backgroundColor="transparent" color={colors.foreground} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.bankLabel, { color: colors.mutedForeground }]}>Pay via</Text>
                <Text style={[styles.bankValue, { color: colors.foreground }]}>{voucher.bankName}</Text>
                <Text style={[styles.bankAccount, { color: colors.mutedForeground }]}>{voucher.accountNo}</Text>
                <Text style={[styles.qrHint, { color: colors.mutedForeground }]}>Scan to verify challan</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: "#25d36620" }]}>
              <Ionicons name="logo-whatsapp" size={16} color="#25d366" />
              <Text style={[styles.actionBtnText, { color: "#25d366" }]}>Send</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="download-outline" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>Download PDF</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function FeeVouchersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeeVoucher["status"] | "All">("All");
  const [selected, setSelected] = useState<FeeVoucher | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const vouchers = useMemo(
    () => DISPLAY_STUDENTS.map((s, i) => generateVoucher(s, CURRENT_MONTH, CURRENT_YEAR, i + 1)),
    []
  );

  const classes = useMemo(() => Array.from(new Set(DISPLAY_STUDENTS.map((s) => s.class))), []);

  const filtered = useMemo(() => {
    return vouchers.filter((v) => {
      if (search && !v.student.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (classFilter && v.student.class !== classFilter) return false;
      if (statusFilter !== "All" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vouchers, search, classFilter, statusFilter]);

  const totalDue = filtered.reduce((sum, v) => sum + (v.status !== "paid" ? v.totalAmount : 0), 0);
  const paidCount = filtered.filter((v) => v.status === "paid").length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulkExport = () => {
    setBulkGenerating(true);
    setBulkDone(false);
    setTimeout(() => {
      setBulkGenerating(false);
      setBulkDone(true);
      setTimeout(() => setBulkDone(false), 2500);
    }, 1600);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Fee Vouchers</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{CURRENT_MONTH} {CURRENT_YEAR} · {vouchers.length} challans</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 100, gap: 14 }}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Ionicons name="wallet-outline" size={16} color="#f43f5e" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{formatPKR(totalDue)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Due</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{paidCount}/{filtered.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Paid</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Ionicons name="albums-outline" size={16} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{selectedIds.size}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Selected</Text>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search student..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Pressable
            onPress={() => setClassFilter(null)}
            style={[styles.filterChip, { backgroundColor: !classFilter ? colors.primary : colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.filterChipText, { color: !classFilter ? "#fff" : colors.mutedForeground }]}>All Classes</Text>
          </Pressable>
          {classes.map((c) => (
            <Pressable
              key={c}
              onPress={() => setClassFilter(c)}
              style={[styles.filterChip, { backgroundColor: classFilter === c ? colors.primary : colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.filterChipText, { color: classFilter === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.statusRow}>
          {(["All", "unpaid", "paid", "overdue"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatusFilter(s)}
              style={[
                styles.statusChip,
                { borderColor: statusFilter === s ? (s === "All" ? colors.primary : STATUS_COLORS[s]) : colors.border },
              ]}
            >
              <Text style={[styles.statusChipText, { color: statusFilter === s ? (s === "All" ? colors.primary : STATUS_COLORS[s]) : colors.mutedForeground }]}>
                {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No vouchers match your filters</Text>
          </View>
        ) : (
          filtered.map((v) => {
            const isSelected = selectedIds.has(v.challanNo);
            return (
              <Pressable
                key={v.challanNo}
                onPress={() => setSelected(v)}
                style={[styles.voucherCard, { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border, borderRadius: colors.radius }]}
              >
                <Pressable onPress={() => toggleSelect(v.challanNo)} style={[styles.checkbox, { borderColor: colors.border, backgroundColor: isSelected ? colors.primary : "transparent" }]}>
                  {isSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.voucherName, { color: colors.foreground }]}>{v.student.name}</Text>
                  <Text style={[styles.voucherMeta, { color: colors.mutedForeground }]}>{v.student.class}-{v.student.section} · {v.challanNo}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={[styles.voucherAmount, { color: colors.foreground }]}>{formatPKR(v.totalAmount)}</Text>
                  <View style={[styles.voucherStatusPill, { backgroundColor: STATUS_COLORS[v.status] + "20" }]}>
                    <Text style={[styles.voucherStatusText, { color: STATUS_COLORS[v.status] }]}>{v.status}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {selectedIds.size > 0 && (
        <View style={[styles.bulkBar, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: bottomPad + 12 }]}>
          {bulkGenerating ? (
            <View style={styles.bulkStatusRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={[styles.bulkStatusText, { color: colors.foreground }]}>Generating {selectedIds.size} PDF vouchers...</Text>
            </View>
          ) : bulkDone ? (
            <View style={styles.bulkStatusRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={[styles.bulkStatusText, { color: "#10b981" }]}>Bulk PDF ready for download</Text>
            </View>
          ) : (
            <Pressable style={[styles.bulkBtn, { backgroundColor: colors.primary }]} onPress={runBulkExport}>
              <Ionicons name="documents-outline" size={17} color="#fff" />
              <Text style={styles.bulkBtnText}>Export {selectedIds.size} Vouchers as PDF</Text>
            </Pressable>
          )}
        </View>
      )}

      <VoucherDetailModal voucher={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 12, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statusRow: { flexDirection: "row", gap: 8 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  statusChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  voucherCard: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  voucherName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  voucherMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  voucherAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  voucherStatusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  voucherStatusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 50, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  bulkBar: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, padding: 14 },
  bulkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14 },
  bulkBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  bulkStatusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10 },
  bulkStatusText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { maxHeight: "88%" },
  modalHeader: { flexDirection: "row", alignItems: "flex-start" },
  modalTitle: { fontSize: 19, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalClose: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  challanCard: { borderWidth: 1.5, borderStyle: "dashed", padding: 16, gap: 10 },
  challanHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  schoolName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  schoolAddr: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  studentInfoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  infoValue: { fontSize: 13, fontFamily: "Inter_700Bold", marginTop: 2 },
  divider: { height: 1, marginVertical: 4 },
  feeLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  feeLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  feeValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  qrSection: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 8 },
  qrWrap: { padding: 8, backgroundColor: "#fff", borderRadius: 10 },
  bankLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  bankValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  bankAccount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  qrHint: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 4 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
