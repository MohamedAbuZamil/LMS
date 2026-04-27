"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, LayoutGroup, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  UserSquare2,
  Search,
  LayoutGrid,
  List,
  X,
  Users,
  BookOpen,
  Sparkles,
  ArrowDownUp,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TeacherCard } from "@/components/dashboard/TeacherCard";
import { teachers } from "@/lib/data/teachers";
import { fadeUp, popIn, stagger, viewportOnce } from "@/lib/motion";

const ALL = "كل المواد" as const;
type SortKey = "courses" | "name" | "rating";

export default function MyTeachersPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>(ALL);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortKey>("courses");

  const subjects = useMemo(
    () => [ALL, ...Array.from(new Set(teachers.map((t) => t.subject)))],
    []
  );

  // Filter only by search query (used for subject chip counts)
  const queryMatched = useMemo(() => {
    const q = query.trim();
    if (!q) return teachers;
    return teachers.filter((t) => t.name.includes(q) || t.subject.includes(q));
  }, [query]);

  // Live count per subject given current search
  const subjectCounts = useMemo(() => {
    const map: Record<string, number> = { [ALL]: queryMatched.length };
    for (const t of queryMatched) {
      map[t.subject] = (map[t.subject] ?? 0) + 1;
    }
    return map;
  }, [queryMatched]);

  const filtered = useMemo(() => {
    const arr = queryMatched.filter((t) => subject === ALL || t.subject === subject);
    return [...arr].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "ar");
      if (sort === "rating") return b.rating - a.rating;
      return b.courses - a.courses;
    });
  }, [queryMatched, subject, sort]);

  // Auto-reset to ALL if current subject has no results in current search
  useEffect(() => {
    if (subject !== ALL && (subjectCounts[subject] ?? 0) === 0) {
      setSubject(ALL);
    }
  }, [subject, subjectCounts]);

  const topId = useMemo(() => {
    return teachers.reduce((best, t) => (t.courses > best.courses ? t : best), teachers[0]).id;
  }, []);

  const totals = {
    teachers: teachers.length,
    courses: teachers.reduce((a, b) => a + b.courses, 0),
    subjects: new Set(teachers.map((t) => t.subject)).size,
    students: teachers.reduce((a, b) => a + b.students, 0),
  };

  return (
    <div className="max-w-[1400px] mx-auto relative">
      {/* decorative blobs */}
      <span className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl animate-blob -z-10" />
      <span className="pointer-events-none absolute top-40 left-0 w-64 h-64 rounded-full bg-fuchsia-200/30 blur-3xl animate-blob -z-10" style={{ animationDelay: "2.5s" }} />

      <PageHeader
        title="مدرسيني"
        icon={UserSquare2}
        crumbs={[
          { label: "الرئيسية", href: "/dashboard" },
          { label: "مدرسيني" },
        ]}
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink-400" />
              <input
                type="search"
                placeholder="ابحث عن مدرس"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pe-9 ps-9 py-2.5 text-sm placeholder:text-ink-400 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setQuery("")}
                    aria-label="مسح"
                    className="absolute top-1/2 -translate-y-1/2 left-2 w-6 h-6 rounded-full hover:bg-slate-100 grid place-items-center text-ink-400 hover:text-ink-700"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* sort */}
            <div className="relative">
              <ArrowDownUp size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none bg-white border border-slate-200 rounded-xl ps-9 pe-4 py-2.5 text-sm font-bold text-ink-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition w-full sm:w-auto cursor-pointer"
              >
                <option value="courses">الأكثر كورسات</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="name">حسب الاسم</option>
              </select>
            </div>
          </div>
        }
      />

      {/* hero stats */}
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
      >
        <StatTile icon={UserSquare2} label="عدد المدرسين" value={totals.teachers} bg="bg-brand-50" fg="text-brand-700" />
        <StatTile icon={BookOpen} label="إجمالي الكورسات" value={totals.courses} bg="bg-emerald-50" fg="text-emerald-700" />
        <StatTile icon={Sparkles} label="عدد المواد" value={totals.subjects} bg="bg-amber-50" fg="text-amber-700" />
        <StatTile icon={Users} label="إجمالي الطلاب" value={totals.students} bg="bg-pink-50" fg="text-pink-700" />
      </motion.div>

      {/* subject chips */}
      <div className="mb-4 -mx-3 sm:mx-0 px-3 sm:px-0 pb-2 overflow-x-auto no-scrollbar">
        <LayoutGroup id="subj-chips">
          <div className="inline-flex gap-2 min-w-min">
            {subjects.map((s) => {
              const active = subject === s;
              const count = subjectCounts[s] ?? 0;
              const disabled = count === 0 && s !== ALL;
              return (
                <button
                  key={s}
                  onClick={() => !disabled && setSubject(s)}
                  disabled={disabled}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition border bg-white
                    ${active
                      ? "text-white border-transparent"
                      : disabled
                        ? "text-ink-300 border-slate-100 cursor-not-allowed"
                        : "text-ink-700 border-slate-200 hover:border-brand-300 hover:text-brand-700"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="subj-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-l from-brand-600 to-brand-500 shadow-soft"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{s}</span>
                  <span
                    className={`relative inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-extrabold
                      ${active ? "bg-white/25 text-white" : disabled ? "bg-slate-50 text-ink-300" : "bg-slate-100 text-ink-600"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* view toggle + count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-ink-500">
          <span className="font-extrabold text-ink-800">{filtered.length}</span> من{" "}
          <span className="font-extrabold text-ink-800">{teachers.length}</span> مدرس
        </span>
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 relative">
          <ToggleBtn active={view === "grid"} onClick={() => setView("grid")} icon={LayoutGrid} label="شبكة" />
          <ToggleBtn active={view === "list"} onClick={() => setView("list")} icon={List} label="قائمة" />
        </div>
      </div>

      {/* empty state */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 grid place-items-center text-brand-600 mb-3">
            <Search size={22} />
          </div>
          <p className="text-sm font-extrabold text-ink-800">لا يوجد مدرسين مطابقين لبحثك</p>
          <p className="text-xs text-ink-500 mt-1">جرّب كلمة أخرى أو غيّر الفلتر</p>
          <button
            onClick={() => {
              setQuery("");
              setSubject(ALL);
            }}
            className="mt-4 text-xs font-bold text-brand-700 hover:underline"
          >
            مسح كل الفلاتر
          </button>
        </motion.div>
      ) : (
        <LayoutGroup>
          <motion.div
            layout
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" } }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                >
                  <TeacherCard t={t} view={view} featured={t.id === topId} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  bg,
  fg,
}: {
  icon: typeof UserSquare2;
  label: string;
  value: number;
  bg: string;
  fg: string;
}) {
  return (
    <motion.div
      variants={popIn}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 flex items-center gap-3 transition"
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl ${bg} ${fg} grid place-items-center`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg sm:text-xl font-extrabold text-ink-900 leading-none">
          <Counter to={value} />
        </p>
        <p className="text-[10px] sm:text-[11px] text-ink-500 mt-1.5 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("ar-EG"));
  useEffect(() => {
    if (inView) {
      const c = animate(count, to, { duration: 1.4, ease: "easeOut" });
      return () => c.stop();
    }
  }, [inView, to, count]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

function ToggleBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative w-9 h-8 rounded-lg grid place-items-center transition ${active ? "text-brand-700" : "text-ink-400 hover:text-ink-700"}`}
    >
      {active && (
        <motion.span
          layoutId="view-toggle"
          className="absolute inset-0 bg-brand-50 ring-1 ring-brand-200 rounded-lg -z-10"
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      <Icon size={15} />
    </button>
  );
}
