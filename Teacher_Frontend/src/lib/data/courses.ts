// Courses + Lessons + Videos + Files + Exams model for Teacher Frontend (mock).

import type { Grade } from "./governorates";

export type VideoServer = "youtube" | "streamable" | "drive" | "lms";

export interface LessonVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  server: VideoServer;
  sourceUrl: string;           // URL / ID on the chosen server
  durationMin: number;
  maxViews: number;            // allowed views per student
  createdAt: string;
}

export interface LessonFile {
  id: string;
  title: string;
  description?: string;
  url: string;
  sizeKb?: number;
  kind: "pdf" | "doc" | "image" | "other";
  createdAt: string;
}

export type ExamVisibility = "visible" | "hidden" | "locked"; // locked = visible but cannot enter

export interface ExamQuestionRef {
  bankId: string;
  questionId: string;
}

export interface RandomFromBank {
  bankId: string;
  count: number;
}

export interface LessonExam {
  id: string;
  title: string;
  startAt: string;             // ISO
  endAt: string;               // ISO
  durationMin: number;
  visibility: ExamVisibility;
  /** Manual: pick questions from banks. */
  manualQuestions: ExamQuestionRef[];
  /** Random: pick N questions from each bank. */
  randomFromBanks: RandomFromBank[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  /** Optional link to a lesson-level exam (shortcut). */
  examId?: string;
  videos: LessonVideo[];
  files: LessonFile[];
  exams: LessonExam[];
  createdAt: string;
}

export interface Course {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  image: string;
  grade: Grade | string;
  priceTotal: number;          // total course price
  priceLesson: number;         // per-lesson price
  startAt: string;             // ISO date of course start
  lessons: Lesson[];
  createdAt: string;
}

const STORE = "lms.teacher.courses";

// Seed data so the UI has something to show.
const SEED: Course[] = [
  {
    id: "c-math3",
    teacherId: "t-ahmed",
    title: "الرياضيات — الصف الثالث الثانوي",
    description: "منهج متكامل مع مراجعات شاملة وامتحانات تجريبية.",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=60",
    grade: "الصف الثالث الثانوي",
    priceTotal: 1800,
    priceLesson: 120,
    startAt: "2025-09-01",
    createdAt: "2024-12-01",
    lessons: [
      {
        id: "l1",
        title: "الحصة 1 — التفاضل",
        description: "مقدمة عامة في التفاضل وحل أمثلة.",
        videos: [
          {
            id: "v1",
            title: "شرح التفاضل",
            server: "youtube",
            sourceUrl: "https://youtu.be/dQw4w9WgXcQ",
            durationMin: 45,
            maxViews: 3,
            createdAt: "2025-01-10",
          },
        ],
        files: [
          {
            id: "f1",
            title: "ملخص التفاضل.pdf",
            url: "#",
            kind: "pdf",
            sizeKb: 1200,
            createdAt: "2025-01-10",
          },
        ],
        exams: [],
        createdAt: "2025-01-10",
      },
      {
        id: "l2",
        title: "الحصة 2 — التكامل",
        videos: [],
        files: [],
        exams: [],
        createdAt: "2025-01-17",
      },
    ],
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function listCourses(teacherId?: string): Course[] {
  if (!isBrowser()) return SEED;
  const raw = sessionStorage.getItem(STORE);
  if (!raw) {
    sessionStorage.setItem(STORE, JSON.stringify(SEED));
    return teacherId ? SEED.filter((c) => c.teacherId === teacherId) : SEED;
  }
  try {
    const all = JSON.parse(raw) as Course[];
    return teacherId ? all.filter((c) => c.teacherId === teacherId) : all;
  } catch {
    return SEED;
  }
}

export function saveCourses(list: Course[]) {
  if (!isBrowser()) return;
  sessionStorage.setItem(STORE, JSON.stringify(list));
}

export function getCourse(id: string): Course | undefined {
  return listCourses().find((c) => c.id === id);
}

export function upsertCourse(c: Course) {
  const all = listCourses();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  saveCourses(all);
}

export function removeCourse(id: string) {
  saveCourses(listCourses().filter((c) => c.id !== id));
}

/* ---------- Lesson helpers ---------- */
export function getLesson(courseId: string, lessonId: string) {
  const course = getCourse(courseId);
  return course?.lessons.find((l) => l.id === lessonId);
}

export function upsertLesson(courseId: string, lesson: Lesson) {
  const all = listCourses();
  const course = all.find((c) => c.id === courseId);
  if (!course) return;
  const idx = course.lessons.findIndex((l) => l.id === lesson.id);
  if (idx >= 0) course.lessons[idx] = lesson;
  else course.lessons.push(lesson);
  saveCourses(all);
}

export function removeLesson(courseId: string, lessonId: string) {
  const all = listCourses();
  const course = all.find((c) => c.id === courseId);
  if (!course) return;
  course.lessons = course.lessons.filter((l) => l.id !== lessonId);
  saveCourses(all);
}

/* ---------- Labels ---------- */
export const VIDEO_SERVERS: { key: VideoServer; label: string; hint: string }[] = [
  { key: "youtube", label: "يوتيوب", hint: "رابط فيديو من YouTube" },
  { key: "streamable", label: "Streamable", hint: "رابط من streamable.com" },
  { key: "drive", label: "Google Drive", hint: "رابط المشاركة من Drive" },
  { key: "lms", label: "سيرفر LMS", hint: "رفع مباشر على سيرفر المنصة" },
];

export const EXAM_VISIBILITY_OPTIONS: { key: ExamVisibility; label: string; hint: string }[] = [
  { key: "visible", label: "ظاهر", hint: "متاح للطلاب للدخول والحل." },
  { key: "hidden", label: "مخفي", hint: "لا يظهر للطلاب نهائياً." },
  { key: "locked", label: "ظاهر بدون دخول", hint: "الطلاب يرون الاسم فقط دون السماح بالحل." },
];
