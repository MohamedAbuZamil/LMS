// Students + enrollments + payments + attendance mock layer.

import { GOVERNORATES, type Governorate } from "./governorates";

export type AttendanceStatus = "present" | "absent" | "late";

export interface Student {
  id: string;
  code: string;              // public student code (used to add to course)
  name: string;
  grade: string;
  phone: string;
  parentPhone: string;
  governorate: Governorate;
  photo?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  paidAmount: number;
  enrolledAt: string;
  active: boolean;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  lessonId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  notifiedParent: boolean;
}

export interface ExamReportMessage {
  id: string;
  examId: string;
  studentId: string;
  to: "student" | "parent";
  text: string;
  sentAt: string;
}

const STORE_STUDENTS = "lms.teacher.students";
const STORE_ENROLL = "lms.teacher.enrollments";
const STORE_ATT = "lms.teacher.attendance";
const STORE_MSGS = "lms.teacher.messages";

const SEED_STUDENTS: Student[] = [
  {
    id: "stu-1",
    code: "A-1001",
    name: "يوسف محمد",
    grade: "الصف الثالث الثانوي",
    phone: "+20 100 555 1111",
    parentPhone: "+20 100 555 2222",
    governorate: "القاهرة",
    photo: "https://i.pravatar.cc/120?img=12",
    createdAt: "2025-01-10",
  },
  {
    id: "stu-2",
    code: "A-1002",
    name: "فاطمة علي",
    grade: "الصف الثالث الثانوي",
    phone: "+20 100 555 3333",
    parentPhone: "+20 100 555 4444",
    governorate: "الجيزة",
    photo: "https://i.pravatar.cc/120?img=45",
    createdAt: "2025-01-12",
  },
  {
    id: "stu-3",
    code: "A-1003",
    name: "علي أحمد",
    grade: "الصف الثالث الثانوي",
    phone: "+20 100 555 5555",
    parentPhone: "+20 100 555 6666",
    governorate: "الإسكندرية",
    photo: "https://i.pravatar.cc/120?img=14",
    createdAt: "2025-01-15",
  },
  {
    id: "stu-4",
    code: "A-1004",
    name: "مريم حسن",
    grade: "الصف الثالث الثانوي",
    phone: "+20 100 555 7777",
    parentPhone: "+20 100 555 8888",
    governorate: "الدقهلية",
    photo: "https://i.pravatar.cc/120?img=47",
    createdAt: "2025-01-18",
  },
];

const SEED_ENROLL: Enrollment[] = [
  { id: "e1", courseId: "c-math3", studentId: "stu-1", paidAmount: 1800, enrolledAt: "2025-01-10", active: true },
  { id: "e2", courseId: "c-math3", studentId: "stu-2", paidAmount: 1200, enrolledAt: "2025-01-12", active: true },
  { id: "e3", courseId: "c-math3", studentId: "stu-3", paidAmount: 900, enrolledAt: "2025-01-15", active: true },
];

function isBrowser() { return typeof window !== "undefined"; }

function load<T>(key: string, seed: T[]): T[] {
  if (!isBrowser()) return seed;
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    sessionStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function save<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

/* ============ Students ============ */
export function listStudents(): Student[] {
  return load(STORE_STUDENTS, SEED_STUDENTS);
}

export function getStudent(id: string) {
  return listStudents().find((s) => s.id === id);
}

export function getStudentByCode(code: string) {
  const c = code.trim().toUpperCase();
  return listStudents().find((s) => s.code.toUpperCase() === c);
}

export function upsertStudent(s: Student) {
  const all = listStudents();
  const idx = all.findIndex((x) => x.id === s.id);
  if (idx >= 0) all[idx] = s;
  else all.unshift(s);
  save(STORE_STUDENTS, all);
}

/* ============ Enrollments ============ */
export function listEnrollments(): Enrollment[] {
  return load(STORE_ENROLL, SEED_ENROLL);
}

export function listEnrollmentsByCourse(courseId: string) {
  return listEnrollments().filter((e) => e.courseId === courseId);
}

export function isEnrolled(courseId: string, studentId: string) {
  return listEnrollments().some((e) => e.courseId === courseId && e.studentId === studentId && e.active);
}

export function enroll(courseId: string, studentId: string, paidAmount: number): Enrollment {
  const all = listEnrollments();
  const existing = all.find((e) => e.courseId === courseId && e.studentId === studentId);
  if (existing) {
    existing.active = true;
    existing.paidAmount += paidAmount;
    save(STORE_ENROLL, all);
    return existing;
  }
  const e: Enrollment = {
    id: `e-${Date.now()}`,
    courseId,
    studentId,
    paidAmount,
    enrolledAt: new Date().toISOString(),
    active: true,
  };
  all.unshift(e);
  save(STORE_ENROLL, all);
  return e;
}

export function unenroll(courseId: string, studentId: string) {
  const all = listEnrollments();
  const e = all.find((x) => x.courseId === courseId && x.studentId === studentId);
  if (e) e.active = false;
  save(STORE_ENROLL, all);
}

export function addPayment(courseId: string, studentId: string, amount: number) {
  const all = listEnrollments();
  const e = all.find((x) => x.courseId === courseId && x.studentId === studentId);
  if (!e) return;
  e.paidAmount += amount;
  save(STORE_ENROLL, all);
}

/* ============ Attendance ============ */
export function listAttendance(): AttendanceRecord[] {
  return load(STORE_ATT, []);
}

export function getAttendance(courseId: string, lessonId: string): AttendanceRecord[] {
  return listAttendance().filter((a) => a.courseId === courseId && a.lessonId === lessonId);
}

export function markAttendance(
  courseId: string,
  lessonId: string,
  studentId: string,
  status: AttendanceStatus
) {
  const all = listAttendance();
  const existing = all.find(
    (a) => a.courseId === courseId && a.lessonId === lessonId && a.studentId === studentId
  );
  if (existing) {
    existing.status = status;
    existing.markedAt = new Date().toISOString();
  } else {
    all.push({
      id: `att-${Date.now()}-${studentId}`,
      courseId,
      lessonId,
      studentId,
      status,
      markedAt: new Date().toISOString(),
      notifiedParent: false,
    });
  }
  save(STORE_ATT, all);
}

export function notifyParent(courseId: string, lessonId: string, studentId: string) {
  const all = listAttendance();
  const r = all.find(
    (a) => a.courseId === courseId && a.lessonId === lessonId && a.studentId === studentId
  );
  if (r) {
    r.notifiedParent = true;
    save(STORE_ATT, all);
  }
}

/* ============ Messages ============ */
export function listMessages(): ExamReportMessage[] {
  return load(STORE_MSGS, []);
}

export function sendExamReport(msg: Omit<ExamReportMessage, "id" | "sentAt">) {
  const all = listMessages();
  all.unshift({ ...msg, id: `m-${Date.now()}`, sentAt: new Date().toISOString() });
  save(STORE_MSGS, all);
}

export { GOVERNORATES };
