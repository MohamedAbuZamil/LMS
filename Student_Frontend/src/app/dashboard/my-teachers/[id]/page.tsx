"use client";
import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserSquare2, Search, X, ArrowDownUp, BookOpen, Star, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { getTeacher, getCoursesByTeacher } from "@/lib/data/teachers";

type SortKey = "default" | "progress" | "name";

export default function TeacherCoursesPage() {
  const params = useParams<{ id: string }>();
  const teacher = getTeacher(params.id);
  if (!teacher) return notFound();
  const courses = getCoursesByTeacher(teacher.id);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("default");

  const filtered = useMemo(() => {
    const q = query.trim();
    const arr = courses.filter((c) => !q || c.title.includes(q));
    return [...arr].sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title, "ar");
      if (sort === "progress") return b.progress - a.progress;
      return 0;
    });
  }, [courses, query, sort]);

  const completed = courses.filter((c) => c.progress >= 100).length;
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100).length;
  const avgProgress = Math.round(
    courses.reduce((a, b) => a + b.progress, 0) / Math.max(courses.length, 1)
  );

  return (
    <div className="max-w-[1400px] mx-auto relative">
      {/* decorative blobs */}
      <span className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl animate-blob -z-10" />
      <span className="pointer-events-none absolute top-40 left-0 w-64 h-64 rounded-full bg-fuchsia-200/30 blur-3xl animate-blob -z-10" style={{ animationDelay: "2.5s" }} />

      <PageHeader
        title={`كورسات الأستاذ ${teacher.name.replace(/^أ\.?\s*/, "")}`}
        icon={UserSquare2}
        crumbs={[
          { label: "الرئيسية", href: "/dashboard" },
          { label: "مدرسيني", href: "/dashboard/my-teachers" },
          { label: teacher.name, href: `/dashboard/my-teachers/${teacher.id}` },
          { label: "كورسات الأستاذ" },
        ]}
      />

      {/* teacher info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-4 sm:p-5 mb-5"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          {/* photo */}
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden ${teacher.bg} ring-4 ring-white shadow-soft`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover object-top" />
            {teacher.online && (
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>

          {/* info */}
          <div className="flex-1 min-w-0 text-center sm:text-right">
            <p className="font-extrabold text-base sm:text-lg text-ink-900 truncate">{teacher.name}</p>
            <p className={`text-xs sm:text-sm mt-1 ${teacher.text}`}>مدرس {teacher.subject}</p>
            {teacher.bio && (
              <p className="text-[11px] text-ink-500 mt-1.5 line-clamp-1">{teacher.bio}</p>
            )}
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-3 text-[11px]">
              <span className={`inline-flex items-center gap-1 font-extrabold ${teacher.text}`}>
                <BookOpen size={12} />
                {teacher.courses} كورس
              </span>
              <span className="inline-flex items-center gap-1 text-ink-600">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                {teacher.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1 text-ink-600">
                <Users size={12} />
                {teacher.students.toLocaleString("ar-EG")} طالب
              </span>
            </div>
          </div>

          {/* progress summary on right edge */}
          <div className="hidden md:grid grid-cols-3 gap-3 shrink-0">
            <Mini label="مكتمل" value={completed} fg="text-emerald-700" bg="bg-emerald-50" />
            <Mini label="قيد التقدم" value={inProgress} fg="text-brand-700" bg="bg-brand-50" />
            <Mini label="متوسط التقدم" value={`${avgProgress}%`} fg="text-amber-700" bg="bg-amber-50" />
          </div>
        </div>
      </motion.div>

      {/* search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink-400" />
          <input
            type="search"
            placeholder="ابحث في كورسات الأستاذ"
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

        <div className="relative">
          <ArrowDownUp size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-ink-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none bg-white border border-slate-200 rounded-xl ps-9 pe-4 py-2.5 text-sm font-bold text-ink-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition w-full sm:w-auto cursor-pointer"
          >
            <option value="default">ترتيب حسب</option>
            <option value="progress">الأكثر تقدماً</option>
            <option value="name">حسب الاسم</option>
          </select>
        </div>
      </div>

      {/* count */}
      <div className="mb-3 text-[11px] text-ink-500">
        <span className="font-extrabold text-ink-800">{filtered.length}</span> من{" "}
        <span className="font-extrabold text-ink-800">{courses.length}</span> كورس
      </div>

      {/* courses grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 grid place-items-center text-brand-600 mb-3">
            <Search size={22} />
          </div>
          <p className="text-sm font-extrabold text-ink-800">لا يوجد كورسات مطابقة</p>
          <p className="text-xs text-ink-500 mt-1">جرّب كلمة أخرى</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" } }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              >
                <CourseCard c={c} teacherId={teacher.id} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Mini({ label, value, fg, bg }: { label: string; value: number | string; fg: string; bg: string }) {
  return (
    <div className={`rounded-xl ${bg} px-3 py-2 text-center min-w-[80px]`}>
      <p className={`text-base font-extrabold ${fg} leading-none`}>{value}</p>
      <p className="text-[10px] text-ink-500 mt-1">{label}</p>
    </div>
  );
}
