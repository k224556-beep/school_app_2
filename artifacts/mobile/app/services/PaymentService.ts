import { STUDENTS } from "@/constants/demoData";

type Transaction = { tx: string; amount: number; date: string };

type PaymentRecord = { paid: number; txs: Transaction[] };

const store: Record<string, PaymentRecord> = {};

// initialize store with current outstanding balances
STUDENTS.forEach((s) => {
  store[s.id] = { paid: 0, txs: [] };
});

export default class PaymentService {
  static getOutstanding(studentId: string) {
    const student = STUDENTS.find((s) => s.id === studentId);
    if (!student) return 0;
    const paid = store[studentId]?.paid ?? 0;
    return Math.max(0, student.outstandingBalance - paid);
  }

  static markPaid(studentId: string, amount: number, tx?: string) {
    if (!store[studentId]) store[studentId] = { paid: 0, txs: [] };
    store[studentId].paid += amount;
    const t: Transaction = { tx: tx ?? `TX${Date.now()}`, amount, date: new Date().toISOString() };
    store[studentId].txs.push(t);
    return t;
  }

  static getTransactions() {
    return Object.keys(store).flatMap((id) => (store[id].txs || []).map((t) => ({ studentId: id, ...t })));
  }

  // for tests/debug
  static reset() {
    Object.keys(store).forEach((k) => { store[k].paid = 0; store[k].txs = []; });
  }
}
