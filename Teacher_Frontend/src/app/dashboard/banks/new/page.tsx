"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Database, FileText, GraduationCap, Plus, Type } from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { upsertBank, type QuestionBank } from "@/lib/data/questionBanks";
import { GRADES } from "@/lib/data/governorates";
import { getSession } from "@/lib/session";

export default function NewBankPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState<string>("all");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (title.trim().length < 3) er.title = "اكتب اسماً مناسباً (3 أحرف فأكثر).";
    setErr(er);
    if (Object.keys(er).length > 0) return;

    setBusy(true);
    setTimeout(() => {
      const s = getSession();
      const id = `b-${Date.now()}`;
      const bank: QuestionBank = {
        id,
        teacherId: s?.teacherId ?? "t-ahmed",
        title: title.trim(),
        grade,
        description: description.trim() || undefined,
        createdAt: new Date().toISOString(),
        questions: [],
      };
      upsertBank(bank);
      router.push(`/dashboard/banks/${id}`);
    }, 400);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="إنشاء بنك أسئلة"
        subtitle="أنشئ بنكاً جديداً وستضيف الأسئلة من داخله بعد الحفظ."
        icon={Plus}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "بنوك الأسئلة", href: "/dashboard/banks" },
          { label: "جديد" },
        ]}
      />

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
        <Field label="اسم البنك" icon={Type} error={err.title} required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="بنك الجبر — أساسيات"
            className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
          />
        </Field>
        <Field label="الصف" icon={GraduationCap}>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900"
          >
            <option value="all">كل الصفوف</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="وصف مختصر" icon={FileText}>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ماذا يحتوي هذا البنك..."
            className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300 resize-y"
          />
        </Field>

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
            <Plus size={12} />
            {busy ? "جاري الإنشاء..." : "إنشاء البنك"}
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
  children,
}: {
  label: string;
  icon: typeof Database;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
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
