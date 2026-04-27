"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Check,
  DollarSign,
  FileText,
  GraduationCap,
  Hash,
  Image as ImgIcon,
  Plus,
  Type,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { upsertCourse, type Course, type Lesson } from "@/lib/data/courses";
import { GRADES } from "@/lib/data/governorates";
import { getSession } from "@/lib/session";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState<string>(GRADES[2]);
  const [lessonsCount, setLessonsCount] = useState(8);
  const [priceTotal, setPriceTotal] = useState<number | "">("");
  const [priceLesson, setPriceLesson] = useState<number | "">("");
  const [startAt, setStartAt] = useState("");
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=60"
  );
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (title.trim().length < 3) er.title = "اكتب عنواناً مناسباً (3 أحرف فأكثر).";
    if (description.trim().length < 10) er.description = "وصف مختصر لا يقل عن 10 أحرف.";
    if (!startAt) er.startAt = "اختر تاريخ بدء الكورس.";
    if (!priceTotal || Number(priceTotal) <= 0) er.priceTotal = "سعر الكورس الكلي مطلوب.";
    if (!priceLesson || Number(priceLesson) <= 0) er.priceLesson = "سعر الحصة مطلوب.";
    if (lessonsCount < 1) er.lessonsCount = "عدد الحصص 1 على الأقل.";
    setErr(er);
    if (Object.keys(er).length > 0) return;

    setBusy(true);
    setTimeout(() => {
      const session = getSession();
      const id = `c-${Date.now()}`;
      const lessons: Lesson[] = Array.from({ length: lessonsCount }).map((_, i) => ({
        id: `${id}-l${i + 1}`,
        title: `الحصة ${i + 1}`,
        videos: [],
        files: [],
        exams: [],
        createdAt: new Date().toISOString(),
      }));
      const course: Course = {
        id,
        teacherId: session?.teacherId ?? "t-ahmed",
        title: title.trim(),
        description: description.trim(),
        image,
        grade,
        priceTotal: Number(priceTotal),
        priceLesson: Number(priceLesson),
        startAt,
        lessons,
        createdAt: new Date().toISOString(),
      };
      upsertCourse(course);
      setBusy(false);
      setOk(true);
      setTimeout(() => router.push(`/dashboard/courses/${id}`), 600);
    }, 500);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="إضافة كورس جديد"
        subtitle="اختر اسم الكورس وعدد حصصه الابتدائي — يمكن إضافة حصص إضافية لاحقاً."
        icon={Plus}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "الكورسات", href: "/dashboard/courses" },
          { label: "جديد" },
        ]}
      />

      {ok && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-center gap-2 text-[12px] font-extrabold text-emerald-700">
          <Check size={14} />
          تم إنشاء الكورس — يتم تحويلك لصفحة التفاصيل...
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="اسم الكورس" icon={Type} error={err.title} required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="الرياضيات — الصف الثالث"
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
            />
          </Field>
          <Field label="الصف" icon={GraduationCap} required>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="عدد الحصص المبدئي" icon={Hash} error={err.lessonsCount} required>
            <input
              type="number"
              min={1}
              max={60}
              value={lessonsCount}
              onChange={(e) => setLessonsCount(Number(e.target.value) || 0)}
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900"
            />
          </Field>
          <Field label="تاريخ بدء الكورس" icon={Calendar} error={err.startAt} required>
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900"
            />
          </Field>
          <Field label="سعر الكورس الإجمالي (ج)" icon={DollarSign} error={err.priceTotal} required>
            <input
              type="number"
              min={0}
              value={priceTotal}
              onChange={(e) => setPriceTotal(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="1800"
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
            />
          </Field>
          <Field label="سعر الحصة الواحدة (ج)" icon={DollarSign} error={err.priceLesson} required>
            <input
              type="number"
              min={0}
              value={priceLesson}
              onChange={(e) => setPriceLesson(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="120"
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
            />
          </Field>
          <Field label="رابط صورة الكورس" icon={ImgIcon} className="sm:col-span-2">
            <input
              type="url"
              dir="ltr"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
            />
          </Field>
          <Field label="وصف الكورس" icon={FileText} error={err.description} required className="sm:col-span-2">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نبذة عن محتوى الكورس والمميزات..."
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300 resize-y"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={busy}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-extrabold shadow-soft transition ${
              busy
                ? "bg-slate-100 text-ink-400 cursor-not-allowed"
                : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
            }`}
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Plus size={12} />
                إنشاء الكورس
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  icon: typeof BookOpen;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-600 mr-1">*</span>}
      </label>
      <div
        className={`flex items-start gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${
          error ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
        }`}
      >
        <Icon size={14} className="text-ink-400 shrink-0 mt-0.5" />
        {children}
      </div>
      {error && (
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
