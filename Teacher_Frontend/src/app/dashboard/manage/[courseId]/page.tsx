"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Edit3,
  FileText,
  Plus,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { getCourse, upsertLesson, type Course, type Lesson } from "@/lib/data/courses";

export default function ManagePickLessonPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const c = getCourse(params?.courseId ?? "");
    if (!c) {
      router.replace("/dashboard/manage");
      return;
    }
    setCourse(c);
  }, [params?.courseId, router]);

  if (!course) return null;

  const addLesson = () => {
    const title = newTitle.trim() || `الحصة ${course.lessons.length + 1}`;
    const lesson: Lesson = {
      id: `l-${Date.now()}`,
      title,
      videos: [],
      files: [],
      exams: [],
      createdAt: new Date().toISOString(),
    };
    upsertLesson(course.id, lesson);
    setCourse({ ...course, lessons: [...course.lessons, lesson] });
    setNewTitle("");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`إدارة: ${course.title}`}
        subtitle="اختر الحصة التي تريد إدارتها"
        icon={ClipboardList}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "إدارة الحصص", href: "/dashboard/manage" },
          { label: course.title },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
        <p className="text-sm font-extrabold text-ink-900 mb-2">إضافة حصة سريعة</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`الحصة ${course.lessons.length + 1} — العنوان`}
            className="flex-1 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={addLesson}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[12px] font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة
          </button>
        </div>
      </div>

      {course.lessons.length === 0 ? (
        <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          لا توجد حصص في هذا الكورس بعد.
        </p>
      ) : (
        <ul className="space-y-2">
          {course.lessons.map((l, i) => (
            <li
              key={l.id}
              className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 flex items-center gap-3 hover:border-brand-200 transition"
            >
              <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-black text-sm shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-extrabold text-ink-900 truncate">{l.title}</p>
                <div className="flex items-center flex-wrap gap-1.5 mt-1.5 text-[10px] text-ink-500">
                  <Chip icon={Video} count={l.videos.length} label="فيديو" />
                  <Chip icon={FileText} count={l.files.length} label="ملف" />
                  <Chip icon={ClipboardList} count={l.exams.length} label="امتحان" />
                </div>
              </div>
              <Link
                href={`/dashboard/manage/${course.id}/${l.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[11px] font-extrabold shadow-soft transition"
              >
                <Edit3 size={11} />
                إدارة
                <ArrowLeft size={11} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ icon: Icon, count, label }: { icon: typeof Video; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-50 rounded-full px-2 py-0.5 border border-slate-100">
      <Icon size={10} className="text-brand-600" />
      <span className="font-extrabold text-ink-700">{count}</span>
      <span>{label}</span>
    </span>
  );
}
