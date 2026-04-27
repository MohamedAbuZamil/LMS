"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  ArrowRight,
  FolderOpen,
  ClipboardList,
  ClipboardCheck,
  PlayCircle,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileType2,
  Download,
  MoreHorizontal,
  Clock,
  Calendar,
  Eye,
  Lock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Award,
  Info,
  Play,
  ChevronDown,
  Video,
  CalendarDays,
  CalendarClock,
} from "lucide-react";
import { CourseCover } from "@/components/dashboard/CourseCover";
import type { CourseTheme } from "@/lib/data/teachers";
import {
  getCourse,
  getCourseContent,
  isLessonLocked,
  isVideoLocked,
  type CourseFile,
  type CourseVideo,
  type CourseLesson,
  type CourseExam,
  type CourseAssignment,
  type FileType,
} from "@/lib/data/courseContent";

type TabKey = "videos" | "assignments" | "exams" | "files";

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "videos", label: "الفيديوهات", icon: PlayCircle },
  { key: "assignments", label: "الواجبات", icon: ClipboardCheck },
  { key: "exams", label: "الامتحانات", icon: ClipboardList },
  { key: "files", label: "الملفات", icon: FolderOpen },
];

export default function CourseDetailPage() {
  const params = useParams<{ id: string; courseId: string }>();
  const { teacher, course } = getCourse(params.id, params.courseId);
  if (!teacher || !course) return notFound();

  const content = useMemo(() => getCourseContent(teacher.id, course.id), [teacher.id, course.id]);
  const [tab, setTab] = useState<TabKey>("videos");

  return (
    <div className="max-w-[1400px] mx-auto relative">
      {/* decorative blobs */}
      <span className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl animate-blob -z-10" />
      <span className="pointer-events-none absolute top-40 left-0 w-64 h-64 rounded-full bg-fuchsia-200/30 blur-3xl animate-blob -z-10" style={{ animationDelay: "2.5s" }} />

      {/* Header */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <Link
            href={`/dashboard/my-teachers/${teacher.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-ink-700 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/40 rounded-xl px-3 py-2 transition mb-3"
          >
            <ArrowRight size={14} />
            الرجوع إلى الكورسات
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-black text-ink-900"
          >
            {course.title}
          </motion.h1>

          <nav className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
            <Link href="/dashboard" className="hover:text-brand-700">الرئيسية</Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <Link href="/dashboard/my-teachers" className="hover:text-brand-700">مدرسيني</Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <Link href={`/dashboard/my-teachers/${teacher.id}`} className="hover:text-brand-700 truncate max-w-[160px]">{teacher.name}</Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <span className="font-extrabold text-ink-700 truncate max-w-[200px]">{course.title}</span>
          </nav>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-card/40 p-3 sm:min-w-[300px]"
        >
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
            <CourseCover theme={course.theme} />
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className={`text-xs font-extrabold ${teacher.text} truncate`}>{teacher.subject}</p>
            <p className="text-[11px] text-ink-700 mt-0.5 truncate">{teacher.name}</p>
            <p className="text-[10px] text-ink-500 mt-0.5 truncate">{course.grade}</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <LayoutGroup id="course-tabs">
        <div className="bg-white rounded-2xl border border-slate-100 p-1.5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-1">
          {tabs.map((t) => {
            const active = tab === t.key;
            const Icon = t.icon;
            const count = countFor(t.key, content.lessons);
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition ${
                  active ? "text-brand-700" : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="course-tab-pill"
                    className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative inline-flex items-center gap-2">
                  <Icon size={15} />
                  {t.label}
                  <span className={`text-[10px] font-extrabold rounded-full px-1.5 py-0.5 ${active ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-600"}`}>{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "videos" && <VideosTab lessons={content.lessons} courseHref={`/dashboard/my-teachers/${teacher.id}/${course.id}`} />}
          {tab === "assignments" && <AssignmentsTab lessons={content.lessons} teacherId={teacher.id} courseId={course.id} />}
          {tab === "exams" && <ExamsTab lessons={content.lessons} teacherId={teacher.id} courseId={course.id} />}
          {tab === "files" && <FilesTab lessons={content.lessons} />}
        </motion.div>
      </AnimatePresence>

      {/* note footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 bg-brand-50/60 border border-brand-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-[12px] text-brand-900"
      >
        <Info size={14} className="text-brand-600 shrink-0" />
        <span>الحصص تفتح تلقائياً في موعدها المحدد، ولا يمكن الدخول قبل ذلك.</span>
      </motion.div>
    </div>
  );
}

function countFor(key: TabKey, lessons: CourseLesson[]) {
  return lessons.reduce((a, l) => {
    switch (key) {
      case "videos": return a + l.videos.length;
      case "assignments": return a + l.assignments.length;
      case "exams": return a + l.exams.length;
      case "files": return a + l.files.length;
    }
  }, 0);
}

/* ─────────── Reusable Lesson Accordion ─────────── */
type LessonCardMeta = {
  itemNoun: string;
  itemIcon: React.ComponentType<{ size?: number; className?: string }>;
  total: number;
  done: number;
  doneLabel: string; // e.g. "اكتملت" / "تم التسليم" / ""
};

function useLessonOpenState(lessons: CourseLesson[]) {
  // open the first non-locked lesson by default
  const firstUnlocked = lessons.findIndex((l) => !isLessonLocked(l));
  const initial = Object.fromEntries(
    lessons.map((l, i) => [l.id, i === (firstUnlocked === -1 ? 0 : firstUnlocked)])
  );
  return useState<Record<string, boolean>>(initial);
}

function LessonCard({
  lesson,
  index,
  isOpen,
  onToggle,
  meta,
  children,
}: {
  lesson: CourseLesson;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  meta: LessonCardMeta;
  children: React.ReactNode;
}) {
  const locked = isLessonLocked(lesson);
  const allDone = meta.total > 0 && meta.done === meta.total;
  const ItemIcon = meta.itemIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.06 } }}
      className={`bg-white rounded-2xl border overflow-hidden ${locked ? "border-slate-200" : "border-slate-100"}`}
    >
      <button
        onClick={onToggle}
        className={`w-full text-right px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 transition group ${locked ? "hover:bg-amber-50/40" : "hover:bg-slate-50"}`}
      >
        {/* number badge */}
        <span className={`relative w-12 h-12 rounded-xl text-white grid place-items-center font-black shadow-soft shrink-0 ${locked ? "bg-gradient-to-br from-slate-400 to-slate-600" : "bg-gradient-to-br from-brand-500 to-brand-700"}`}>
          {locked ? (
            <Lock size={16} />
          ) : (
            <span className="text-sm">{index + 1}</span>
          )}
          {!locked && allDone && (
            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white grid place-items-center">
              <CheckCircle2 size={10} className="text-white" />
            </span>
          )}
        </span>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-extrabold text-sm sm:text-base truncate ${locked ? "text-ink-700" : "text-ink-900"}`}>{lesson.title}</p>
            {locked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <Hourglass size={10} /> لم يحن موعد الحصة
              </span>
            )}
            {!locked && allDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <CheckCircle2 size={10} /> {meta.doneLabel || "مكتمل"}
              </span>
            )}
          </div>
          {lesson.description && (
            <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{lesson.description}</p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-ink-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <ItemIcon size={11} /> {meta.total} {meta.itemNoun}
            </span>
            {lesson.date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={11} /> {lesson.date}
              </span>
            )}
            {!locked && meta.doneLabel && meta.total > 0 && (
              <span className={`inline-flex items-center gap-1 font-extrabold ${allDone ? "text-emerald-700" : "text-brand-700"}`}>
                {meta.done}/{meta.total} {meta.doneLabel}
              </span>
            )}
          </div>
        </div>

        {/* chevron */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${locked ? "bg-amber-50 text-amber-600" : "bg-slate-100 group-hover:bg-brand-100 text-ink-600 group-hover:text-brand-700"}`}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100"
          >
            {locked ? <LockedPanel date={lesson.date} /> : children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LockedPanel({ date }: { date?: string }) {
  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10 bg-gradient-to-br from-amber-50/60 via-white to-rose-50/40 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-soft mb-4"
      >
        <Lock size={28} />
        <span className="absolute inset-0 rounded-2xl bg-amber-400 animate-ping opacity-30" />
      </motion.div>
      <p className="text-sm font-extrabold text-ink-900">هذه الحصة لم تُتح بعد</p>
      <p className="text-[12px] text-ink-600 mt-1">لا يمكن الدخول إلى محتوى الحصة قبل موعدها المحدد.</p>
      {date && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-white border border-amber-200 rounded-full px-3 py-1.5 shadow-soft">
          <CalendarClock size={13} />
          ستفتح في: {date}
        </span>
      )}
    </div>
  );
}

/* ─────────── Videos Tab ─────────── */
const lessonThemes: CourseTheme[] = ["graph", "calculus", "equation", "constellation", "blackboard", "geometry", "dice", "sequence"];

function VideosTab({ lessons, courseHref }: { lessons: CourseLesson[]; courseHref: string }) {
  const [open, setOpen] = useLessonOpenState(lessons);
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const totalVideos = lessons.reduce((a, l) => a + l.videos.length, 0);
  const finishedVideos = lessons.reduce(
    (a, l) => a + (isLessonLocked(l) ? 0 : l.videos.filter((v) => v.viewsUsed >= v.maxViews).length),
    0
  );

  return (
    <div className="space-y-4">
      <SummaryHeader
        icon={Video}
        title="محتوى الكورس"
        subtitle={`${lessons.length} حصة · ${totalVideos} فيديو`}
        progressLabel="إجمالي التقدم"
        done={finishedVideos}
        total={totalVideos}
        accent="emerald"
      />

      {lessons.map((lesson, lIdx) => {
        const finished = lesson.videos.filter((v) => v.viewsUsed >= v.maxViews).length;
        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={lIdx}
            isOpen={open[lesson.id] ?? false}
            onToggle={() => toggle(lesson.id)}
            meta={{ itemNoun: "فيديو", itemIcon: Video, total: lesson.videos.length, done: finished, doneLabel: "اكتملت" }}
          >
            <div className="p-3 sm:p-4 space-y-2.5">
              {lesson.videos.map((v, vIdx) => (
                <VideoRow
                  key={v.id}
                  v={v}
                  index={vIdx}
                  theme={lessonThemes[(lIdx + vIdx) % lessonThemes.length]}
                  href={`${courseHref}/${lesson.id}/${v.id}`}
                  locked={isVideoLocked(lesson, vIdx)}
                />
              ))}
            </div>
          </LessonCard>
        );
      })}
    </div>
  );
}

function VideoRow({ v, index, theme, href, locked }: { v: CourseVideo; index: number; theme: CourseTheme; href: string; locked: boolean }) {
  const remaining = Math.max(v.maxViews - v.viewsUsed, 0);
  const finished = v.viewsUsed >= v.maxViews;
  const started = v.viewsUsed > 0 && !finished;

  const status = locked
    ? { label: "أكمل الفيديو السابق أولاً", cls: "text-amber-700", chip: "bg-amber-50 border-amber-200" }
    : finished
    ? { label: "تم استنفاد المشاهدات", cls: "text-emerald-700", chip: "bg-emerald-50 border-emerald-200" }
    : started
    ? { label: `${remaining} مشاهدة متبقية`, cls: "text-brand-700", chip: "bg-brand-50 border-brand-200" }
    : { label: "لم تبدأ بعد", cls: "text-ink-600", chip: "bg-slate-50 border-slate-200" };

  const Wrapper = locked ? ("div" as const) : Link;
  const wrapperProps = locked ? {} : { href };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
      whileHover={locked ? undefined : { x: -3 }}
    >
      <Wrapper
        {...(wrapperProps as Record<string, unknown>)}
        aria-disabled={locked || undefined}
        className={`flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl border transition group ${
          locked
            ? "bg-slate-50/50 border-transparent cursor-not-allowed opacity-90"
            : "hover:bg-slate-50 border-transparent hover:border-slate-100"
        }`}
      >
      <div className="relative w-28 sm:w-36 h-16 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-ink-900">
        <div className="absolute inset-0 opacity-80">
          <CourseCover theme={theme} />
        </div>
        <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
          <Clock size={9} />
          {v.duration}
        </span>
        <span className="absolute inset-0 grid place-items-center bg-black/30 group-hover:bg-black/40 transition">
          <motion.span
            whileHover={locked ? undefined : { scale: 1.1 }}
            className={`w-9 h-9 rounded-full grid place-items-center shadow-soft ${
              locked
                ? "bg-white/20 backdrop-blur text-white"
                : finished
                ? "bg-emerald-500/95 text-white"
                : "bg-white/95 text-brand-700"
            }`}
          >
            {locked ? <Lock size={16} /> : finished ? <CheckCircle2 size={16} /> : <Play size={15} className="ms-0.5" />}
          </motion.span>
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-extrabold text-sm text-ink-900 truncate">{v.title}</p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border px-1.5 py-0.5 ${status.chip} ${status.cls}`}>
            {status.label}
          </span>
        </div>
        <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{v.description}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
            <Eye size={11} /> المشاهدات:
          </span>
          <span className={`text-[11px] font-extrabold ${finished ? "text-emerald-700" : "text-brand-700"}`}>
            {v.viewsUsed}/{v.maxViews}
          </span>
          <span className="hidden sm:flex items-center gap-1 ms-1">
            {Array.from({ length: v.maxViews }).map((_, di) => {
              const filled = di < v.viewsUsed;
              return (
                <motion.span
                  key={di}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + di * 0.05, type: "spring", stiffness: 400 }}
                  className={`w-2 h-2 rounded-full ${filled ? (finished ? "bg-emerald-500" : "bg-brand-500") : "bg-slate-200"}`}
                />
              );
            })}
          </span>
        </div>
      </div>

      <span
        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
          locked
            ? "border border-slate-200 text-ink-400"
            : finished
            ? "border border-slate-200 text-ink-400"
            : "border border-brand-200 text-brand-700 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600"
        }`}
      >
        {locked ? <Lock size={12} /> : finished ? <Lock size={12} /> : <Play size={12} />}
        {locked ? "مقفول" : finished ? "انتهت المشاهدات" : started ? "متابعة" : "تشغيل الفيديو"}
      </span>
      </Wrapper>
    </motion.div>
  );
}

/* ─────────── Assignments Tab ─────────── */
function AssignmentsTab({ lessons, teacherId, courseId }: { lessons: CourseLesson[]; teacherId: string; courseId: string }) {
  const [open, setOpen] = useLessonOpenState(lessons);
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const total = lessons.reduce((a, l) => a + l.assignments.length, 0);
  const submitted = lessons.reduce(
    (a, l) => a + (isLessonLocked(l) ? 0 : l.assignments.filter((x) => x.status === "submitted" || x.status === "graded").length),
    0
  );

  return (
    <div className="space-y-4">
      <SummaryHeader
        icon={ClipboardCheck}
        title="واجبات الكورس"
        subtitle={`${lessons.length} حصة · ${total} واجب`}
        progressLabel="تم تسليمه"
        done={submitted}
        total={total}
        accent="amber"
      />
      {lessons.map((lesson, lIdx) => {
        const done = lesson.assignments.filter((x) => x.status === "submitted" || x.status === "graded").length;
        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={lIdx}
            isOpen={open[lesson.id] ?? false}
            onToggle={() => toggle(lesson.id)}
            meta={{ itemNoun: "واجب", itemIcon: ClipboardCheck, total: lesson.assignments.length, done, doneLabel: "تم التسليم" }}
          >
            {lesson.assignments.length === 0 ? (
              <EmptyBody icon={ClipboardCheck} text="لا توجد واجبات في هذه الحصة" />
            ) : (
              <div className="divide-y divide-slate-100">
                {lesson.assignments.map((a, i) => (
                  <AssignmentRow
                    key={a.id}
                    a={a}
                    index={i}
                    runnerHref={`/assignment/${teacherId}/${courseId}/${lesson.id}/${a.id}`}
                    reviewHref={`/review/assignment/${teacherId}/${courseId}/${lesson.id}/${a.id}`}
                  />
                ))}
              </div>
            )}
          </LessonCard>
        );
      })}
    </div>
  );
}

function AssignmentRow({ a, index, runnerHref, reviewHref }: { a: CourseAssignment; index: number; runnerHref: string; reviewHref: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-3 lg:gap-5 items-center px-4 sm:px-5 py-4 hover:bg-brand-50/30 transition"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">
          <ClipboardCheck size={16} />
        </span>
        <div className="min-w-0">
          <p className="font-extrabold text-sm text-ink-900 truncate">{a.title}</p>
          <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{a.description}</p>
        </div>
      </div>
      <Cell label="تاريخ التسليم" icon={Calendar}>
        <p className="font-bold text-ink-800">{a.due}</p>
      </Cell>
      <Cell label="الدرجة" icon={Award}>
        {a.score != null ? (
          <p className={`font-extrabold ${gradeColor(a.score, a.fullMark)}`}>
            {a.score} <span className="text-ink-400 font-normal text-[11px]">من {a.fullMark}</span>
          </p>
        ) : (
          <p className="font-bold text-ink-700">{a.fullMark} <span className="text-ink-400 font-normal text-[11px]">من {a.fullMark}</span></p>
        )}
      </Cell>
      <div className="flex flex-col items-stretch gap-2 min-w-[160px]">
        <AssignmentStatusBadge status={a.status} />
        <AssignmentActionButton status={a.status} runnerHref={runnerHref} reviewHref={reviewHref} />
      </div>
    </motion.div>
  );
}

function AssignmentStatusBadge({ status }: { status: CourseAssignment["status"] }) {
  const map = {
    pending: { label: "لم يتم التسليم", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    submitted: { label: "تم التسليم", cls: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
    graded: { label: "تم التصحيح", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    late: { label: "متأخر", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-full border px-2.5 py-1 justify-center ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function AssignmentActionButton({ status, runnerHref, reviewHref }: { status: CourseAssignment["status"]; runnerHref: string; reviewHref: string }) {
  if (status === "pending" || status === "late") {
    return (
      <Link
        href={runnerHref}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-l from-brand-600 to-brand-500 text-white text-xs font-extrabold shadow-soft hover:shadow-card/40 hover:from-brand-700 hover:to-brand-600 transition"
      >
        <ClipboardCheck size={13} />
        تسليم الواجب
      </Link>
    );
  }
  return (
    <Link
      href={reviewHref}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-50 transition"
    >
      <Eye size={13} />
      عرض التسليم
    </Link>
  );
}

/* ─────────── Exams Tab ─────────── */
function ExamsTab({ lessons, teacherId, courseId }: { lessons: CourseLesson[]; teacherId: string; courseId: string }) {
  const [open, setOpen] = useLessonOpenState(lessons);
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const total = lessons.reduce((a, l) => a + l.exams.length, 0);
  const taken = lessons.reduce(
    (a, l) => a + (isLessonLocked(l) ? 0 : l.exams.filter((x) => x.status === "submitted" || x.status === "ended").length),
    0
  );

  return (
    <div className="space-y-4">
      <SummaryHeader
        icon={ClipboardList}
        title="امتحانات الكورس"
        subtitle={`${lessons.length} حصة · ${total} امتحان`}
        progressLabel="تم اجتيازه"
        done={taken}
        total={total}
        accent="brand"
      />
      {lessons.map((lesson, lIdx) => {
        const done = lesson.exams.filter((x) => x.status === "submitted" || x.status === "ended").length;
        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={lIdx}
            isOpen={open[lesson.id] ?? false}
            onToggle={() => toggle(lesson.id)}
            meta={{ itemNoun: "امتحان", itemIcon: ClipboardList, total: lesson.exams.length, done, doneLabel: "تم الحل" }}
          >
            {lesson.exams.length === 0 ? (
              <EmptyBody icon={ClipboardList} text="لا توجد امتحانات في هذه الحصة" />
            ) : (
              <div className="divide-y divide-slate-100">
                {lesson.exams.map((ex, i) => (
                  <ExamRow
                    key={ex.id}
                    ex={ex}
                    index={i}
                    runnerHref={`/exam/${teacherId}/${courseId}/${lesson.id}/${ex.id}`}
                    reviewHref={`/review/exam/${teacherId}/${courseId}/${lesson.id}/${ex.id}`}
                  />
                ))}
              </div>
            )}
          </LessonCard>
        );
      })}
    </div>
  );
}

function ExamRow({ ex, index, runnerHref, reviewHref }: { ex: CourseExam; index: number; runnerHref: string; reviewHref: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto_auto] gap-3 lg:gap-5 items-center px-4 sm:px-5 py-4 hover:bg-brand-50/30 transition"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 grid place-items-center shrink-0">
          <ClipboardList size={16} />
        </span>
        <div className="min-w-0">
          <p className="font-extrabold text-sm text-ink-900 truncate">{ex.title}</p>
          <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{ex.description}</p>
          {ex.status === "submitted" && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 size={10} /> تم الحل
            </span>
          )}
        </div>
      </div>
      <Cell label="تاريخ الامتحان" icon={Calendar}>
        <p className="font-bold text-ink-800">{ex.date}</p>
        {ex.endDate && <p className="text-[10px] text-ink-500 mt-0.5">{ex.endDate}</p>}
      </Cell>
      <Cell label="المدة" icon={Clock}>
        <p className="font-bold text-ink-800">{ex.duration}</p>
      </Cell>
      <Cell label="الدرجة" icon={Award}>
        {ex.score != null ? (
          <p className={`font-extrabold ${gradeColor(ex.score, ex.fullMark)}`}>
            {ex.score} <span className="text-ink-400 font-normal text-[11px]">من {ex.fullMark}</span>
          </p>
        ) : (
          <p className="font-bold text-ink-700">{ex.fullMark} <span className="text-ink-400 font-normal text-[11px]">من {ex.fullMark}</span></p>
        )}
      </Cell>
      <div className="flex flex-col items-stretch gap-2 min-w-[160px]">
        <ExamStatusBadge status={ex.status} />
        <ExamActionButton status={ex.status} runnerHref={runnerHref} reviewHref={reviewHref} />
      </div>
    </motion.div>
  );
}

function ExamStatusBadge({ status }: { status: CourseExam["status"] }) {
  const map = {
    available: { label: "متاح الآن", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    waiting: { label: "في انتظار الإتاحة", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    ended: { label: "انتهى", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    submitted: { label: "تم التسليم", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold rounded-full border px-2.5 py-1 justify-center ${m.cls}`}>
      <span className="relative w-1.5 h-1.5">
        <span className={`absolute inset-0 rounded-full ${m.dot} animate-ping opacity-60`} />
        <span className={`relative w-1.5 h-1.5 rounded-full ${m.dot} block`} />
      </span>
      {m.label}
    </span>
  );
}

function ExamActionButton({ status, runnerHref, reviewHref }: { status: CourseExam["status"]; runnerHref: string; reviewHref: string }) {
  if (status === "available") {
    return (
      <Link
        href={runnerHref}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-l from-brand-600 to-brand-500 text-white text-xs font-extrabold shadow-soft hover:shadow-card/40 hover:from-brand-700 hover:to-brand-600 transition"
      >
        <ClipboardList size={13} />
        دخول الامتحان
      </Link>
    );
  }
  if (status === "submitted") {
    return (
      <Link
        href={reviewHref}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-50 transition"
      >
        <Eye size={13} />
        عرض نموذج الإجابة
      </Link>
    );
  }
  if (status === "ended") {
    return (
      <Link
        href={reviewHref}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-ink-600 text-xs font-bold hover:bg-slate-50 transition"
      >
        <Eye size={13} />
        عرض نموذج الإجابة
      </Link>
    );
  }
  return (
    <button disabled className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-ink-500 text-xs font-bold cursor-not-allowed">
      <Lock size={13} />
      في انتظار موعد الامتحان
    </button>
  );
}

/* ─────────── Files Tab ─────────── */
function FilesTab({ lessons }: { lessons: CourseLesson[] }) {
  const [open, setOpen] = useLessonOpenState(lessons);
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const total = lessons.reduce((a, l) => a + l.files.length, 0);

  return (
    <div className="space-y-4">
      <SummaryHeader
        icon={FolderOpen}
        title="ملفات الكورس"
        subtitle={`${lessons.length} حصة · ${total} ملف`}
        accent="brand"
      />
      {lessons.map((lesson, lIdx) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          index={lIdx}
          isOpen={open[lesson.id] ?? false}
          onToggle={() => toggle(lesson.id)}
          meta={{ itemNoun: "ملف", itemIcon: FolderOpen, total: lesson.files.length, done: 0, doneLabel: "" }}
        >
          {lesson.files.length === 0 ? (
            <EmptyBody icon={FolderOpen} text="لا توجد ملفات في هذه الحصة" />
          ) : (
            <FilesTable files={lesson.files} />
          )}
        </LessonCard>
      ))}
    </div>
  );
}

function FilesTable({ files }: { files: CourseFile[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[11px] text-ink-500">
          <tr>
            <th className="text-right px-4 py-2.5 font-bold">اسم الملف</th>
            <th className="text-right px-4 py-2.5 font-bold whitespace-nowrap">نوع الملف</th>
            <th className="text-right px-4 py-2.5 font-bold whitespace-nowrap">الحجم</th>
            <th className="text-right px-4 py-2.5 font-bold whitespace-nowrap">تاريخ الرفع</th>
            <th className="text-center px-4 py-2.5 font-bold whitespace-nowrap">تحميل</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, i) => {
            const FT = fileTypeMeta(f.type);
            return (
              <motion.tr
                key={f.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                className="border-t border-slate-100 hover:bg-brand-50/30 transition"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <button className="text-ink-400 hover:text-ink-700 shrink-0">
                      <MoreHorizontal size={16} />
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900 truncate">{f.name}</p>
                      <p className="text-[10px] text-ink-500 truncate">تم رفعه بواسطة: {f.uploader}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${FT.text}`}>
                    <span className={`w-7 h-7 rounded-lg ${FT.bg} grid place-items-center`}>
                      <FT.Icon size={14} />
                    </span>
                    ملف {f.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-700">{f.size}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-700">{f.uploadedAt}</td>
                <td className="px-4 py-3 text-center">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white transition"
                    aria-label="تحميل"
                  >
                    <Download size={15} />
                  </motion.button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function fileTypeMeta(t: FileType) {
  switch (t) {
    case "pdf": return { Icon: FileType2, bg: "bg-rose-100", text: "text-rose-700" };
    case "docx": return { Icon: FileText, bg: "bg-sky-100", text: "text-sky-700" };
    case "pptx": return { Icon: FileText, bg: "bg-orange-100", text: "text-orange-700" };
    case "xlsx": return { Icon: FileSpreadsheet, bg: "bg-emerald-100", text: "text-emerald-700" };
    case "zip": return { Icon: FileArchive, bg: "bg-amber-100", text: "text-amber-700" };
  }
}

/* ─────────── Shared bits ─────────── */
function SummaryHeader({
  icon: Icon,
  title,
  subtitle,
  progressLabel,
  done,
  total,
  accent = "brand",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  progressLabel?: string;
  done?: number;
  total?: number;
  accent?: "brand" | "emerald" | "amber";
}) {
  const accentMap = {
    brand: { bg: "bg-brand-100", fg: "text-brand-700", bar: "from-brand-600 to-brand-400" },
    emerald: { bg: "bg-emerald-100", fg: "text-emerald-700", bar: "from-emerald-500 to-emerald-400" },
    amber: { bg: "bg-amber-100", fg: "text-amber-700", bar: "from-amber-500 to-amber-400" },
  } as const;
  const a = accentMap[accent];
  const showBar = progressLabel != null && total != null && done != null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
      <div className="flex items-center gap-3 flex-1">
        <span className={`w-11 h-11 rounded-xl ${a.bg} ${a.fg} grid place-items-center`}>
          <Icon size={20} />
        </span>
        <div>
          <p className="text-sm font-extrabold text-ink-900">{title}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {showBar && (
        <div className="flex items-center gap-2 sm:min-w-[260px]">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-ink-700">{progressLabel}</span>
              <span className={`font-extrabold ${a.fg}`}>{done}/{total}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(done! / Math.max(total!, 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-l ${a.bar}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyBody({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <span className="inline-grid place-items-center w-12 h-12 rounded-full bg-slate-50 text-ink-400 mb-2">
        <Icon size={20} />
      </span>
      <p className="text-xs text-ink-500">{text}</p>
    </div>
  );
}

function gradeColor(score: number, full: number) {
  const p = (score / full) * 100;
  if (p >= 85) return "text-emerald-700";
  if (p >= 70) return "text-amber-700";
  return "text-rose-700";
}

function Cell({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <div className="text-[11px] min-w-[120px]">
      <p className="text-ink-500 inline-flex items-center gap-1 mb-0.5">
        <Icon size={11} /> {label}
      </p>
      <div>{children}</div>
    </div>
  );
}
