"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  ListChecks,
  Target,
  Timer,
  Trophy,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  gradeAnswer,
  gradeLabel,
  questionTypeMeta,
  summarizeAnswers,
  type Answer,
  type EssayQuestion,
  type Grade,
  type McqQuestion,
  type Question,
  type TfQuestion,
} from "@/lib/data/questions";

export type AnswerKeyReviewProps = {
  mode: "exam" | "assignment";
  title: string;
  questions: Question[];
  answers: Record<string, Answer>;
  fullMark: number;
  durationMinutes: number;
  timeSpentSec?: number;
  submittedAt?: number;
  backHref: string;
};

type FilterKey = "all" | "correct" | "wrong" | "unanswered" | "pending";

const MODE_LABELS = {
  exam: { runnerType: "الاختبار", reviewTitle: "نموذج إجابة الاختبار" },
  assignment: { runnerType: "الواجب", reviewTitle: "نموذج إجابة الواجب" },
} as const;

export function AnswerKeyReview({
  mode,
  title,
  questions,
  answers,
  fullMark,
  durationMinutes,
  timeSpentSec,
  submittedAt,
  backHref,
}: AnswerKeyReviewProps) {
  const summary = useMemo(() => summarizeAnswers(questions, answers), [questions, answers]);
  const grade = gradeLabel(summary.percentage);

  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    return questions
      .map((q, i) => ({ q, i, g: gradeAnswer(q, answers[q.id]) }))
      .filter((x) => filter === "all" || x.g === filter);
  }, [questions, answers, filter]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <ReviewHeader title={title} mode={mode} backHref={backHref} submittedAt={submittedAt} />

      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-5 space-y-5">
        {/* Score Hero */}
        <ScoreHero
          summary={summary}
          grade={grade}
          fullMark={fullMark}
          durationMinutes={durationMinutes}
          timeSpentSec={timeSpentSec}
          totalQ={questions.length}
        />

        {/* Filter chips */}
        <FilterBar filter={filter} setFilter={setFilter} summary={summary} total={questions.length} />

        {/* Questions list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-ink-500 text-sm">
              لا توجد أسئلة مطابقة لهذا الفلتر.
            </div>
          ) : (
            filtered.map(({ q, i, g }, idx) => (
              <QuestionReviewCard
                key={q.id}
                question={q}
                index={i}
                animationDelay={idx * 0.03}
                studentAnswer={answers[q.id]}
                grade={g}
              />
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-center pt-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <ArrowRight size={14} />
            العودة إلى الكورس
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Header ───────────────── */
function ReviewHeader({
  title,
  mode,
  backHref,
  submittedAt,
}: {
  title: string;
  mode: "exam" | "assignment";
  backHref: string;
  submittedAt?: number;
}) {
  const labels = MODE_LABELS[mode];
  const dateStr = submittedAt ? new Date(submittedAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }) : null;
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-700 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/40 rounded-xl px-3 py-2 transition"
        >
          <ArrowRight size={13} />
          العودة
        </Link>

        <div className="flex-1 hidden md:flex justify-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 text-emerald-800 rounded-xl px-3 py-2 max-w-[560px]">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-tight font-extrabold">
              {labels.reviewTitle} - يمكنك مراجعة كل سؤال مع الإجابة الصحيحة والشرح.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ms-auto">
          <div className="hidden lg:block text-right border-r border-slate-100 pr-3 leading-tight max-w-[260px]">
            <p className="text-sm font-black text-ink-900 truncate">{title}</p>
            {dateStr ? (
              <p className="text-[10px] text-ink-500">تاريخ التسليم: {dateStr}</p>
            ) : (
              <p className="text-[10px] text-ink-500">{labels.reviewTitle}</p>
            )}
          </div>
          <span className="hidden lg:inline-grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft">
            <Trophy size={16} />
          </span>
        </div>
      </div>

      {/* mobile title */}
      <div className="lg:hidden max-w-[1200px] mx-auto px-3 sm:px-6 pb-3 -mt-1">
        <p className="text-sm font-black text-ink-900 truncate">{title}</p>
        <p className="text-[10px] text-ink-500">{labels.reviewTitle}</p>
      </div>
    </header>
  );
}

/* ───────────────── Score Hero ───────────────── */
function ScoreHero({
  summary,
  grade,
  fullMark,
  durationMinutes,
  timeSpentSec,
  totalQ,
}: {
  summary: ReturnType<typeof summarizeAnswers>;
  grade: ReturnType<typeof gradeLabel>;
  fullMark: number;
  durationMinutes: number;
  timeSpentSec?: number;
  totalQ: number;
}) {
  const pct = summary.percentage;
  // SVG ring
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  const accent = grade.accent;
  const ringClass =
    accent === "emerald"
      ? "stroke-emerald-500"
      : accent === "sky"
      ? "stroke-sky-500"
      : accent === "amber"
      ? "stroke-amber-500"
      : accent === "rose"
      ? "stroke-rose-500"
      : "stroke-brand-500";
  const accentBg =
    accent === "emerald"
      ? "from-emerald-500 to-emerald-700"
      : accent === "sky"
      ? "from-sky-500 to-sky-700"
      : accent === "amber"
      ? "from-amber-500 to-amber-700"
      : accent === "rose"
      ? "from-rose-500 to-rose-700"
      : "from-brand-500 to-brand-700";

  const minSpent = timeSpentSec ? Math.max(1, Math.round(timeSpentSec / 60)) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-5 sm:p-7"
    >
      {/* decorative blob */}
      <div className={`absolute -top-12 -left-12 w-56 h-56 rounded-full bg-gradient-to-br ${accentBg} opacity-10 blur-3xl pointer-events-none`} />

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
        {/* Ring */}
        <div className="relative w-[140px] h-[140px] mx-auto">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={R} className="stroke-slate-100" strokeWidth="10" fill="none" />
            <motion.circle
              cx="60"
              cy="60"
              r={R}
              className={ringClass}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${C}` }}
              animate={{ strokeDasharray: `${dash} ${C}` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div className="leading-tight">
              <p className="text-3xl font-black text-ink-900 tabular-nums">{pct}%</p>
              <p className={`text-[11px] font-extrabold ${grade.cls}`}>{grade.label}</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <HeroStat
            icon={CheckCircle2}
            label="إجابات صحيحة"
            value={`${summary.correct}`}
            sub={`من ${summary.correct + summary.wrong}`}
            cls="text-emerald-700"
            bg="bg-emerald-50"
          />
          <HeroStat icon={XCircle} label="إجابات خاطئة" value={`${summary.wrong}`} sub="" cls="text-rose-700" bg="bg-rose-50" />
          <HeroStat icon={CircleAlert} label="بدون إجابة" value={`${summary.unanswered}`} sub="" cls="text-amber-700" bg="bg-amber-50" />
          <HeroStat
            icon={Info}
            label="بانتظار التصحيح"
            value={`${summary.pending}`}
            sub={summary.pending > 0 ? "مقالي" : ""}
            cls="text-sky-700"
            bg="bg-sky-50"
          />
        </div>
      </div>

      {/* Bottom score line */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScoreLine
          icon={Award}
          label="الدرجة المُحتسبة (تلقائياً)"
          value={`${summary.earnedAutoMarks} / ${summary.autoMarks}`}
          hint={summary.pendingMarks > 0 ? `+${summary.pendingMarks} درجة بانتظار تصحيح المقالي` : "جميع الأسئلة تم تصحيحها"}
        />
        <ScoreLine icon={ListChecks} label="الدرجة الكاملة" value={`${fullMark} درجة`} hint={`${totalQ} سؤال`} />
        <ScoreLine
          icon={Timer}
          label="الوقت"
          value={minSpent ? `${minSpent} دقيقة` : `${durationMinutes} دقيقة`}
          hint={minSpent ? `من أصل ${durationMinutes} دقيقة` : "الوقت الكامل"}
        />
      </div>
    </motion.section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  sub,
  cls,
  bg,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  cls: string;
  bg: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
      <span className={`w-10 h-10 rounded-xl ${bg} ${cls} grid place-items-center shrink-0`}>
        <Icon size={18} />
      </span>
      <div className="text-right">
        <p className="text-[11px] text-ink-500">{label}</p>
        <p className={`text-xl font-black tabular-nums ${cls}`}>
          {value} {sub && <span className="text-[10px] text-ink-400 font-normal">{sub}</span>}
        </p>
      </div>
    </div>
  );
}

function ScoreLine({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3 flex items-start gap-3">
      <span className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-brand-600 grid place-items-center shrink-0">
        <Icon size={16} />
      </span>
      <div className="text-right leading-tight">
        <p className="text-[11px] text-ink-500">{label}</p>
        <p className="text-sm font-black text-ink-900 mt-0.5">{value}</p>
        {hint && <p className="text-[10px] text-ink-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

/* ───────────────── Filter Bar ───────────────── */
function FilterBar({
  filter,
  setFilter,
  summary,
  total,
}: {
  filter: FilterKey;
  setFilter: (f: FilterKey) => void;
  summary: ReturnType<typeof summarizeAnswers>;
  total: number;
}) {
  const items: { k: FilterKey; label: string; count: number; cls: string; activeCls: string }[] = [
    { k: "all", label: "كل الأسئلة", count: total, cls: "text-ink-700 border-slate-200 bg-white", activeCls: "border-brand-500 bg-brand-50/60 text-brand-800" },
    { k: "correct", label: "صحيحة", count: summary.correct, cls: "text-emerald-700 border-emerald-200 bg-white", activeCls: "border-emerald-500 bg-emerald-50/60 text-emerald-800" },
    { k: "wrong", label: "خاطئة", count: summary.wrong, cls: "text-rose-700 border-rose-200 bg-white", activeCls: "border-rose-500 bg-rose-50/60 text-rose-800" },
    { k: "unanswered", label: "بدون إجابة", count: summary.unanswered, cls: "text-amber-700 border-amber-200 bg-white", activeCls: "border-amber-500 bg-amber-50/60 text-amber-800" },
    { k: "pending", label: "بانتظار التصحيح", count: summary.pending, cls: "text-sky-700 border-sky-200 bg-white", activeCls: "border-sky-500 bg-sky-50/60 text-sky-800" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-2 overflow-x-auto">
      <span className="text-[11px] text-ink-500 px-2 shrink-0">تصفية:</span>
      {items.map((it) => {
        const active = filter === it.k;
        return (
          <button
            key={it.k}
            onClick={() => setFilter(it.k)}
            className={`shrink-0 inline-flex items-center gap-2 text-xs font-extrabold rounded-xl border-2 px-3 py-1.5 transition ${
              active ? it.activeCls : it.cls
            } hover:border-brand-300`}
          >
            {it.label}
            <span className={`text-[10px] tabular-nums rounded-full px-1.5 py-0.5 ${active ? "bg-white/60" : "bg-slate-100"}`}>{it.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────── Question Card ───────────────── */
function QuestionReviewCard({
  question,
  index,
  studentAnswer,
  grade,
  animationDelay,
}: {
  question: Question;
  index: number;
  studentAnswer?: Answer;
  grade: Grade;
  animationDelay: number;
}) {
  const meta = questionTypeMeta(question.type);
  const gradeMeta = gradeUiMeta(grade);
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: animationDelay }}
      className={`bg-white rounded-2xl border-2 overflow-hidden ${gradeMeta.borderCls}`}
    >
      {/* Header */}
      <header className={`px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-b border-slate-100 ${gradeMeta.bandCls}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-grid place-items-center w-8 h-8 rounded-xl text-white shrink-0 ${gradeMeta.iconBgCls}`}>
            <gradeMeta.icon size={16} />
          </span>
          <div className="leading-tight min-w-0">
            <p className="text-[10px] text-ink-500">السؤال {index + 1}</p>
            <p className={`text-xs font-extrabold ${gradeMeta.textCls}`}>{gradeMeta.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border px-2 py-0.5 ${meta.chip}`}>
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-ink-700 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
            <Award size={10} />
            {question.marks} درجة
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label="طي/توسيع"
            className="text-ink-400 hover:text-ink-700 transition"
          >
            <ChevronDown size={16} className={`transition-transform ${expanded ? "" : "-rotate-90"}`} />
          </button>
        </div>
      </header>

      {/* Body */}
      {expanded && (
        <div className="px-4 sm:px-5 py-4 space-y-4">
          <div>
            <p className="text-[11px] text-ink-500 font-bold mb-1.5">نص السؤال</p>
            <p className="text-base font-black text-ink-900 leading-relaxed">{question.prompt}</p>
            {question.type === "essay" && (question as EssayQuestion).hint && (
              <p className="mt-1 text-[12px] text-ink-500">{(question as EssayQuestion).hint}</p>
            )}
          </div>

          {question.type === "mcq" && (
            <McqReview q={question} answer={studentAnswer} />
          )}
          {question.type === "tf" && <TfReview q={question} answer={studentAnswer} />}
          {question.type === "essay" && <EssayReview q={question} answer={studentAnswer} />}

          {question.type !== "essay" && question.explanation && (
            <ExplanationBox text={question.explanation} />
          )}
        </div>
      )}
    </motion.article>
  );
}

function gradeUiMeta(g: Grade) {
  switch (g) {
    case "correct":
      return {
        label: "إجابة صحيحة",
        icon: CheckCircle2,
        borderCls: "border-emerald-200",
        bandCls: "bg-emerald-50/40",
        iconBgCls: "bg-emerald-500",
        textCls: "text-emerald-700",
      };
    case "wrong":
      return {
        label: "إجابة خاطئة",
        icon: XCircle,
        borderCls: "border-rose-200",
        bandCls: "bg-rose-50/40",
        iconBgCls: "bg-rose-500",
        textCls: "text-rose-700",
      };
    case "pending":
      return {
        label: "بانتظار تصحيح المعلم",
        icon: Info,
        borderCls: "border-sky-200",
        bandCls: "bg-sky-50/40",
        iconBgCls: "bg-sky-500",
        textCls: "text-sky-700",
      };
    case "unanswered":
    default:
      return {
        label: "لم تتم الإجابة",
        icon: HelpCircle,
        borderCls: "border-amber-200",
        bandCls: "bg-amber-50/40",
        iconBgCls: "bg-amber-500",
        textCls: "text-amber-700",
      };
  }
}

/* ───────────────── MCQ Review ───────────────── */
function McqReview({ q, answer }: { q: McqQuestion; answer?: Answer }) {
  const studentId = answer?.type === "mcq" ? answer.optionId : undefined;
  const letters = ["A", "B", "C", "D", "E", "F"];
  return (
    <div className="space-y-2">
      {q.options.map((opt, i) => {
        const isCorrect = opt.id === q.correctOptionId;
        const isStudent = opt.id === studentId;
        const wrongPick = isStudent && !isCorrect;
        const baseCls = isCorrect
          ? "border-emerald-400 bg-emerald-50/70"
          : wrongPick
          ? "border-rose-400 bg-rose-50/70"
          : "border-slate-200 bg-white";
        return (
          <div
            key={opt.id}
            className={`flex items-center justify-end gap-3 px-4 py-3 rounded-xl border-2 transition ${baseCls}`}
          >
            <p
              className={`flex-1 font-bold text-sm font-mono ${
                isCorrect ? "text-emerald-900" : wrongPick ? "text-rose-900 line-through" : "text-ink-700"
              }`}
            >
              {letters[i]}. {opt.label}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {isStudent && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border px-1.5 py-0.5 ${
                    isCorrect ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-rose-100 border-rose-300 text-rose-800"
                  }`}
                >
                  إجابتك
                </span>
              )}
              {isCorrect && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border bg-emerald-100 border-emerald-300 text-emerald-800 px-1.5 py-0.5">
                  <Check size={10} /> الصحيحة
                </span>
              )}
              <span
                className={`w-6 h-6 rounded-full border-2 grid place-items-center shrink-0 ${
                  isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : wrongPick ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300 bg-white"
                }`}
              >
                {isCorrect ? <Check size={12} /> : wrongPick ? <X size={12} /> : null}
              </span>
            </div>
          </div>
        );
      })}
      {!studentId && (
        <UnansweredBanner />
      )}
    </div>
  );
}

/* ───────────────── TF Review ───────────────── */
function TfReview({ q, answer }: { q: TfQuestion; answer?: Answer }) {
  const studentVal = answer?.type === "tf" ? answer.value : undefined;
  const choices: { v: boolean; label: string; icon: LucideIcon }[] = [
    { v: true, label: "صح", icon: Check },
    { v: false, label: "خطأ", icon: X },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {choices.map((c) => {
        const isCorrect = c.v === q.correctValue;
        const isStudent = studentVal === c.v;
        const wrongPick = isStudent && !isCorrect;
        const Icon = c.icon;
        const cls = isCorrect
          ? "border-emerald-400 bg-emerald-50/70"
          : wrongPick
          ? "border-rose-400 bg-rose-50/70"
          : "border-slate-200 bg-white";
        return (
          <div
            key={c.label}
            className={`px-5 py-5 rounded-2xl border-2 flex items-center gap-3 justify-center ${cls}`}
          >
            <span
              className={`w-10 h-10 rounded-xl grid place-items-center text-white shrink-0 ${
                isCorrect ? "bg-emerald-500" : wrongPick ? "bg-rose-500" : "bg-slate-300"
              }`}
            >
              <Icon size={20} />
            </span>
            <span className={`text-base font-black ${isCorrect ? "text-emerald-900" : wrongPick ? "text-rose-900" : "text-ink-700"}`}>
              {c.label}
            </span>
            <div className="flex flex-col items-center gap-1">
              {isStudent && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border px-1.5 py-0.5 ${
                    isCorrect ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-rose-100 border-rose-300 text-rose-800"
                  }`}
                >
                  إجابتك
                </span>
              )}
              {isCorrect && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border bg-emerald-100 border-emerald-300 text-emerald-800 px-1.5 py-0.5">
                  الصحيحة
                </span>
              )}
            </div>
          </div>
        );
      })}
      {studentVal === undefined && (
        <div className="sm:col-span-2">
          <UnansweredBanner />
        </div>
      )}
    </div>
  );
}

/* ───────────────── Essay Review ───────────────── */
function EssayReview({ q, answer }: { q: EssayQuestion; answer?: Answer }) {
  const text = answer?.type === "essay" ? answer.text.trim() : "";
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-6 h-6 rounded-lg bg-slate-100 text-ink-700 grid place-items-center">
            <FileText size={12} />
          </span>
          <p className="text-[11px] text-ink-500 font-bold">إجابتك</p>
        </div>
        {text ? (
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-sm text-ink-800 leading-relaxed whitespace-pre-line" dir="auto">
            {text}
          </div>
        ) : (
          <UnansweredBanner />
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
            <BookOpen size={12} />
          </span>
          <p className="text-[11px] text-emerald-700 font-bold">الإجابة النموذجية</p>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-950 leading-relaxed whitespace-pre-line" dir="auto">
          {q.modelAnswer}
        </div>
      </div>

      {q.rubric && q.rubric.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 grid place-items-center">
              <Target size={12} />
            </span>
            <p className="text-[11px] text-sky-700 font-bold">معايير التصحيح</p>
          </div>
          <ul className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-2">
            {q.rubric.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-sky-950">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-2 text-[12px] bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2">
        <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
        <p>
          الأسئلة المقالية يتم تصحيحها يدوياً من قِبَل المعلم. ستظهر الدرجة في صفحة الكورس فور انتهاء التصحيح.
        </p>
      </div>
    </div>
  );
}

/* ───────────────── Shared ───────────────── */
function ExplanationBox({ text }: { text: string }) {
  return (
    <div className="bg-brand-50/60 border border-brand-200 rounded-xl p-4 flex items-start gap-2.5">
      <span className="w-7 h-7 rounded-lg bg-brand-500 text-white grid place-items-center shrink-0">
        <Lightbulb size={14} />
      </span>
      <div className="leading-relaxed text-[13px]">
        <p className="text-brand-800 font-extrabold mb-0.5">شرح الإجابة</p>
        <p className="text-brand-950/90">{text}</p>
      </div>
    </div>
  );
}

function UnansweredBanner() {
  return (
    <div className="flex items-center gap-2 text-[12px] bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2">
      <CircleAlert size={14} className="text-amber-600 shrink-0" />
      لم تقم بالإجابة على هذا السؤال.
    </div>
  );
}
