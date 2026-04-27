import { coursesByTeacher, getTeacher, type Course, type Teacher } from "./teachers";

export type FileType = "pdf" | "docx" | "pptx" | "zip" | "xlsx";
export type CourseFile = {
  id: string;
  name: string;
  type: FileType;
  size: string;
  uploadedAt: string;
  uploader: string;
};

export type CourseVideo = {
  id: string;
  title: string;
  description: string;
  duration: string; // mm:ss
  viewsUsed: number; // how many of the allowed views the student used
  maxViews: number; // total allowed views (e.g. 5)
  progress: number; // 0..100 current-watch progress
};

export type ExamStatus = "available" | "waiting" | "ended" | "submitted";
export type CourseExam = {
  id: string;
  title: string;
  description: string;
  date: string; // start label
  endDate?: string;
  duration: string; // e.g. 60 دقيقة
  fullMark: number;
  score?: number; // if submitted
  status: ExamStatus;
};

export type AssignmentStatus = "pending" | "submitted" | "late" | "graded";
export type CourseAssignment = {
  id: string;
  title: string;
  description: string;
  due: string;
  fullMark: number;
  score?: number;
  status: AssignmentStatus;
};

export type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  date?: string; // display label
  dateISO?: string; // ISO for compare; lesson is locked if dateISO > now
  videos: CourseVideo[];
  files: CourseFile[];
  assignments: CourseAssignment[];
  exams: CourseExam[];
};

export type CourseContent = {
  lessons: CourseLesson[];
};

export function isLessonLocked(l: CourseLesson, now: Date = new Date()): boolean {
  if (!l.dateISO) return false;
  const t = Date.parse(l.dateISO);
  if (Number.isNaN(t)) return false;
  return t > now.getTime();
}

/**
 * Sequential video unlock: a video is unlocked only if it's the first one
 * OR the previous video has reached 100% progress.
 */
export function isVideoLocked(lesson: CourseLesson, videoIndex: number): boolean {
  if (videoIndex <= 0) return false;
  const prev = lesson.videos[videoIndex - 1];
  if (!prev) return true;
  return prev.progress < 100;
}

export function getLessonAndVideo(
  teacherId: string,
  courseId: string,
  lessonId: string,
  videoId: string
): {
  teacher?: ReturnType<typeof getTeacher>;
  course?: Course;
  lesson?: CourseLesson;
  video?: CourseVideo;
  videoIndex: number;
} {
  const { teacher, course } = getCourse(teacherId, courseId);
  const content = getCourseContent(teacherId, courseId);
  const lesson = content.lessons.find((l) => l.id === lessonId);
  const videoIndex = lesson ? lesson.videos.findIndex((v) => v.id === videoId) : -1;
  const video = lesson && videoIndex >= 0 ? lesson.videos[videoIndex] : undefined;
  return { teacher, course, lesson, video, videoIndex };
}

const MAX_VIEWS = 5;
const UPLOADER = "أ. محمد الشناوي";

const sampleLessons: CourseLesson[] = [
  {
    id: "l1",
    title: "الحصة 1 - مقدمة القيمة المطلقة",
    description: "تعريف القيمة المطلقة، خصائصها، وأمثلة تمهيدية",
    date: "12 أبريل 2026",
    dateISO: "2026-04-12T18:00:00",
    videos: [
      { id: "l1v1", title: "مقدمة في القيمة المطلقة", description: "تعريف القيمة المطلقة وعرضها وتمثيلها على خط الأعداد مع أمثلة توضيحية.", duration: "15:40", viewsUsed: 5, maxViews: MAX_VIEWS, progress: 100 },
      { id: "l1v2", title: "تعريف القيمة المطلقة", description: "شرح تعريف القيمة المطلقة بشكل تفصيلي وأمثلة عددية.", duration: "12:30", viewsUsed: 3, maxViews: MAX_VIEWS, progress: 100 },
      { id: "l1v3", title: "خصائص القيمة المطلقة", description: "أهم خصائص القيمة المطلقة مع براهين مبسطة.", duration: "15:40", viewsUsed: 5, maxViews: MAX_VIEWS, progress: 100 },
      { id: "l1v4", title: "حل المعادلات بالقيمة المطلقة", description: "خطوات حل المعادلات التي تحتوي على قيمة مطلقة.", duration: "18:20", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
      { id: "l1v5", title: "تمارين وتطبيقات", description: "تمارين متنوعة وتطبيقات على الدرس.", duration: "14:10", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
    ],
    files: [
      { id: "l1fl1", name: "ملخص الحصة 1", type: "pdf", size: "2.4 MB", uploadedAt: "12 أبريل 2026", uploader: UPLOADER },
      { id: "l1fl2", name: "أوراق عمل تمهيدية", type: "pdf", size: "1.8 MB", uploadedAt: "12 أبريل 2026", uploader: UPLOADER },
      { id: "l1fl3", name: "عرض تقديمي للحصة", type: "pptx", size: "5.7 MB", uploadedAt: "11 أبريل 2026", uploader: UPLOADER },
    ],
    assignments: [
      {
        id: "l1a1",
        title: "واجب الحصة 1 - تمارين القيمة المطلقة",
        description: "حل التمارين من 1 إلى 15 صفحة 24",
        due: "حتى 14 أبريل 2026 - 11:59 م",
        fullMark: 50,
        score: 45,
        status: "graded",
      },
    ],
    exams: [
      {
        id: "l1ex1",
        title: "اختبار سريع على الحصة 1",
        description: "اختبار الفهم الأساسي لموضوع القيمة المطلقة",
        date: "13 أبريل 2026",
        endDate: "انتهى في 13 أبريل 2026 - 11:59 م",
        duration: "30 دقيقة",
        fullMark: 50,
        score: 42,
        status: "submitted",
      },
    ],
  },
  {
    id: "l2",
    title: "الحصة 2 - المعادلات بقيمة مطلقة",
    description: "حل المعادلات التي تحتوي على قيمة مطلقة",
    date: "20 أبريل 2026",
    dateISO: "2026-04-20T18:00:00",
    videos: [
      { id: "l2v1", title: "حل المعادلات التي تحتوي على قيمة مطلقة", description: "خطوات حل المعادلات", duration: "22:10", viewsUsed: 2, maxViews: MAX_VIEWS, progress: 40 },
      { id: "l2v2", title: "أمثلة متقدمة على المعادلات", description: "نماذج امتحانات سابقة", duration: "19:05", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
    ],
    files: [
      { id: "l2fl1", name: "ملخص الحصة 2", type: "pdf", size: "2.1 MB", uploadedAt: "20 أبريل 2026", uploader: UPLOADER },
      { id: "l2fl2", name: "حل تمارين كتاب المدرسة", type: "pdf", size: "3.1 MB", uploadedAt: "20 أبريل 2026", uploader: UPLOADER },
      { id: "l2fl3", name: "تجميعات إضافية", type: "docx", size: "2.9 MB", uploadedAt: "19 أبريل 2026", uploader: UPLOADER },
    ],
    assignments: [
      {
        id: "l2a1",
        title: "واجب الحصة 2 - حل معادلات",
        description: "حل 10 معادلات بقيمة مطلقة",
        due: "حتى 24 أبريل 2026",
        fullMark: 50,
        status: "submitted",
      },
    ],
    exams: [
      {
        id: "l2ex1",
        title: "امتحان الحصة 2",
        description: "اختبار شامل على المعادلات بقيمة مطلقة",
        date: "26 أبريل 2026",
        endDate: "حتى 27 أبريل 2026 - 11:59 م",
        duration: "60 دقيقة",
        fullMark: 100,
        status: "available",
      },
    ],
  },
  {
    id: "l3",
    title: "الحصة 3 - المتباينات بقيمة مطلقة",
    description: "شرح حل المتباينات بخطوات مفصلة",
    date: "5 مايو 2026",
    dateISO: "2026-05-05T18:00:00",
    videos: [
      { id: "l3v1", title: "حل المتباينات التي تحتوي على قيمة مطلقة", description: "شرح بخطوات مفصلة", duration: "20:15", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
      { id: "l3v2", title: "تدريبات على المتباينات", description: "تمارين متنوعة", duration: "17:40", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
      { id: "l3v3", title: "مراجعة عامة للحصة", description: "أهم النقاط والأخطاء الشائعة", duration: "12:30", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
    ],
    files: [
      { id: "l3fl1", name: "ملخص الحصة 3", type: "pdf", size: "2.6 MB", uploadedAt: "5 مايو 2026", uploader: UPLOADER },
      { id: "l3fl2", name: "تمارين المتباينات", type: "pdf", size: "1.5 MB", uploadedAt: "5 مايو 2026", uploader: UPLOADER },
    ],
    assignments: [
      {
        id: "l3a1",
        title: "واجب الحصة 3 - متباينات",
        description: "حل 8 متباينات بقيمة مطلقة",
        due: "حتى 8 مايو 2026",
        fullMark: 40,
        status: "pending",
      },
    ],
    exams: [
      {
        id: "l3ex1",
        title: "امتحان الحصة 3",
        description: "اختبار على المتباينات",
        date: "10 مايو 2026",
        endDate: "حتى 10 مايو 2026 - 8:00 م",
        duration: "60 دقيقة",
        fullMark: 100,
        status: "waiting",
      },
    ],
  },
  {
    id: "l4",
    title: "الحصة 4 - تطبيقات هندسية",
    description: "تطبيقات حياتية وهندسية على القيمة المطلقة",
    date: "15 مايو 2026",
    dateISO: "2026-05-15T18:00:00",
    videos: [
      { id: "l4v1", title: "تطبيقات هندسية على القيمة المطلقة", description: "المسافة بين نقطتين", duration: "19:50", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
      { id: "l4v2", title: "مسائل على البعد المطلق", description: "تطبيقات متقدمة", duration: "16:15", viewsUsed: 0, maxViews: MAX_VIEWS, progress: 0 },
    ],
    files: [
      { id: "l4fl1", name: "ملخص التطبيقات الهندسية", type: "pdf", size: "3.0 MB", uploadedAt: "15 مايو 2026", uploader: UPLOADER },
      { id: "l4fl2", name: "أسئلة على التطبيقات", type: "zip", size: "4.2 MB", uploadedAt: "15 مايو 2026", uploader: UPLOADER },
    ],
    assignments: [
      {
        id: "l4a1",
        title: "واجب الحصة 4 - مسائل تطبيقية",
        description: "حل 6 مسائل هندسية",
        due: "حتى 18 مايو 2026",
        fullMark: 30,
        status: "pending",
      },
    ],
    exams: [
      {
        id: "l4ex1",
        title: "امتحان الحصة 4",
        description: "اختبار التطبيقات الهندسية",
        date: "20 مايو 2026",
        endDate: "حتى 20 مايو 2026 - 8:00 م",
        duration: "60 دقيقة",
        fullMark: 100,
        status: "waiting",
      },
    ],
  },
];

export function getCourseContent(_teacherId: string, _courseId: string): CourseContent {
  // Mocked: same content for any course/teacher.
  return { lessons: sampleLessons };
}

export function getCourse(teacherId: string, courseId: string): { teacher?: Teacher; course?: Course } {
  const teacher = getTeacher(teacherId);
  const course = (coursesByTeacher[teacherId] ?? []).find((c) => c.id === courseId);
  return { teacher, course };
}
