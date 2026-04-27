"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Edit3, GraduationCap, Layers, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listBanks, removeBank, type QuestionBank } from "@/lib/data/questionBanks";
import { getSession } from "@/lib/session";

export default function BanksPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);

  useEffect(() => {
    const s = getSession();
    setBanks(listBanks(s?.teacherId));
  }, []);

  const onDelete = (id: string) => {
    if (!confirm("هل تريد حذف هذا البنك بكل أسئلته؟")) return;
    removeBank(id);
    setBanks((arr) => arr.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="بنوك الأسئلة"
        subtitle="نظّم أسئلتك في بنوك حسب الموضوع أو الصف ثم اربطها بأي امتحان."
        icon={Database}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "بنوك الأسئلة" }]}
        actions={
          <Link
            href="/dashboard/banks/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إنشاء بنك
          </Link>
        }
      />

      {banks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700">
            <Database size={22} />
          </span>
          <p className="mt-3 text-sm font-extrabold text-ink-900">لا توجد بنوك بعد</p>
          <p className="text-[12px] text-ink-500 mt-1">أنشئ أول بنك لتبدأ في إضافة الأسئلة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {banks.map((b) => {
            const counts = countsByType(b);
            return (
              <article
                key={b.id}
                className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft transition p-4 flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft shrink-0">
                    <Database size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-extrabold text-ink-900 truncate">{b.title}</p>
                    <p className="text-[10px] text-ink-500 mt-0.5 inline-flex items-center gap-1">
                      <GraduationCap size={10} />
                      {b.grade === "all" ? "كل الصفوف" : b.grade}
                    </p>
                  </div>
                </div>
                {b.description && (
                  <p className="text-[11px] text-ink-500 mt-2 line-clamp-2">{b.description}</p>
                )}

                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <Pill label={`${b.questions.length} سؤال`} icon={Layers} />
                  {counts.mcq > 0 && <Pill label={`${counts.mcq} اختيار`} />}
                  {counts.tf > 0 && <Pill label={`${counts.tf} صح/خطأ`} />}
                  {counts.essay > 0 && <Pill label={`${counts.essay} مقالي`} />}
                </div>

                <div className="mt-auto pt-3 flex items-center gap-2">
                  <Link
                    href={`/dashboard/banks/${b.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-brand-200"
                  >
                    <Edit3 size={11} />
                    فتح وإضافة أسئلة
                  </Link>
                  <button
                    onClick={() => onDelete(b.id)}
                    className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-rose-200"
                    aria-label="حذف"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function countsByType(b: QuestionBank) {
  return {
    mcq: b.questions.filter((q) => q.type === "mcq").length,
    tf: b.questions.filter((q) => q.type === "truefalse").length,
    essay: b.questions.filter((q) => q.type === "essay").length,
  };
}

function Pill({ label, icon: Icon }: { label: string; icon?: typeof Layers }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
}
