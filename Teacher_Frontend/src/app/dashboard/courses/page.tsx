"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  GraduationCap,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses, removeCourse, type Course } from "@/lib/data/courses";
import { getSession } from "@/lib/session";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const s = getSession();
    setCourses(listCourses(s?.teacherId));
  }, []);

  const onDelete = (id: string) => {
    if (!confirm("هل تريد حذف هذا الكورس؟")) return;
    removeCourse(id);
    setCourses((arr) => arr.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="الكورسات"
        subtitle="كل الكورسات الخاصة بك — أضف كورساً جديداً أو عدّل القائمة."
        icon={BookOpen}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الكورسات" }]}
        actions={
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة كورس
          </Link>
        }
      />

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700">
            <BookOpen size={22} />
          </span>
          <p className="mt-3 text-sm font-extrabold text-ink-900">لا توجد كورسات بعد</p>
          <p className="text-[12px] text-ink-500 mt-1">أنشئ كورسك الأول لتبدأ إضافة الحصص والطلاب.</p>
          <Link
            href="/dashboard/courses/new"
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة كورس
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <article
              key={c.id}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft transition overflow-hidden flex flex-col"
            >
              <div className="relative h-36 bg-slate-100">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(min-width:1024px) 33vw, 50vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 text-brand-700 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-soft">
                  <GraduationCap size={10} />
                  {c.grade}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-[14px] font-extrabold text-ink-900 line-clamp-1">{c.title}</h3>
                <p className="text-[11px] text-ink-500 mt-1 line-clamp-2">{c.description}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <Info icon={BookOpen} label={`${c.lessons.length} حصة`} />
                  <Info icon={Calendar} label={new Date(c.startAt).toLocaleDateString("ar-EG")} />
                  <Info icon={DollarSign} label={`${c.priceTotal} ج`} />
                  <Info icon={Clock} label={`${c.priceLesson} ج/حصة`} />
                </div>

                <div className="mt-auto pt-3 flex items-center gap-2">
                  <Link
                    href={`/dashboard/courses/${c.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-brand-200"
                  >
                    <Edit3 size={11} />
                    تعديل / حصص
                  </Link>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-rose-200"
                    aria-label="حذف"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-50 text-ink-700 rounded-lg px-2 py-1 border border-slate-100">
      <Icon size={11} className="text-brand-600" />
      <span className="font-bold">{label}</span>
    </span>
  );
}
