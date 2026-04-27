"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Atom,
  BadgeCheck,
  BookOpen,
  BookText,
  Calculator,
  Clock,
  Dna,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  Layers,
  Library,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { CourseCover } from "@/components/dashboard/CourseCover";
import {
  getCourseOriginalPrice,
  getCoursePrice,
  getCoursesByTeacher,
  teacherCatalogStats,
  teachers,
  type Course,
  type Teacher,
} from "@/lib/data/teachers";
import { currentUser, formatCurrency } from "@/lib/data/currentUser";

const ALL = "كل المواد";
const STORAGE_BALANCE = "lms.buy.balance";

export default function TeachersDirectoryPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>(ALL);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [balance, setBalance] = useState<number>(currentUser.balance);

  /* hydrate balance (shared with /dashboard/buy + /dashboard/recharge) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const b = window.sessionStorage.getItem(STORAGE_BALANCE);
      if (b !== null) setBalance(Number(b));
    } catch { /* ignore */ }
  }, []);

  const subjects = useMemo(
    () => [ALL, ...Array.from(new Set(teachers.map((t) => t.subject)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return teachers.filter((t) => {
      if (subject !== ALL && t.subject !== subject) return false;
      if (!q) return true;
      return t.name.includes(q) || t.subject.includes(q);
    });
  }, [query, subject]);

  const totals = useMemo(
    () => ({
      teachers: teachers.length,
      courses: teachers.reduce((a, t) => a + getCoursesByTeacher(t.id).length, 0),
      subjects: new Set(teachers.map((t) => t.subject)).size,
      students: teachers.reduce((a, t) => a + t.students, 0),
    }),
    []
  );

  return (
    <div className="space-y-6">
      <Hero balance={balance} totals={totals} />

      <Toolbar
        query={query}
        setQuery={setQuery}
        subjects={subjects}
        subject={subject}
        setSubject={setSubject}
        count={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={() => { setQuery(""); setSubject(ALL); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((t, i) => (
            <TeacherDirectoryCard
              key={t.id}
              t={t}
              index={i}
              onBrowse={() => setActiveTeacher(t)}
            />
          ))}
        </div>
      )}

      <TeacherCatalogModal
        teacher={activeTeacher}
        onClose={() => setActiveTeacher(null)}
        balance={balance}
      />
    </div>
  );
}

/* ============================================================ *
 *                            HERO                              *
 * ============================================================ */
function Hero({
  balance,
  totals,
}: {
  balance: number;
  totals: { teachers: number; courses: number; subjects: number; students: number };
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 rounded-3xl text-white p-5 sm:p-7"
    >
      <div className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-5">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 border border-white/20 rounded-full px-2.5 py-1 backdrop-blur">
            <GraduationCap size={12} />
            دليل المدرسين
          </span>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            تعرّف على نخبة المدرسين على المنصة
            <span className="block text-white/85 text-base sm:text-lg font-bold mt-1">
              تصفّح الكورسات لكل مدرس واشترِ مباشرة من رصيدك.
            </span>
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <HeroStat icon={GraduationCap} label="مدرسون" value={totals.teachers} />
            <HeroStat icon={Library} label="كورسات" value={totals.courses} />
            <HeroStat icon={Layers} label="مواد" value={totals.subjects} />
            <HeroStat icon={Users} label="طلاب" value={totals.students.toLocaleString("ar-EG")} />
          </div>
        </div>

        <div className="bg-white/95 text-ink-900 rounded-2xl shadow-soft p-4 sm:p-5 min-w-[240px] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white grid place-items-center shrink-0 shadow-soft">
              <Wallet size={20} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] text-ink-500 font-bold">رصيد محفظتي</p>
              <p className="text-2xl font-black tabular-nums">{formatCurrency(balance)}</p>
            </div>
          </div>
          <Link
            href="/dashboard/recharge"
            className="mt-3 block text-center bg-gradient-to-l from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition rounded-xl text-white text-[11px] font-extrabold shadow-soft py-2"
          >
            شحن رصيد
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 backdrop-blur flex items-center gap-2">
      <span className="w-7 h-7 rounded-lg bg-white/15 grid place-items-center">
        <Icon size={13} />
      </span>
      <div className="leading-tight">
        <p className="text-[10px] text-white/70">{label}</p>
        <p className="text-sm font-black tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================ *
 *                          TOOLBAR                             *
 * ============================================================ */
function Toolbar({
  query,
  setQuery,
  subjects,
  subject,
  setSubject,
  count,
}: {
  query: string;
  setQuery: (s: string) => void;
  subjects: string[];
  subject: string;
  setSubject: (s: string) => void;
  count: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col gap-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مدرس أو مادة..."
            className="w-full bg-slate-50/70 border border-slate-100 rounded-xl pe-9 ps-3 py-2.5 text-sm focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
          />
        </div>
        <span className="text-[11px] text-ink-500 whitespace-nowrap">{count} مدرس</span>
      </div>
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
        {subjects.map((s) => {
          const active = subject === s;
          return (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`shrink-0 text-[11px] font-extrabold rounded-full border-2 px-3 py-1.5 transition ${
                active
                  ? "border-brand-500 bg-brand-50/80 text-brand-800"
                  : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================ *
 *                       TEACHER CARD                           *
 * ============================================================ */
const subjectIcons: Record<string, LucideIcon> = {
  "الرياضيات": Calculator,
  "الفيزياء": Atom,
  "اللغة الإنجليزية": Languages,
  "الكيمياء": FlaskConical,
  "اللغة العربية": BookText,
  "الأحياء": Dna,
  "الجغرافيا": Globe,
  "التاريخ": Landmark,
};

function TeacherDirectoryCard({
  t,
  index,
  onBrowse,
}: {
  t: Teacher;
  index: number;
  onBrowse: () => void;
}) {
  const stats = teacherCatalogStats(t.id);
  const previewCourses = getCoursesByTeacher(t.id).slice(0, 2);
  const SubjectIcon = subjectIcons[t.subject] ?? BookOpen;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-card overflow-hidden flex flex-col transition"
    >
      {/* animated gradient ring on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${t.gradFrom} ${t.gradTo} opacity-0 group-hover:opacity-60 blur transition duration-500`}
      />

      <div className="relative bg-white rounded-2xl flex flex-col flex-1">
        {/* gradient banner */}
        <div className={`relative h-24 bg-gradient-to-br ${t.gradFrom} ${t.gradTo} overflow-hidden`}>
          {/* subtle pattern + decorative subject icon */}
          <span aria-hidden className="pointer-events-none absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <SubjectIcon
            size={120}
            className="absolute -bottom-6 -left-2 text-white/15 -rotate-12"
            strokeWidth={1.5}
          />

          {/* badges */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-white/90 text-ink-800 backdrop-blur text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
              <BookOpen size={10} className="text-brand-600" />
              {stats.count} كورس
            </span>
          </div>

          {t.online && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
              <span className="relative w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-60" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-white block" />
              </span>
              متاح
            </span>
          )}
        </div>

        {/* avatar overlapping the banner */}
        <div className="relative -mt-10 px-4 flex flex-col items-center text-center">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-card ${t.bg}`}>
              <Image
                src={t.photo}
                alt={t.name}
                width={80}
                height={80}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-soft grid place-items-center ${t.text}`}
              title={t.subject}
            >
              <SubjectIcon size={14} />
            </span>
          </div>

          <p className="mt-2.5 font-extrabold text-sm text-ink-900 line-clamp-1 max-w-full">{t.name}</p>
          <p className={`text-[11px] font-bold ${t.text} mt-0.5 line-clamp-1 max-w-full`}>{t.subject}</p>

          {/* rating row */}
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-600 font-extrabold">
            <Star size={11} fill="currentColor" />
            <span className="tabular-nums">{t.rating.toFixed(1)}</span>
            <span className="text-ink-300 mx-1">•</span>
            <Users size={11} className="text-ink-400" />
            <span className="text-ink-600 tabular-nums">{t.students.toLocaleString("ar-EG")}</span>
            <span className="text-ink-400 font-bold">طالب</span>
          </div>
        </div>

        {/* divider */}
        <div className="mx-4 mt-3 border-t border-dashed border-slate-200" />

        {/* preview courses */}
        <div className="px-4 pt-3 space-y-1.5">
          {previewCourses.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 bg-slate-50/70 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11px]"
            >
              <span className={`w-5 h-5 rounded-md ${t.bg} ${t.text} grid place-items-center shrink-0`}>
                <Library size={10} />
              </span>
              <span className="font-bold text-ink-800 truncate flex-1 min-w-0">{c.title}</span>
              <span className="font-extrabold text-brand-700 tabular-nums shrink-0">
                {formatCurrency(getCoursePrice(c))}
              </span>
            </div>
          ))}
          {stats.count > previewCourses.length && (
            <p className="text-[10px] text-ink-500 text-center font-bold">
              +{stats.count - previewCourses.length} كورس آخر داخل المدرس
            </p>
          )}
        </div>

        {/* stats footer (mini) */}
        <div className="px-4 pt-3 grid grid-cols-3 gap-1.5 text-center">
          <MiniStatChip label="من" value={formatCurrency(stats.min)} icon={Tag} />
          <MiniStatChip label="حتى" value={formatCurrency(stats.max)} icon={Sparkles} />
          <MiniStatChip label="متوسط" value={formatCurrency(stats.avg)} icon={BadgeCheck} />
        </div>

        {/* CTA */}
        <div className="p-4 mt-auto">
          <button
            onClick={onBrowse}
            className="relative w-full text-center text-xs font-extrabold rounded-xl py-2.5 overflow-hidden border border-brand-200 text-brand-700 transition group-hover:text-white group-hover:border-brand-600"
          >
            <span className="absolute inset-0 bg-gradient-to-l from-brand-700 to-brand-500 scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500" />
            <span className="relative inline-flex items-center justify-center gap-1.5">
              <Library size={13} />
              تصفّح الكورسات
              <ArrowLeft size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300" />
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function MiniStatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-lg px-1.5 py-1 leading-tight">
      <p className="text-[9px] text-ink-500 inline-flex items-center justify-center gap-0.5">
        <Icon size={9} />
        {label}
      </p>
      <p className="text-[11px] font-black text-ink-900 tabular-nums truncate">{value}</p>
    </div>
  );
}

/* ============================================================ *
 *                          EMPTY                               *
 * ============================================================ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
      <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-slate-100 text-ink-400">
        <Search size={22} />
      </span>
      <p className="mt-3 text-sm font-extrabold text-ink-900">لا يوجد مدرسون مطابقون لبحثك</p>
      <p className="text-[12px] text-ink-500 mt-1">جرّب كلمة أخرى أو غيّر فلتر المادة.</p>
      <button
        onClick={onReset}
        className="mt-3 text-[12px] font-extrabold text-brand-700 hover:underline"
      >
        مسح كل الفلاتر
      </button>
    </div>
  );
}

/* ============================================================ *
 *                  TEACHER CATALOG MODAL                       *
 * ============================================================ */
function TeacherCatalogModal({
  teacher,
  balance,
  onClose,
}: {
  teacher: Teacher | null;
  balance: number;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");

  // Reset search when modal closes/opens
  useEffect(() => {
    if (!teacher) setQ("");
  }, [teacher]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!teacher) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [teacher]);

  const courses = useMemo(() => {
    if (!teacher) return [];
    const list = getCoursesByTeacher(teacher.id);
    if (!q.trim()) return list;
    return list.filter((c) => c.title.includes(q.trim()));
  }, [teacher, q]);

  const stats = teacher ? teacherCatalogStats(teacher.id) : null;

  return (
    <AnimatePresence>
      {teacher && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-50 w-full sm:max-w-3xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className={`relative ${teacher.bg} p-5 overflow-hidden`}>
              <div className="pointer-events-none absolute -top-16 -left-10 w-48 h-48 rounded-full bg-white/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-white/20 blur-3xl" />
              <button
                onClick={onClose}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ink-700 hover:text-ink-900 grid place-items-center transition shadow-soft backdrop-blur z-10"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>

              <div className="relative flex items-center gap-4">
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ${teacher.ring} shrink-0`}>
                  <Image src={teacher.photo} alt={teacher.name} fill sizes="80px" className="object-cover" />
                  {teacher.online && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-black text-ink-900 truncate">{teacher.name}</p>
                  <p className={`text-[12px] font-bold ${teacher.text}`}>{teacher.subject}</p>
                  {teacher.bio && (
                    <p className="text-[11px] text-ink-700 mt-0.5 line-clamp-2">{teacher.bio}</p>
                  )}
                </div>
              </div>

              {/* mini stats */}
              {stats && (
                <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MiniStat icon={Library} label="كورسات" value={`${stats.count}`} />
                  <MiniStat icon={Star} label="تقييم" value={teacher.rating.toFixed(1)} />
                  <MiniStat icon={Users} label="طلاب" value={teacher.students.toLocaleString("ar-EG")} />
                  <MiniStat icon={Tag} label="من" value={formatCurrency(stats.min)} />
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ابحث في كورسات هذا المدرس..."
                  className="w-full bg-slate-50/70 border border-slate-100 rounded-xl pe-9 ps-3 py-2 text-[12px] focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
                />
              </div>
              <span className="text-[11px] text-ink-500 whitespace-nowrap">{courses.length} كورس</span>
            </div>

            {/* Courses list (scrollable) */}
            <div className="flex-1 overflow-y-auto p-4">
              {courses.length === 0 ? (
                <p className="text-center text-[12px] text-ink-500 bg-white rounded-xl border border-dashed border-slate-200 p-8">
                  لا توجد كورسات تطابق البحث.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((c, i) => (
                    <CatalogCourseCard
                      key={c.id}
                      c={c}
                      teacherId={teacher.id}
                      index={i}
                      balance={balance}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-ink-600">
                <Wallet size={13} className="text-amber-600" />
                <span>
                  رصيدك: <span className="font-extrabold text-ink-900">{formatCurrency(balance)}</span>
                </span>
              </div>
              <Link
                href={`/dashboard/buy?teacher=${teacher.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
              >
                <ShoppingCart size={13} />
                فتح صفحة الشراء
                <ArrowLeft size={12} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Library;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-white/60 px-2.5 py-1.5 flex items-center gap-2">
      <span className="w-7 h-7 rounded-lg bg-white text-brand-700 grid place-items-center shrink-0 shadow-sm">
        <Icon size={13} />
      </span>
      <div className="leading-tight">
        <p className="text-[9px] text-ink-500">{label}</p>
        <p className="text-[12px] font-black text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function CatalogCourseCard({
  c,
  teacherId,
  index,
  balance,
}: {
  c: Course;
  teacherId: string;
  index: number;
  balance: number;
}) {
  const price = getCoursePrice(c);
  const original = getCourseOriginalPrice(c);
  const off = original ? Math.round(((original - price) / original) * 100) : 0;
  const canAfford = balance >= price;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft overflow-hidden flex flex-col transition"
    >
      <div className="relative h-24 overflow-hidden">
        <CourseCover theme={c.theme} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white text-[10px] font-bold rounded-full px-2 py-0.5">
          <Clock size={10} />
          {c.duration}
        </span>
        {off > 0 && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
            <Tag size={10} />
            {off}%
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-[13px] font-extrabold text-ink-900 line-clamp-1">{c.title}</p>
        <p className="text-[10px] text-ink-500 mt-0.5 line-clamp-1">
          {c.lessons} درس · {c.grade}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <p className="text-base font-black text-ink-900 tabular-nums">{formatCurrency(price)}</p>
          {original && (
            <p className="text-[10px] text-ink-400 line-through tabular-nums">{formatCurrency(original)}</p>
          )}
        </div>
        <Link
          href={`/dashboard/buy?teacher=${teacherId}&course=${c.id}`}
          className={`mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-extrabold shadow-soft transition ${
            canAfford
              ? "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          {canAfford ? (
            <>
              <ShoppingCart size={11} />
              شراء الآن
            </>
          ) : (
            <>
              <Sparkles size={11} />
              عرض التفاصيل
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
