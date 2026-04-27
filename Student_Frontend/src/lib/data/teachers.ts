export type CourseTheme =
  | "constellation"
  | "calculus"
  | "blackboard"
  | "geometry"
  | "dice"
  | "graph"
  | "sequence"
  | "equation";

export type Course = {
  id: string;
  title: string;
  grade: string;
  progress: number; // 0..100
  lessons: number;
  duration: string;
  theme: CourseTheme;
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  courses: number; // count (display)
  rating: number;
  students: number;
  online: boolean;
  photo: string;
  bg: string;
  ring: string;
  text: string;
  gradFrom: string;
  gradTo: string;
  bio?: string;
};

export const teachers: Teacher[] = [
  {
    id: "t1",
    name: "أ. محمد الثناوي",
    subject: "الرياضيات",
    courses: 12,
    rating: 4.9,
    students: 1240,
    online: true,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    bg: "bg-violet-100",
    ring: "ring-violet-200",
    text: "text-violet-700",
    gradFrom: "from-violet-400",
    gradTo: "to-fuchsia-400",
    bio: "خبرة 15 سنة في تدريس الرياضيات للثانوية العامة",
  },
  {
    id: "t2",
    name: "أ. أحمد سعيد",
    subject: "الفيزياء",
    courses: 8,
    rating: 4.8,
    students: 980,
    online: true,
    photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=600&q=80",
    bg: "bg-emerald-100",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
    gradFrom: "from-emerald-400",
    gradTo: "to-teal-400",
  },
  {
    id: "t3",
    name: "أ. سارة أحمد",
    subject: "اللغة الإنجليزية",
    courses: 10,
    rating: 4.9,
    students: 1100,
    online: false,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    bg: "bg-amber-100",
    ring: "ring-amber-200",
    text: "text-amber-700",
    gradFrom: "from-amber-400",
    gradTo: "to-orange-400",
  },
  {
    id: "t4",
    name: "أ. خالد إبراهيم",
    subject: "الكيمياء",
    courses: 9,
    rating: 4.7,
    students: 870,
    online: true,
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    bg: "bg-sky-100",
    ring: "ring-sky-200",
    text: "text-sky-700",
    gradFrom: "from-sky-400",
    gradTo: "to-blue-400",
  },
  {
    id: "t5",
    name: "أ. محمد هاني",
    subject: "اللغة العربية",
    courses: 7,
    rating: 4.8,
    students: 760,
    online: false,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    bg: "bg-stone-100",
    ring: "ring-stone-200",
    text: "text-stone-700",
    gradFrom: "from-stone-400",
    gradTo: "to-amber-400",
  },
  {
    id: "t6",
    name: "أ. ندى محمود",
    subject: "الأحياء",
    courses: 6,
    rating: 4.9,
    students: 690,
    online: true,
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    bg: "bg-pink-100",
    ring: "ring-pink-200",
    text: "text-pink-700",
    gradFrom: "from-pink-400",
    gradTo: "to-rose-400",
  },
  {
    id: "t7",
    name: "أ. عمرو العطار",
    subject: "الجغرافيا",
    courses: 5,
    rating: 4.6,
    students: 540,
    online: false,
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    bg: "bg-teal-100",
    ring: "ring-teal-200",
    text: "text-teal-700",
    gradFrom: "from-teal-400",
    gradTo: "to-cyan-400",
  },
  {
    id: "t8",
    name: "أ. محمود منصور",
    subject: "التاريخ",
    courses: 6,
    rating: 4.7,
    students: 620,
    online: true,
    photo: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=600&q=80",
    bg: "bg-indigo-100",
    ring: "ring-indigo-200",
    text: "text-indigo-700",
    gradFrom: "from-indigo-400",
    gradTo: "to-violet-400",
  },
];

const mathCourses: Course[] = [
  { id: "c1", title: "الرياضيات التطبيقية", grade: "الصف الثالث الثانوي", progress: 75, lessons: 24, duration: "12 ساعة", theme: "constellation" },
  { id: "c2", title: "التفاضل والتكامل", grade: "الصف الثالث الثانوي", progress: 60, lessons: 28, duration: "14 ساعة", theme: "calculus" },
  { id: "c3", title: "الجبر والهندسة الفراغية", grade: "الصف الثالث الثانوي", progress: 80, lessons: 22, duration: "10 ساعات", theme: "blackboard" },
  { id: "c4", title: "هندسة الفراغ", grade: "الصف الثالث الثانوي", progress: 50, lessons: 18, duration: "9 ساعات", theme: "geometry" },
  { id: "c5", title: "الاحتمالات", grade: "الصف الثالث الثانوي", progress: 65, lessons: 16, duration: "8 ساعات", theme: "dice" },
  { id: "c6", title: "النهايات والدوال", grade: "الصف الثالث الثانوي", progress: 70, lessons: 20, duration: "10 ساعات", theme: "graph" },
  { id: "c7", title: "المتتاليات والمتسلسلات", grade: "الصف الثالث الثانوي", progress: 40, lessons: 14, duration: "7 ساعات", theme: "sequence" },
  { id: "c8", title: "معادلات التفاضل", grade: "الصف الثالث الثانوي", progress: 30, lessons: 12, duration: "6 ساعات", theme: "equation" },
];

const physicsCourses: Course[] = [
  { id: "p1", title: "الميكانيكا الكلاسيكية", grade: "الصف الثالث الثانوي", progress: 70, lessons: 22, duration: "11 ساعة", theme: "graph" },
  { id: "p2", title: "الكهرومغناطيسية", grade: "الصف الثالث الثانوي", progress: 55, lessons: 20, duration: "10 ساعات", theme: "constellation" },
  { id: "p3", title: "الموجات والصوت", grade: "الصف الثالث الثانوي", progress: 65, lessons: 18, duration: "9 ساعات", theme: "graph" },
  { id: "p4", title: "البصريات", grade: "الصف الثالث الثانوي", progress: 45, lessons: 16, duration: "8 ساعات", theme: "geometry" },
  { id: "p5", title: "ديناميكا الحرارة", grade: "الصف الثالث الثانوي", progress: 60, lessons: 14, duration: "7 ساعات", theme: "blackboard" },
  { id: "p6", title: "الفيزياء الذرية", grade: "الصف الثالث الثانوي", progress: 35, lessons: 18, duration: "9 ساعات", theme: "constellation" },
  { id: "p7", title: "النسبية الخاصة", grade: "الصف الثالث الثانوي", progress: 25, lessons: 12, duration: "6 ساعات", theme: "equation" },
  { id: "p8", title: "ميكانيكا الكم", grade: "الصف الثالث الثانوي", progress: 20, lessons: 14, duration: "7 ساعات", theme: "calculus" },
];

const englishCourses: Course[] = [
  { id: "e1", title: "Grammar Mastery", grade: "الصف الثالث الثانوي", progress: 80, lessons: 24, duration: "12 ساعة", theme: "blackboard" },
  { id: "e2", title: "Reading Comprehension", grade: "الصف الثالث الثانوي", progress: 70, lessons: 20, duration: "10 ساعات", theme: "sequence" },
  { id: "e3", title: "Essay Writing", grade: "الصف الثالث الثانوي", progress: 65, lessons: 16, duration: "8 ساعات", theme: "blackboard" },
  { id: "e4", title: "Vocabulary Builder", grade: "الصف الثالث الثانوي", progress: 75, lessons: 30, duration: "15 ساعة", theme: "sequence" },
  { id: "e5", title: "Translation Skills", grade: "الصف الثالث الثانوي", progress: 60, lessons: 18, duration: "9 ساعات", theme: "equation" },
  { id: "e6", title: "Listening Practice", grade: "الصف الثالث الثانوي", progress: 55, lessons: 22, duration: "11 ساعة", theme: "graph" },
  { id: "e7", title: "Speaking Confidence", grade: "الصف الثالث الثانوي", progress: 50, lessons: 14, duration: "7 ساعات", theme: "dice" },
  { id: "e8", title: "Exam Preparation", grade: "الصف الثالث الثانوي", progress: 45, lessons: 16, duration: "8 ساعات", theme: "constellation" },
];

const genericCourses = (subject: string, count: number): Course[] => {
  const titles = [
    `${subject} - الفصل الأول`,
    `${subject} - الفصل الثاني`,
    `${subject} - الفصل الثالث`,
    `مراجعات ${subject}`,
    `أسئلة وامتحانات ${subject}`,
    `أساسيات ${subject}`,
    `متقدم في ${subject}`,
    `تمارين ${subject}`,
  ];
  const themes: CourseTheme[] = ["blackboard", "sequence", "constellation", "geometry", "graph", "equation", "calculus", "dice"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `g-${subject}-${i + 1}`,
    title: titles[i] ?? `${subject} ${i + 1}`,
    grade: "الصف الثالث الثانوي",
    progress: [70, 55, 80, 45, 65, 60, 50, 30][i] ?? 50,
    lessons: 12 + ((i * 3) % 18),
    duration: `${6 + (i % 6)} ساعات`,
    theme: themes[i % themes.length],
  }));
};

export const coursesByTeacher: Record<string, Course[]> = {
  t1: mathCourses,
  t2: physicsCourses,
  t3: englishCourses,
  t4: genericCourses("الكيمياء", 9),
  t5: genericCourses("اللغة العربية", 7),
  t6: genericCourses("الأحياء", 6),
  t7: genericCourses("الجغرافيا", 5),
  t8: genericCourses("التاريخ", 6),
};

export function getTeacher(id: string): Teacher | undefined {
  return teachers.find((t) => t.id === id);
}

export function getCoursesByTeacher(id: string): Course[] {
  return coursesByTeacher[id] ?? [];
}

/* ─── Pricing helpers (mock) ───
 * Deterministic price per course derived from id+lessons so totals look
 * realistic without needing to hardcode prices in every entry. */
export function getCoursePrice(course: Course): number {
  const seed = stringHash(course.id);
  const base = 150 + ((seed % 8) * 50); // 150..500 base
  const perLesson = 8 + (seed % 6); // 8..13 EGP per lesson
  const raw = base + course.lessons * perLesson;
  // round to nearest 5
  return Math.round(raw / 5) * 5;
}

/** Optional discounted/old price (~15-30% higher) for "promo" UI. */
export function getCourseOriginalPrice(course: Course): number | null {
  const seed = stringHash(course.id);
  if (seed % 3 === 0) return null; // ~33% of courses without promo
  const price = getCoursePrice(course);
  const bump = 1.15 + ((seed % 16) / 100); // 1.15..1.30
  return Math.round((price * bump) / 5) * 5;
}

/** Aggregate stats for a teacher: total courses & average price. */
export function teacherCatalogStats(teacherId: string) {
  const list = getCoursesByTeacher(teacherId);
  if (list.length === 0) return { count: 0, min: 0, max: 0, avg: 0 };
  const prices = list.map(getCoursePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  return { count: list.length, min, max, avg };
}

function stringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
