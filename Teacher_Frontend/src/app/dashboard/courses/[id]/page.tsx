"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ClipboardList,
  DollarSign,
  Edit3,
  GraduationCap,
  Plus,
  Trash2,
  Users,
  Video,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import {
  getCourse,
  removeLesson,
  upsertLesson,
  type Course,
  type Lesson,
} from "@/lib/data/courses";
import { listEnrollmentsByCourse } from "@/lib/data/students";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [enrollments, setEnrollments] = useState(0);

  useEffect(() => {
    const c = getCourse(params?.id ?? "");
    if (!c) {
      router.replace("/dashboard/courses");
      return;
    }
    setCourse(c);
    setEnrollments(listEnrollmentsByCourse(c.id).filter((e) => e.active).length);
  }, [params?.id, router]);

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

  const onRemove = (lid: string) => {
    if (!confirm("حذف هذه الحصة؟")) return;
    removeLesson(course.id, lid);
    setCourse({ ...course, lessons: course.lessons.filter((l) => l.id !== lid) });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={course.title}
        subtitle={`${course.grade} • ${course.lessons.length} حصة`}
        icon={BookOpen}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "الكورسات", href: "/dashboard/courses" },
          { label: course.title },
        ]}
      />

      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="relative h-40 sm:h-48 bg-slate-100">
          {course.image && (
            <Image
              src={course.image}
              alt={course.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 text-brand-700 rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-soft">
            <GraduationCap size={11} />
            {course.grade}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[13px] text-ink-700 leading-relaxed">{course.description}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <Stat icon={Calendar} label="يبدأ" value={new Date(course.startAt).toLocaleDateString("ar-EG")} />
            <Stat icon={DollarSign} label="إجمالي" value={`${course.priceTotal} ج`} />
            <Stat icon={DollarSign} label="سعر الحصة" value={`${course.priceLesson} ج`} />
            <Stat icon={Users} label="طلاب مشتركين" value={enrollments} />
          </div>
        </div>
      </div>

      {/* Add lesson */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
        <p className="text-sm font-extrabold text-ink-900 mb-2">إضافة حصة جديدة</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`مثال: الحصة ${course.lessons.length + 1} — عنوان الدرس`}
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

      {/* Lessons list */}
      <div>
        <p className="text-sm font-extrabold text-ink-900 mb-2">الحصص ({course.lessons.length})</p>
        {course.lessons.length === 0 ? (
          <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            لا توجد حصص بعد.
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
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/dashboard/manage/${course.id}/${l.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-extrabold transition"
                  >
                    <Edit3 size={11} />
                    إدارة
                  </Link>
                  <button
                    onClick={() => onRemove(l.id)}
                    className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition"
                    aria-label="حذف"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between bg-brand-50/60 border border-brand-100 rounded-2xl px-4 py-3">
        <p className="text-[12px] font-extrabold text-brand-800">
          لإدارة فيديوهات وامتحانات وملفات الحصص، افتح «إدارة الحصص».
        </p>
        <Link
          href={`/dashboard/manage/${course.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-brand-200 text-brand-700 hover:bg-brand-100 text-[11px] font-extrabold transition"
        >
          فتح
          <ArrowLeft size={11} />
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return (
    <div className="bg-slate-50/70 border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
      <Icon size={14} className="text-brand-600 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-ink-500 leading-none">{label}</p>
        <p className="text-[12px] font-extrabold text-ink-900 mt-1 truncate">{value}</p>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, count, label }: { icon: typeof BookOpen; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-50 rounded-full px-2 py-0.5 border border-slate-100">
      <Icon size={10} className="text-brand-600" />
      <span className="font-extrabold text-ink-700">{count}</span>
      <span>{label}</span>
    </span>
  );
}
