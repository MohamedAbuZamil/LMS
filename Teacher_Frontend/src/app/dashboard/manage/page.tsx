"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, ClipboardList, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses, type Course } from "@/lib/data/courses";
import { getSession } from "@/lib/session";

export default function ManagePickCoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const s = getSession();
    setCourses(listCourses(s?.teacherId));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="إدارة الحصص"
        subtitle="اختر الكورس ثم الحصة لتضيف الفيديوهات والملفات والامتحانات."
        icon={ClipboardList}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "إدارة الحصص" }]}
      />

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-sm font-extrabold text-ink-900">لا توجد كورسات بعد</p>
          <p className="text-[12px] text-ink-500 mt-1">أنشئ كورسك الأول من قسم الكورسات.</p>
          <Link
            href="/dashboard/courses/new"
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            إنشاء كورس
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/manage/${c.id}`}
              className="group bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft transition overflow-hidden flex flex-col"
            >
              <div className="relative h-32 bg-slate-100">
                {c.image && <Image src={c.image} alt={c.title} fill sizes="33vw" className="object-cover" />}
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 text-brand-700 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-soft">
                  <GraduationCap size={10} />
                  {c.grade}
                </span>
              </div>
              <div className="p-3 flex-1">
                <p className="text-[13px] font-extrabold text-ink-900 line-clamp-1">{c.title}</p>
                <p className="text-[11px] text-ink-500 mt-0.5 inline-flex items-center gap-1">
                  <BookOpen size={11} />
                  {c.lessons.length} حصة
                </p>
              </div>
              <div className="px-3 pb-3 flex items-center justify-end text-brand-700 text-[11px] font-extrabold">
                إدارة
                <ArrowLeft size={11} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
