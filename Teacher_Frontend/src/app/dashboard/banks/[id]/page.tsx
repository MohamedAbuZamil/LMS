"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  CircleDot,
  Database,
  Edit3,
  FileText,
  GraduationCap,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import {
  getBank,
  QUESTION_TYPES,
  removeQuestion,
  upsertQuestion,
  type MCQChoice,
  type Question,
  type QuestionBank,
  type QuestionType,
} from "@/lib/data/questionBanks";

export default function BankEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const b = getBank(params?.id ?? "");
    if (!b) {
      router.replace("/dashboard/banks");
      return;
    }
    setBank(b);
  }, [params?.id, router]);

  const reload = () => {
    if (!bank) return;
    const fresh = getBank(bank.id);
    if (fresh) setBank(fresh);
  };

  if (!bank) return null;

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (q: Question) => {
    setEditing(q);
    setOpen(true);
  };

  const onDelete = (qId: string) => {
    if (!confirm("حذف هذا السؤال؟")) return;
    removeQuestion(bank.id, qId);
    reload();
  };

  const handleSave = (q: Question) => {
    upsertQuestion(bank.id, q);
    setOpen(false);
    reload();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={bank.title}
        subtitle={`بنك أسئلة • ${bank.questions.length} سؤال`}
        icon={Database}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "بنوك الأسئلة", href: "/dashboard/banks" },
          { label: bank.title },
        ]}
        actions={
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة سؤال
          </button>
        }
      />

      {/* Bank meta */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-3 py-1 text-[11px] font-extrabold w-fit">
          <GraduationCap size={11} />
          {bank.grade === "all" ? "كل الصفوف" : bank.grade}
        </span>
        {bank.description && <p className="text-[12px] text-ink-500 flex-1">{bank.description}</p>}
      </div>

      {/* Questions list */}
      {bank.questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700">
            <ListChecks size={22} />
          </span>
          <p className="mt-3 text-sm font-extrabold text-ink-900">لا توجد أسئلة بعد</p>
          <p className="text-[12px] text-ink-500 mt-1">أضف أول سؤال واختر نوعه (اختيار متعدد افتراضياً).</p>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة سؤال
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {bank.questions.map((q, i) => (
            <QuestionRow key={q.id} q={q} index={i + 1} onEdit={() => onEdit(q)} onDelete={() => onDelete(q.id)} />
          ))}
        </ul>
      )}

      <QuestionEditorModal
        open={open}
        existing={editing}
        bankId={bank.id}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

/* ====================== Question Row ====================== */
function QuestionRow({
  q,
  index,
  onEdit,
  onDelete,
}: {
  q: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeMeta = QUESTION_TYPES.find((t) => t.key === q.type)!;
  return (
    <li className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center font-black text-[13px] shrink-0">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className="inline-flex items-center bg-accent-50 text-accent-700 border border-accent-100 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
              {typeMeta.label}
            </span>
            <span className="text-[10px] text-ink-500">{q.points} درجة</span>
          </div>
          <p className="mt-1.5 text-[13px] font-extrabold text-ink-900">{q.text}</p>
          {q.type === "mcq" && (
            <ul className="mt-2 space-y-1">
              {q.choices.map((c) => (
                <li
                  key={c.id}
                  className={`text-[12px] flex items-center gap-2 ${
                    c.isCorrect ? "text-emerald-700 font-extrabold" : "text-ink-700"
                  }`}
                >
                  {c.isCorrect ? <Check size={12} /> : <CircleDot size={10} />}
                  {c.text}
                </li>
              ))}
            </ul>
          )}
          {q.type === "truefalse" && (
            <p className="mt-1.5 text-[12px] text-emerald-700 font-extrabold inline-flex items-center gap-1">
              <Check size={12} /> الإجابة الصحيحة: {q.correct ? "صح" : "خطأ"}
            </p>
          )}
          {q.type === "essay" && q.modelAnswer && (
            <p className="mt-1.5 text-[12px] text-ink-600 bg-slate-50 rounded-lg px-2 py-1.5 line-clamp-2">
              <span className="font-extrabold text-ink-700">نموذج الإجابة: </span>
              {q.modelAnswer}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-600 hover:text-brand-700 transition"
            aria-label="تعديل"
          >
            <Edit3 size={11} />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition"
            aria-label="حذف"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </li>
  );
}

/* ====================== Editor Modal ====================== */
function QuestionEditorModal({
  open,
  existing,
  bankId,
  onClose,
  onSave,
}: {
  open: boolean;
  existing: Question | null;
  bankId: string;
  onClose: () => void;
  onSave: (q: Question) => void;
}) {
  const [type, setType] = useState<QuestionType>("mcq");
  const [text, setText] = useState("");
  const [points, setPoints] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [choices, setChoices] = useState<MCQChoice[]>([
    { id: "c1", text: "", isCorrect: true },
    { id: "c2", text: "", isCorrect: false },
    { id: "c3", text: "", isCorrect: false },
    { id: "c4", text: "", isCorrect: false },
  ]);
  const [tfCorrect, setTfCorrect] = useState(true);
  const [modelAnswer, setModelAnswer] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  // Hydrate state when modal opens
  useEffect(() => {
    if (!open) return;
    if (existing) {
      setType(existing.type);
      setText(existing.text);
      setPoints(existing.points);
      setExplanation(existing.explanation ?? "");
      if (existing.type === "mcq") setChoices(existing.choices);
      if (existing.type === "truefalse") setTfCorrect(existing.correct);
      if (existing.type === "essay") setModelAnswer(existing.modelAnswer ?? "");
    } else {
      setType("mcq");
      setText("");
      setPoints(1);
      setExplanation("");
      setChoices([
        { id: "c1", text: "", isCorrect: true },
        { id: "c2", text: "", isCorrect: false },
        { id: "c3", text: "", isCorrect: false },
        { id: "c4", text: "", isCorrect: false },
      ]);
      setTfCorrect(true);
      setModelAnswer("");
    }
    setErr({});
  }, [open, existing]);

  const toggleCorrect = (id: string) => {
    setChoices((arr) => arr.map((c) => ({ ...c, isCorrect: c.id === id })));
  };

  const addChoice = () => {
    setChoices((arr) => [...arr, { id: `c-${Date.now()}`, text: "", isCorrect: false }]);
  };

  const removeChoice = (id: string) => {
    setChoices((arr) => (arr.length <= 2 ? arr : arr.filter((c) => c.id !== id)));
  };

  const submit = () => {
    const er: Record<string, string> = {};
    if (text.trim().length < 3) er.text = "اكتب نص السؤال.";
    if (!points || points < 1) er.points = "الدرجة 1 على الأقل.";

    if (type === "mcq") {
      const filled = choices.filter((c) => c.text.trim());
      if (filled.length < 2) er.choices = "أضف اختيارين على الأقل.";
      if (!filled.some((c) => c.isCorrect)) er.choices = "حدّد الإجابة الصحيحة.";
    }
    setErr(er);
    if (Object.keys(er).length > 0) return;

    const base = {
      id: existing?.id ?? `q-${Date.now()}`,
      bankId,
      text: text.trim(),
      points: Number(points),
      explanation: explanation.trim() || undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    let q: Question;
    if (type === "mcq") {
      q = {
        ...base,
        type: "mcq",
        choices: choices
          .filter((c) => c.text.trim())
          .map((c) => ({ ...c, text: c.text.trim() })),
      };
    } else if (type === "truefalse") {
      q = { ...base, type: "truefalse", correct: tfCorrect };
    } else {
      q = { ...base, type: "essay", modelAnswer: modelAnswer.trim() || undefined };
    }
    onSave(q);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink-900/60 backdrop-blur-sm p-0 sm:p-4"
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
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-brand-50/80 to-white">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                  <ListChecks size={16} />
                </span>
                <p className="text-sm font-black text-ink-900">
                  {existing ? "تعديل السؤال" : "إضافة سؤال جديد"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 grid place-items-center rounded-xl text-ink-500 hover:bg-slate-100 hover:text-ink-900 transition"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Type tabs */}
              <div>
                <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">نوع السؤال</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUESTION_TYPES.map((t) => {
                    const active = type === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setType(t.key)}
                        className={`text-right p-2.5 rounded-xl border-2 transition ${
                          active ? "border-brand-500 bg-brand-50/60" : "border-slate-200 bg-white hover:border-brand-200"
                        }`}
                      >
                        <p className={`text-[12px] font-extrabold ${active ? "text-brand-800" : "text-ink-900"}`}>
                          {t.label}
                        </p>
                        <p className="text-[10px] text-ink-500 mt-0.5">{t.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text */}
              <div>
                <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">
                  نص السؤال <span className="text-rose-600 mr-1">*</span>
                </p>
                <textarea
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="اكتب نص السؤال هنا..."
                  className={`w-full bg-slate-50/70 border rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:ring-2 focus:ring-brand-100 ${
                    err.text ? "border-rose-300" : "border-slate-200 focus:border-brand-300"
                  }`}
                />
                {err.text && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                    <AlertTriangle size={11} /> {err.text}
                  </p>
                )}
              </div>

              {/* Points */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">الدرجة</p>
                  <input
                    type="number"
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value) || 1)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              {/* Type-specific */}
              {type === "mcq" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-extrabold text-ink-700">الاختيارات (انقر على الدائرة لتحديد الإجابة الصحيحة)</p>
                    <button
                      type="button"
                      onClick={addChoice}
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-700 hover:underline"
                    >
                      <Plus size={11} /> إضافة اختيار
                    </button>
                  </div>
                  <div className="space-y-2">
                    {choices.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCorrect(c.id)}
                          className={`w-7 h-7 rounded-full grid place-items-center border-2 shrink-0 transition ${
                            c.isCorrect
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 text-slate-400 hover:border-brand-300"
                          }`}
                          aria-label="إجابة صحيحة"
                        >
                          {c.isCorrect ? <Check size={12} /> : <CircleDot size={10} />}
                        </button>
                        <input
                          type="text"
                          value={c.text}
                          onChange={(e) =>
                            setChoices((arr) =>
                              arr.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x))
                            )
                          }
                          placeholder={`الاختيار ${i + 1}`}
                          className="flex-1 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeChoice(c.id)}
                          disabled={choices.length <= 2}
                          className="w-8 h-8 grid place-items-center rounded-lg bg-slate-50 text-ink-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="حذف"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {err.choices && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                      <AlertTriangle size={11} /> {err.choices}
                    </p>
                  )}
                </div>
              )}

              {type === "truefalse" && (
                <div>
                  <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">الإجابة الصحيحة</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTfCorrect(true)}
                      className={`p-3 rounded-xl border-2 text-[13px] font-extrabold transition ${
                        tfCorrect ? "border-emerald-500 bg-emerald-50/60 text-emerald-700" : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"
                      }`}
                    >
                      صح
                    </button>
                    <button
                      type="button"
                      onClick={() => setTfCorrect(false)}
                      className={`p-3 rounded-xl border-2 text-[13px] font-extrabold transition ${
                        !tfCorrect ? "border-rose-500 bg-rose-50/60 text-rose-700" : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"
                      }`}
                    >
                      خطأ
                    </button>
                  </div>
                </div>
              )}

              {type === "essay" && (
                <div>
                  <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">نموذج الإجابة (اختياري)</p>
                  <textarea
                    rows={3}
                    value={modelAnswer}
                    onChange={(e) => setModelAnswer(e.target.value)}
                    placeholder="إجابة نموذجية لمساعدتك في التصحيح..."
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-y"
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <p className="text-[11px] font-extrabold text-ink-700 mb-1.5 inline-flex items-center gap-1">
                  <FileText size={11} />
                  شرح الإجابة (اختياري)
                </p>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="ملاحظات/شرح يظهر للطالب بعد التصحيح."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-y"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={submit}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[12px] font-extrabold shadow-soft transition"
              >
                <Check size={12} />
                حفظ السؤال
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
