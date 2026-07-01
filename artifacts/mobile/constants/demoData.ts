export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  guardian: string;
  phone: string;
  attendance: number;
  feeStatus: "paid" | "partial" | "overdue";
  outstandingBalance: number;
  academicScore: number;
  behaviorScore: number;
  homeworkCompletion: number;
  riskScore: number;
  gender: "male" | "female";
  admissionDate: string;
  dob: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  attendance: number;
  homeworkCompletion: number;
  performanceScore: number;
  classResults: number;
  parentFeedback: number;
  experience: string;
}

export interface FeeTransaction {
  id: string;
  studentName: string;
  class: string;
  amount: number;
  status: "paid" | "partial" | "overdue";
  dueDate: string;
  paidDate?: string;
  month: string;
}

export interface AIInsight {
  id: string;
  type: "alert" | "warning" | "success" | "info";
  title: string;
  description: string;
  action: string;
  metric?: string;
  value?: string;
}

export interface Admission {
  id: string;
  studentName: string;
  guardianName: string;
  phone: string;
  stage: "inquiry" | "visit" | "followup" | "confirmed";
  class: string;
  date: string;
  notes: string;
}

const maleFirstNames = [
  "Ahmed", "Ali", "Usman", "Bilal", "Hassan", "Hamza", "Omar", "Zain", "Fahad",
  "Arslan", "Talha", "Saad", "Waleed", "Farhan", "Anas", "Haris", "Daniyal",
  "Rayyan", "Ibrahim", "Yusuf", "Abdullah", "Muhammad", "Salman", "Tariq", "Kashif"
];

const femaleFirstNames = [
  "Fatima", "Ayesha", "Zainab", "Maryam", "Hina", "Nadia", "Sara", "Amna",
  "Saba", "Rabia", "Khadija", "Iqra", "Maham", "Areeba", "Laiba", "Nimra",
  "Aisha", "Hafsa", "Bushra", "Naila", "Sana", "Rida", "Aliza", "Mariam"
];

const lastNames = [
  "Khan", "Ahmed", "Malik", "Sheikh", "Qureshi", "Siddiqui", "Chaudhry",
  "Butt", "Akhtar", "Hussain", "Ali", "Raza", "Shah", "Mirza", "Bajwa",
  "Rana", "Nawaz", "Javed", "Rafiq", "Ijaz", "Riaz", "Aslam", "Shafiq"
];

const classes = [
  "Reception", "Nursery", "KG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
];

const sections = ["A", "B", "C"];

function rng(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const normalized = x - Math.floor(x);
  return Math.floor(normalized * (max - min + 1)) + min;
}

function generateStudents(count: number): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = rng(i, 0, 1) === 1;
    const firstName = isMale
      ? maleFirstNames[rng(i * 3, 0, maleFirstNames.length - 1)]
      : femaleFirstNames[rng(i * 3, 0, femaleFirstNames.length - 1)];
    const lastName = lastNames[rng(i * 5, 0, lastNames.length - 1)];
    const cls = classes[rng(i * 7, 0, classes.length - 1)];
    const section = sections[rng(i * 11, 0, sections.length - 1)];
    const attendance = rng(i * 13, 55, 99);
    const feeStatuses: Array<"paid" | "partial" | "overdue"> = ["paid", "paid", "paid", "partial", "overdue"];
    const feeStatus = feeStatuses[rng(i * 17, 0, feeStatuses.length - 1)];
    const outstanding = feeStatus === "paid" ? 0 : feeStatus === "partial" ? rng(i * 19, 2000, 8000) : rng(i * 23, 5000, 18000);
    const academic = rng(i * 29, 40, 98);
    const behavior = rng(i * 31, 50, 100);
    const homework = rng(i * 37, 45, 100);
    const risk = feeStatus === "overdue" && attendance < 75 ? rng(i * 41, 70, 95) :
                 feeStatus === "partial" || attendance < 80 ? rng(i * 41, 30, 69) : rng(i * 41, 5, 29);

    const guardianFirst = isMale
      ? maleFirstNames[rng(i * 43, 0, maleFirstNames.length - 1)]
      : maleFirstNames[rng(i * 43, 0, maleFirstNames.length - 1)];
    const guardianLast = lastNames[rng(i * 47, 0, lastNames.length - 1)];
    const phone = `0${rng(i * 53, 300, 345)}-${rng(i * 59, 1000000, 9999999)}`;
    const year = 2024 - rng(i * 61, 5, 17);
    const month = String(rng(i * 67, 1, 12)).padStart(2, "0");
    const day = String(rng(i * 71, 1, 28)).padStart(2, "0");

    students.push({
      id: `STU${String(i + 1).padStart(4, "0")}`,
      name: `${firstName} ${lastName}`,
      class: cls,
      section,
      guardian: `${guardianFirst} ${guardianLast}`,
      phone,
      attendance,
      feeStatus,
      outstandingBalance: outstanding,
      academicScore: academic,
      behaviorScore: behavior,
      homeworkCompletion: homework,
      riskScore: risk,
      gender: isMale ? "male" : "female",
      admissionDate: `${rng(i * 73, 2018, 2024)}-${month}-${day}`,
      dob: `${year}-${month}-${day}`,
    });
  }
  return students;
}

function generateTeachers(): Teacher[] {
  const subjects = [
    "Mathematics", "English", "Science", "Urdu", "Islamiyat", "Social Studies",
    "Physics", "Chemistry", "Biology", "Computer Science", "Pak Studies", "History",
    "Geography", "Arts", "Physical Education"
  ];
  const teachers: Teacher[] = [];
  for (let i = 0; i < 45; i++) {
    const isMale = rng(i * 100, 0, 1) === 1;
    const firstName = isMale
      ? maleFirstNames[rng(i * 101, 0, maleFirstNames.length - 1)]
      : femaleFirstNames[rng(i * 101, 0, femaleFirstNames.length - 1)];
    const lastName = lastNames[rng(i * 103, 0, lastNames.length - 1)];
    teachers.push({
      id: `TCH${String(i + 1).padStart(3, "0")}`,
      name: `${isMale ? "Mr." : "Ms."} ${firstName} ${lastName}`,
      subject: subjects[i % subjects.length],
      attendance: rng(i * 107, 78, 100),
      homeworkCompletion: rng(i * 109, 70, 100),
      performanceScore: rng(i * 113, 65, 98),
      classResults: rng(i * 127, 60, 95),
      parentFeedback: rng(i * 131, 70, 99),
      experience: `${rng(i * 137, 1, 20)} yrs`,
    });
  }
  return teachers;
}

function generateTransactions(): FeeTransaction[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const transactions: FeeTransaction[] = [];
  for (let i = 0; i < 200; i++) {
    const isMale = rng(i * 200, 0, 1) === 1;
    const firstName = isMale
      ? maleFirstNames[rng(i * 201, 0, maleFirstNames.length - 1)]
      : femaleFirstNames[rng(i * 201, 0, femaleFirstNames.length - 1)];
    const lastName = lastNames[rng(i * 203, 0, lastNames.length - 1)];
    const cls = classes[rng(i * 207, 0, classes.length - 1)];
    const statuses: Array<"paid" | "partial" | "overdue"> = ["paid", "paid", "paid", "partial", "overdue"];
    const status = statuses[rng(i * 211, 0, statuses.length - 1)];
    const amount = rng(i * 213, 4000, 12000);
    const month = months[rng(i * 217, 0, 11)];
    const day = rng(i * 219, 1, 28);
    transactions.push({
      id: `TXN${String(i + 1).padStart(4, "0")}`,
      studentName: `${firstName} ${lastName}`,
      class: cls,
      amount,
      status,
      dueDate: `2025-${String(rng(i * 221, 1, 12)).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      paidDate: status === "paid" ? `2025-${String(rng(i * 223, 1, 12)).padStart(2, "0")}-${String(rng(i * 227, 1, 28)).padStart(2, "0")}` : undefined,
      month,
    });
  }
  return transactions;
}

function generateAdmissions(): Admission[] {
  const stages: Array<"inquiry" | "visit" | "followup" | "confirmed"> = ["inquiry", "visit", "followup", "confirmed"];
  const admissions: Admission[] = [];
  const noteOptions = [
    "Parent very interested, follow up Friday",
    "Siblings already enrolled",
    "Coming from DPS",
    "Fee concession requested",
    "Father is an alumni",
    "Scholarship applicant",
    "Need to arrange tour",
    "Confirm grade placement",
  ];
  for (let i = 0; i < 30; i++) {
    const isMale = rng(i * 300, 0, 1) === 1;
    const firstName = isMale
      ? maleFirstNames[rng(i * 301, 0, maleFirstNames.length - 1)]
      : femaleFirstNames[rng(i * 301, 0, femaleFirstNames.length - 1)];
    const lastName = lastNames[rng(i * 303, 0, lastNames.length - 1)];
    const guardianFirst = maleFirstNames[rng(i * 305, 0, maleFirstNames.length - 1)];
    const guardianLast = lastNames[rng(i * 307, 0, lastNames.length - 1)];
    admissions.push({
      id: `ADM${String(i + 1).padStart(3, "0")}`,
      studentName: `${firstName} ${lastName}`,
      guardianName: `${guardianFirst} ${guardianLast}`,
      phone: `0${rng(i * 311, 300, 345)}-${rng(i * 313, 1000000, 9999999)}`,
      stage: stages[rng(i * 317, 0, stages.length - 1)],
      class: classes[rng(i * 319, 0, classes.length - 1)],
      date: `2025-0${rng(i * 321, 1, 7)}-${String(rng(i * 323, 1, 28)).padStart(2, "0")}`,
      notes: noteOptions[rng(i * 327, 0, noteOptions.length - 1)],
    });
  }
  return admissions;
}

export const STUDENTS: Student[] = generateStudents(900).slice(0, 900);
export const DISPLAY_STUDENTS: Student[] = STUDENTS.slice(0, 60);
export const TEACHERS: Teacher[] = generateTeachers();
export const TRANSACTIONS: FeeTransaction[] = generateTransactions();
export const ADMISSIONS: Admission[] = generateAdmissions();

export const DASHBOARD_METRICS = {
  totalStudents: 900,
  attendanceToday: 87,
  feeCollectionMonth: 4543000,
  expectedRevenue: 5000000,
  outstandingFees: 457000,
  admissionsMonth: 14,
  teacherAttendance: 93,
  parentSatisfaction: 88,
  monthlyGrowth: 4.2,
};

export const AI_INSIGHTS: AIInsight[] = [
  {
    id: "1",
    type: "warning",
    title: "Fee Collection Down 8%",
    description: "Most overdue parents belong to Grade 6 and Grade 7. Sending reminders can improve recovery by approximately 15%.",
    action: "Send Reminders",
    metric: "Grade 7",
    value: "PKR 125,000 pending",
  },
  {
    id: "2",
    type: "alert",
    title: "Attendance Alert: Grade 8-B",
    description: "Grade 8-B has 17 absentees today — the highest in the school. Class teacher Mr. Imtiaz has been notified.",
    action: "View Class",
    metric: "17 absent",
    value: "61% attendance",
  },
  {
    id: "3",
    type: "info",
    title: "12 At-Risk Students",
    description: "12 students have both low attendance (below 75%) and unpaid fees. Immediate outreach recommended.",
    action: "View Students",
    metric: "Risk Score: High",
    value: "Action required",
  },
  {
    id: "4",
    type: "success",
    title: "Revenue Forecast",
    description: "Based on current collection trends, expected revenue this month is PKR 4,250,000 with 92% confidence.",
    action: "View Report",
    metric: "PKR 3,910,000",
    value: "Likely collection",
  },
];

export const MONTHLY_REVENUE = [
  { month: "Aug", amount: 4820000 },
  { month: "Sep", amount: 5100000 },
  { month: "Oct", amount: 4650000 },
  { month: "Nov", amount: 5250000 },
  { month: "Dec", amount: 4300000 },
  { month: "Jan", amount: 4900000 },
  { month: "Feb", amount: 5000000 },
  { month: "Mar", amount: 4543000 },
];

export const FEE_RECOVERY = {
  paid: 68,
  partial: 14,
  overdue: 18,
  collected: 4543000,
  expected: 5000000,
  outstanding: 457000,
};

export const TOP_DEFAULTERS = DISPLAY_STUDENTS
  .filter((s) => s.feeStatus === "overdue")
  .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
  .slice(0, 8);

export const DEMO_CHAT: Array<{ role: "user" | "ai"; text: string; data?: string }> = [
  {
    role: "user",
    text: "Why has fee collection dropped this month?",
  },
  {
    role: "ai",
    text: "Most overdue parents belong to Grade 6 and Grade 7. The drop is primarily driven by 47 families who missed the February deadline.\n\nSending WhatsApp reminders to this segment can improve recovery by approximately 15% based on historical patterns.",
    data: "Grade 6: 18 overdue • Grade 7: 29 overdue",
  },
  {
    role: "user",
    text: "Which students are at highest risk?",
  },
  {
    role: "ai",
    text: "I've identified 12 students with both attendance below 75% AND unpaid fees for 2+ months. These students require immediate intervention.",
    data: "Risk Score: Critical • Action: Parent Meeting",
  },
  {
    role: "user",
    text: "What is our revenue forecast for March?",
  },
  {
    role: "ai",
    text: "Based on historical collection rates and current payment pipeline, expected collection this month is PKR 3,910,000 out of PKR 5,000,000.\n\nPrediction confidence: 92%",
    data: "PKR 3,910,000 • 92% confidence",
  },
];

export const UPCOMING_EVENTS = [
  { id: "1", title: "Annual Sports Day", date: "Mar 20", type: "event" },
  { id: "2", title: "Grade 10 Board Exams Begin", date: "Mar 24", type: "exam" },
  { id: "3", title: "Fee Due Date", date: "Mar 31", type: "fee" },
  { id: "4", title: "Parent-Teacher Meeting", date: "Apr 5", type: "meeting" },
  { id: "5", title: "Spring Break Starts", date: "Apr 14", type: "holiday" },
];

export const BIRTHDAYS = [
  { name: "Fatima Qureshi", class: "Grade 5-A", date: "Today" },
  { name: "Hassan Ahmed", class: "Grade 8-B", date: "Today" },
  { name: "Zainab Malik", class: "Grade 3-C", date: "Tomorrow" },
];

export function getRecoveryScore(student: Student): number {
  const riskFactor = (100 - student.riskScore) * 0.5;
  const attendanceFactor = (student.attendance / 100) * 35;
  const statusBonus = student.feeStatus === "partial" ? 12 : 0;
  return Math.round(Math.min(96, Math.max(12, riskFactor + attendanceFactor + statusBonus)));
}

export function getRecoveryLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function getRecoveryColor(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

export const formatPKR = (amount: number): string => {
  if (amount >= 1000000) return `PKR ${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(0)}K`;
  return `PKR ${amount.toLocaleString()}`;
};
