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
  source: "Walk-in" | "Referral" | "Facebook" | "Website" | "WhatsApp";
  expectedJoin: string;
  timeline: Array<{ label: string; date: string; done: boolean }>;
}

export interface FamilyMember {
  name: string;
  relation: string;
  occupation: string;
  phone: string;
}

export interface BehaviorEntry {
  date: string;
  type: "positive" | "negative" | "neutral";
  note: string;
  by: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  joinDate: string;
  attendance: number;
  leaveBalance: number;
  status: "active" | "on-leave";
}

export interface QuestionBankItem {
  id: string;
  subject: string;
  topic: string;
  type: "MCQ" | "Short" | "Long" | "Worksheet";
  difficulty: "Easy" | "Medium" | "Hard";
  text: string;
  options?: string[];
  answer?: string;
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
  const sources: Array<"Walk-in" | "Referral" | "Facebook" | "Website" | "WhatsApp"> = ["Walk-in", "Referral", "Facebook", "Website", "WhatsApp"];
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
  const STAGE_ORDER: Array<"inquiry" | "visit" | "followup" | "confirmed"> = ["inquiry", "visit", "followup", "confirmed"];
  const STAGE_LABELS: Record<string, string> = {
    inquiry: "Inquiry Received", visit: "Campus Visit", followup: "Follow Up Call", confirmed: "Admission Confirmed",
  };
  for (let i = 0; i < 30; i++) {
    const isMale = rng(i * 300, 0, 1) === 1;
    const firstName = isMale
      ? maleFirstNames[rng(i * 301, 0, maleFirstNames.length - 1)]
      : femaleFirstNames[rng(i * 301, 0, femaleFirstNames.length - 1)];
    const lastName = lastNames[rng(i * 303, 0, lastNames.length - 1)];
    const guardianFirst = maleFirstNames[rng(i * 305, 0, maleFirstNames.length - 1)];
    const guardianLast = lastNames[rng(i * 307, 0, lastNames.length - 1)];
    const stage = stages[rng(i * 317, 0, stages.length - 1)];
    const stageIdx = STAGE_ORDER.indexOf(stage);
    const timeline = STAGE_ORDER.slice(0, stageIdx + 1).map((s, idx) => ({
      label: STAGE_LABELS[s],
      date: `2025-0${rng(i * 321 + idx, 1, 7)}-${String(rng(i * 323 + idx, 1, 28)).padStart(2, "0")}`,
      done: true,
    }));
    admissions.push({
      id: `ADM${String(i + 1).padStart(3, "0")}`,
      studentName: `${firstName} ${lastName}`,
      guardianName: `${guardianFirst} ${guardianLast}`,
      phone: `0${rng(i * 311, 300, 345)}-${rng(i * 313, 1000000, 9999999)}`,
      stage,
      class: classes[rng(i * 319, 0, classes.length - 1)],
      date: `2025-0${rng(i * 321, 1, 7)}-${String(rng(i * 323, 1, 28)).padStart(2, "0")}`,
      notes: noteOptions[rng(i * 327, 0, noteOptions.length - 1)],
      source: sources[rng(i * 331, 0, sources.length - 1)],
      expectedJoin: `2025-0${rng(i * 333, 8, 9)}-${String(rng(i * 337, 1, 28)).padStart(2, "0")}`,
      timeline,
    });
  }
  return admissions;
}

function generateFamilyTree(seed: number, guardianName: string, lastName: string): FamilyMember[] {
  const occupations = ["Businessman", "Doctor", "Engineer", "Teacher", "Govt. Officer", "Banker", "Shopkeeper", "Homemaker", "Army Officer", "Architect"];
  const relations = ["Father", "Mother", "Grandfather", "Elder Sibling"];
  const count = rng(seed * 3, 2, 4);
  const members: FamilyMember[] = [{
    name: guardianName,
    relation: "Father",
    occupation: occupations[rng(seed * 5, 0, occupations.length - 1)],
    phone: `0${rng(seed * 7, 300, 345)}-${rng(seed * 9, 1000000, 9999999)}`,
  }];
  for (let j = 1; j < count; j++) {
    const isFemaleRel = relations[j] === "Mother";
    const fn = isFemaleRel
      ? femaleFirstNames[rng(seed * 11 + j, 0, femaleFirstNames.length - 1)]
      : maleFirstNames[rng(seed * 11 + j, 0, maleFirstNames.length - 1)];
    members.push({
      name: `${fn} ${lastName}`,
      relation: relations[j] ?? "Sibling",
      occupation: occupations[rng(seed * 13 + j, 0, occupations.length - 1)],
      phone: `0${rng(seed * 15 + j, 300, 345)}-${rng(seed * 17 + j, 1000000, 9999999)}`,
    });
  }
  return members;
}

function generateBehaviorLog(seed: number, name: string): BehaviorEntry[] {
  const positive = ["Helped organize the science fair", "Won inter-class debate competition", "Excellent teamwork in group project", "Volunteered for cleanliness drive"];
  const negative = ["Late submission of homework", "Disruptive during class", "Uniform violation noted", "Missed morning assembly"];
  const neutral = ["Requested seat change", "Attended parent-teacher conference", "Submitted leave application", "Participated in mock exam"];
  const teachers = ["Ms. Ayesha Malik", "Mr. Imtiaz Ahmed", "Ms. Sana Riaz", "Mr. Tariq Javed"];
  const entries: BehaviorEntry[] = [];
  const count = rng(seed * 19, 2, 4);
  for (let j = 0; j < count; j++) {
    const type: "positive" | "negative" | "neutral" = ["positive", "positive", "negative", "neutral"][rng(seed * 23 + j, 0, 3)] as "positive" | "negative" | "neutral";
    const pool = type === "positive" ? positive : type === "negative" ? negative : neutral;
    entries.push({
      date: `2025-0${rng(seed * 29 + j, 1, 3)}-${String(rng(seed * 31 + j, 1, 28)).padStart(2, "0")}`,
      type,
      note: pool[rng(seed * 37 + j, 0, pool.length - 1)],
      by: teachers[rng(seed * 41 + j, 0, teachers.length - 1)],
    });
  }
  return entries;
}

function generateStaff(): StaffMember[] {
  const roles = ["Accountant", "Receptionist", "Librarian", "Lab Assistant", "IT Support", "Security Guard", "Peon", "Driver", "Nurse", "Admin Officer", "HR Officer", "Cleaner", "Gardener", "Cook", "Coordinator"];
  const departments = ["Administration", "Finance", "Facilities", "IT", "Health", "Transport", "Academics"];
  const staff: StaffMember[] = [];
  for (let i = 0; i < 15; i++) {
    const isMale = rng(i * 400, 0, 1) === 1;
    const firstName = isMale
      ? maleFirstNames[rng(i * 401, 0, maleFirstNames.length - 1)]
      : femaleFirstNames[rng(i * 401, 0, femaleFirstNames.length - 1)];
    const lastName = lastNames[rng(i * 403, 0, lastNames.length - 1)];
    staff.push({
      id: `STF${String(i + 1).padStart(3, "0")}`,
      name: `${firstName} ${lastName}`,
      role: roles[i % roles.length],
      department: departments[rng(i * 407, 0, departments.length - 1)],
      salary: rng(i * 409, 25000, 85000),
      joinDate: `${rng(i * 411, 2016, 2024)}-0${rng(i * 413, 1, 9)}-${String(rng(i * 417, 1, 28)).padStart(2, "0")}`,
      attendance: rng(i * 419, 80, 100),
      leaveBalance: rng(i * 421, 2, 18),
      status: rng(i * 423, 0, 9) === 0 ? "on-leave" : "active",
    });
  }
  return staff;
}

function generateQuestionBank(): QuestionBankItem[] {
  const items: Array<{ subject: string; topic: string; type: QuestionBankItem["type"]; difficulty: QuestionBankItem["difficulty"]; text: string; options?: string[]; answer?: string }> = [
    { subject: "Mathematics", topic: "Algebra", type: "MCQ", difficulty: "Easy", text: "What is the value of x in 2x + 4 = 10?", options: ["2", "3", "4", "5"], answer: "3" },
    { subject: "Mathematics", topic: "Algebra", type: "MCQ", difficulty: "Medium", text: "Solve for y: 3y - 7 = 14", options: ["5", "6", "7", "8"], answer: "7" },
    { subject: "Mathematics", topic: "Geometry", type: "Short", difficulty: "Medium", text: "Find the area of a triangle with base 8cm and height 5cm." },
    { subject: "Mathematics", topic: "Geometry", type: "Long", difficulty: "Hard", text: "Prove that the sum of angles in a triangle is 180 degrees using parallel line properties." },
    { subject: "Science", topic: "Photosynthesis", type: "MCQ", difficulty: "Easy", text: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide" },
    { subject: "Science", topic: "Photosynthesis", type: "Short", difficulty: "Medium", text: "Explain the role of chlorophyll in photosynthesis." },
    { subject: "Science", topic: "Human Body", type: "Long", difficulty: "Hard", text: "Describe the process of blood circulation through the human heart in detail." },
    { subject: "English", topic: "Grammar", type: "MCQ", difficulty: "Easy", text: "Choose the correct form: 'She ___ to school every day.'", options: ["go", "goes", "going", "gone"], answer: "goes" },
    { subject: "English", topic: "Comprehension", type: "Worksheet", difficulty: "Medium", text: "Read the given passage and answer 5 comprehension questions based on it." },
    { subject: "Urdu", topic: "Grammar", type: "Short", difficulty: "Easy", text: "اسم اور فعل کی مثالیں دیں۔" },
    { subject: "Islamiyat", topic: "Pillars of Islam", type: "MCQ", difficulty: "Easy", text: "How many pillars of Islam are there?", options: ["3", "4", "5", "6"], answer: "5" },
    { subject: "Pak Studies", topic: "Independence Movement", type: "Long", difficulty: "Hard", text: "Discuss the key events leading to the independence of Pakistan in 1947." },
    { subject: "Computer Science", topic: "Programming Basics", type: "Worksheet", difficulty: "Medium", text: "Write a flowchart-style worksheet for a simple even/odd number checker." },
    { subject: "Science", topic: "Force & Motion", type: "MCQ", difficulty: "Medium", text: "Newton's First Law is also known as the Law of:", options: ["Inertia", "Gravity", "Motion", "Energy"], answer: "Inertia" },
  ];
  return items.map((it, i) => ({ id: `QB${String(i + 1).padStart(3, "0")}`, ...it }));
}

export const STUDENTS: Student[] = generateStudents(900).slice(0, 900);
export const DISPLAY_STUDENTS: Student[] = STUDENTS.slice(0, 60);
export const TEACHERS: Teacher[] = generateTeachers();
export const TRANSACTIONS: FeeTransaction[] = generateTransactions();
export const ADMISSIONS: Admission[] = generateAdmissions();
export const STAFF: StaffMember[] = generateStaff();
export const QUESTION_BANK: QuestionBankItem[] = generateQuestionBank();

const familyTreeCache = new Map<string, FamilyMember[]>();
export function getFamilyTree(student: Student): FamilyMember[] {
  if (!familyTreeCache.has(student.id)) {
    const seed = parseInt(student.id.replace("STU", ""), 10);
    const lastName = student.name.split(" ").slice(-1)[0];
    familyTreeCache.set(student.id, generateFamilyTree(seed, student.guardian, lastName));
  }
  return familyTreeCache.get(student.id)!;
}

const behaviorLogCache = new Map<string, BehaviorEntry[]>();
export function getBehaviorLog(student: Student): BehaviorEntry[] {
  if (!behaviorLogCache.has(student.id)) {
    const seed = parseInt(student.id.replace("STU", ""), 10);
    behaviorLogCache.set(student.id, generateBehaviorLog(seed, student.name));
  }
  return behaviorLogCache.get(student.id)!;
}

export interface StudentDocument {
  name: string;
  type: string;
  uploadedOn: string;
  verified: boolean;
}

export function getStudentDocuments(student: Student): StudentDocument[] {
  const seed = parseInt(student.id.replace("STU", ""), 10);
  return [
    { name: "B-Form / CNIC Copy", type: "PDF", uploadedOn: student.admissionDate, verified: true },
    { name: "Birth Certificate", type: "PDF", uploadedOn: student.admissionDate, verified: true },
    { name: "Previous School Leaving Cert.", type: "PDF", uploadedOn: student.admissionDate, verified: rng(seed * 51, 0, 1) === 1 },
    { name: "Vaccination Record", type: "Image", uploadedOn: student.admissionDate, verified: rng(seed * 53, 0, 1) === 1 },
  ];
}

export interface MedicalInfo {
  bloodGroup: string;
  allergies: string;
  conditions: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export function getMedicalInfo(student: Student): MedicalInfo {
  const seed = parseInt(student.id.replace("STU", ""), 10);
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+"];
  const allergies = ["None known", "Peanut allergy", "Dust allergy", "Lactose intolerant", "Seasonal pollen allergy"];
  const conditions = ["None", "Mild asthma", "None", "None", "Wears prescription glasses"];
  return {
    bloodGroup: bloodGroups[rng(seed * 57, 0, bloodGroups.length - 1)],
    allergies: allergies[rng(seed * 59, 0, allergies.length - 1)],
    conditions: conditions[rng(seed * 61, 0, conditions.length - 1)],
    emergencyContact: student.guardian,
    emergencyPhone: student.phone,
  };
}

export interface PromotionRecord {
  fromClass: string;
  toClass: string;
  year: string;
  result: "Promoted" | "Promoted with Merit";
}

export function getPromotionHistory(student: Student): PromotionRecord[] {
  const seed = parseInt(student.id.replace("STU", ""), 10);
  const classOrder = classes;
  const currentIdx = classOrder.indexOf(student.class);
  const history: PromotionRecord[] = [];
  const yearsBack = Math.min(currentIdx, 3);
  for (let j = yearsBack; j > 0; j--) {
    history.push({
      fromClass: classOrder[currentIdx - j],
      toClass: classOrder[currentIdx - j + 1],
      year: `${2025 - j}`,
      result: rng(seed * 63 + j, 0, 4) === 0 ? "Promoted with Merit" : "Promoted",
    });
  }
  return history;
}

export function getStudentTags(student: Student): string[] {
  const tags: string[] = [];
  if (student.academicScore >= 85) tags.push("Top Performer");
  if (student.riskScore >= 70) tags.push("At Risk");
  if (student.behaviorScore >= 90) tags.push("Model Student");
  if (student.attendance < 70) tags.push("Low Attendance");
  if (student.feeStatus === "overdue") tags.push("Fee Defaulter");
  if (tags.length === 0) tags.push("Regular");
  return tags;
}

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
