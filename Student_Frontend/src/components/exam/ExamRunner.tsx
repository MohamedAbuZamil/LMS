"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  FileText,
  ListChecks,
  Logs,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Timer,
  X,
  XCircle,
} from "lucide-react";
import {
  questionTypeMeta,
  saveAttempt,
  type Answer,
  type EssayQuestion,
  type McqQuestion,
  type Question,
  type TfQuestion,
} from "@/lib/data/questions";

export type ExamRunnerMode = "exam" | "assignment";

export type ExamRunnerProps = {
  mode: ExamRunnerMode;
  title: string;
  durationMinutes: number;
  questions: Question[];
  fullMark: number;
  backHref: string;
  runnerId: string; // unique storage key, e.g. "exam:<id>"
  reviewHref: string; // url of the answer-key review page
};

const MODE_LABELS = {
  exam: { runnerType: "الاختبار", finishCta: "إنهاء الاختبار", exitCta: "خروج من الاختبار", submittedTitle: "تم إرسال إجابات الاختبار" },
  assignment: { runnerType: "الواجب", finishCta: "تسليم الواجب", exitCta: "خروج من الواجب", submittedTitle: "تم تسليم الواجب" },
} as const;

export function ExamRunner({ mode, title, durationMinutes, questions, fullMark, backHref, runnerId, reviewHref }: ExamRunnerProps) {
  const router = useRouter();
  const labels = MODE_LABELS[mode];

  /* ─── state ─── */
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [seen, setSeen] = useState<Record<string, boolean>>(() => ({ [questions[0]?.id ?? ""]: true }));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [jumpInput, setJumpInput] = useState("1");
  const [showFinish, setShowFinish] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ─── timer ─── */
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  useEffect(() => {
    if (submitted) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [submitted]);

  /* ─── persist on submit ─── */
  const persistedRef = useRef(false);
  useEffect(() => {
    if (!submitted || persistedRef.current) return;
    persistedRef.current = true;
    const timeSpentSec = Math.max(0, durationMinutes * 60 - secondsLeft);
    saveAttempt(runnerId, {
      answers,
      timeSpentSec,
      submittedAt: Date.now(),
    });
  }, [submitted, answers, secondsLeft, durationMinutes, runnerId]);

  /* ─── derived ─── */
  const current = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const totalQ = questions.length;

  /* ─── handlers ─── */
  const setAnswer = (qid: string, a: Answer) => setAnswers((m) => ({ ...m, [qid]: a }));
  const clearAnswer = (qid: string) =>
    setAnswers((m) => {
      const n = { ...m };
      delete n[qid];
      return n;
    });
  const toggleBookmark = (qid: string) => setBookmarks((m) => ({ ...m, [qid]: !m[qid] }));

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= totalQ) return;
    setCurrentIdx(idx);
    const id = questions[idx].id;
    setSeen((s) => ({ ...s, [id]: true }));
    setJumpInput(String(idx + 1));
  };
  const goPrev = () => goTo(currentIdx - 1);
  const goNext = () => goTo(currentIdx + 1);

  /* ─── status palette ─── */
  type CellStatus = "answered" | "bookmarked" | "seen" | "unseen";
  const statusOf = (q: Question): CellStatus => {
    if (answers[q.id]) return "answered";
    if (bookmarks[q.id]) return "bookmarked";
    if (seen[q.id]) return "seen";
    return "unseen";
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* ──────── Top header ──────── */}
      <Header
        title={title}
        mode={mode}
        secondsLeft={secondsLeft}
        totalQ={totalQ}
        fullMark={fullMark}
        onExit={() => setShowExit(true)}
        onFinish={() => setShowFinish(true)}
      />

      {/* ──────── Stats row ──────── */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 mt-3">
        <StatsRow
          questionTypeLabel={primaryQuestionTypeLabel(questions)}
          durationMinutes={durationMinutes}
          fullMark={fullMark}
        />
      </div>

      {/* ──────── Main body ──────── */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 mt-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <main>
          {current && (
            <QuestionPanel
              key={current.id}
              question={current}
              index={currentIdx}
              total={totalQ}
              answer={answers[current.id]}
              bookmarked={!!bookmarks[current.id]}
              onAnswer={(a) => setAnswer(current.id, a)}
              onClear={() => clearAnswer(current.id)}
              onToggleBookmark={() => toggleBookmark(current.id)}
              onPrev={goPrev}
              onNext={goNext}
              jumpInput={jumpInput}
              setJumpInput={setJumpInput}
              onJump={() => {
                const n = Number(jumpInput);
                if (!Number.isNaN(n)) goTo(n - 1);
              }}
            />
          )}

          {/* Bottom info cards */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuestionTypesCard questions={questions} />
            <InstructionsCard mode={mode} />
          </div>
        </main>

        <Palette
          questions={questions}
          currentIdx={currentIdx}
          statusOf={statusOf}
          onSelect={goTo}
          onShowAll={() => setShowAll(true)}
        />
      </div>

      {/* ──────── Modals ──────── */}
      <FinishModal
        open={showFinish}
        mode={mode}
        answeredCount={answeredCount}
        totalQ={totalQ}
        bookmarkedCount={Object.values(bookmarks).filter(Boolean).length}
        onClose={() => setShowFinish(false)}
        onConfirm={() => {
          setShowFinish(false);
          setSubmitted(true);
        }}
      />
      <ExitModal
        open={showExit}
        labels={labels}
        onClose={() => setShowExit(false)}
        onConfirm={() => router.push(backHref)}
      />
      <AllQuestionsModal
        open={showAll}
        questions={questions}
        statusOf={statusOf}
        currentIdx={currentIdx}
        onClose={() => setShowAll(false)}
        onSelect={(i) => {
          goTo(i);
          setShowAll(false);
        }}
      />
      <SubmittedModal
        open={submitted}
        title={labels.submittedTitle}
        answered={answeredCount}
        total={totalQ}
        backHref={backHref}
        reviewHref={reviewHref}
        timeUp={secondsLeft <= 0}
      />
    </div>
  );
}

/* ───────────────────── Header ───────────────────── */
function Header({
  title,
  mode,
  secondsLeft,
  totalQ,
  fullMark,
  onExit,
  onFinish,
}: {
  title: string;
  mode: ExamRunnerMode;
  secondsLeft: number;
  totalQ: number;
  fullMark: number;
  onExit: () => void;
  onFinish: () => void;
}) {
  const labels = MODE_LABELS[mode];
  const lowTime = secondsLeft < 60 * 5; // last 5 minutes
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
        {/* Right: actions */}
        <div className="flex items-center gap-2 order-1">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-700 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50/50 rounded-xl px-3 py-2 transition"
          >
            <ArrowRight size={13} />
            {labels.exitCta}
          </button>
        </div>

        {/* Center: warning */}
        <div className="hidden md:flex flex-1 items-center justify-center order-2">
          <div className="inline-flex items-start gap-2 bg-rose-50/80 border border-rose-200 text-rose-800 rounded-xl px-3 py-2 max-w-[560px]">
            <ShieldAlert size={14} className="text-rose-600 mt-0.5 shrink-0" />
            <div className="text-[11px] leading-tight">
              <p className="font-extrabold">تنبيه</p>
              <p className="text-rose-700/90">يحظر تصوير أو تسجيل أسئلة الاختبار، ويعرّضك للمساءلة القانونية.</p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="order-3">
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${lowTime ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"}`}>
            <span className={`w-7 h-7 rounded-lg grid place-items-center ${lowTime ? "bg-rose-100 text-rose-700" : "bg-brand-100 text-brand-700"}`}>
              <Timer size={14} />
            </span>
            <div className="text-right leading-tight">
              <p className="text-[10px] text-ink-500">الوقت المتبقي</p>
              <p className={`text-sm font-black tabular-nums ${lowTime ? "text-rose-700 animate-pulse" : "text-ink-900"}`}>{fmtTimer(secondsLeft)}</p>
            </div>
          </div>
        </div>

        {/* Left: title + finish */}
        <div className="flex items-center gap-3 order-4 ms-auto">
          <button
            onClick={onFinish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Check size={14} />
            {labels.finishCta}
          </button>
          <div className="hidden lg:block text-right border-r border-slate-100 pr-3 leading-tight max-w-[260px]">
            <p className="text-sm font-black text-ink-900 truncate">{title}</p>
            <p className="text-[10px] text-ink-500">الدرجة الكلية: {fullMark} درجة · عدد الأسئلة: {totalQ} سؤال</p>
          </div>
          <span className="hidden lg:inline-grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
            <Sparkles size={16} />
          </span>
        </div>
      </div>
      {/* Mobile: title row */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-3 sm:px-6 pb-3 -mt-1">
        <p className="text-sm font-black text-ink-900 truncate">{title}</p>
        <p className="text-[10px] text-ink-500">الدرجة الكلية: {fullMark} درجة · عدد الأسئلة: {totalQ} سؤال</p>
      </div>
    </header>
  );
}

function fmtTimer(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function primaryQuestionTypeLabel(qs: Question[]): string {
  const counts = qs.reduce(
    (m, q) => ({ ...m, [q.type]: (m[q.type] || 0) + 1 }),
    {} as Record<string, number>
  );
  const types = Object.keys(counts) as Question["type"][];
  if (types.length === 1) return questionTypeMeta(types[0]).label;
  return "متنوع";
}

/* ───────────────────── Stats row ───────────────────── */
function StatsRow({
  questionTypeLabel,
  durationMinutes,
  fullMark,
}: {
  questionTypeLabel: string;
  durationMinutes: number;
  fullMark: number;
}) {
  const items = [
    { icon: FileText, label: "نوع الأسئلة", value: questionTypeLabel, accent: "violet" as const },
    { icon: Clock, label: "المدة", value: `${durationMinutes} دقيقة`, accent: "sky" as const },
    { icon: ListChecks, label: "الدرجة", value: `${fullMark} درجة`, accent: "emerald" as const },
  ];
  const accentMap = {
    violet: { bg: "bg-violet-100", fg: "text-violet-700" },
    sky: { bg: "bg-sky-100", fg: "text-sky-700" },
    emerald: { bg: "bg-emerald-100", fg: "text-emerald-700" },
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((it, i) => {
        const a = accentMap[it.accent];
        const Icon = it.icon;
        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
            className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-3"
          >
            <span className={`w-10 h-10 rounded-xl ${a.bg} ${a.fg} grid place-items-center shrink-0`}>
              <Icon size={18} />
            </span>
            <div className="text-right">
              <p className="text-[11px] text-ink-500">{it.label}</p>
              <p className="text-sm font-extrabold text-ink-900 mt-0.5">{it.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────────────── Question panel ───────────────────── */
function QuestionPanel({
  question,
  index,
  total,
  answer,
  bookmarked,
  onAnswer,
  onClear,
  onToggleBookmark,
  onPrev,
  onNext,
  jumpInput,
  setJumpInput,
  onJump,
}: {
  question: Question;
  index: number;
  total: number;
  answer?: Answer;
  bookmarked: boolean;
  onAnswer: (a: Answer) => void;
  onClear: () => void;
  onToggleBookmark: () => void;
  onPrev: () => void;
  onNext: () => void;
  jumpInput: string;
  setJumpInput: (s: string) => void;
  onJump: () => void;
}) {
  const meta = questionTypeMeta(question.type);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
    >
      {/* header */}
      <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg border px-2.5 py-1.5 transition ${
              bookmarked
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-white border-slate-200 text-ink-600 hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50/40"
            }`}
            aria-pressed={bookmarked}
          >
            {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {bookmarked ? "تم الإشارة للسؤال" : "إشارة للسؤال"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border px-2 py-0.5 ${meta.chip}`}>
            {meta.label}
          </span>
          <div className="inline-flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-100 px-2 py-1">
            <button onClick={onPrev} disabled={index === 0} className="p-0.5 disabled:opacity-30 hover:text-brand-700">
              <ChevronRight size={14} />
            </button>
            <span className="text-[11px] font-extrabold text-ink-700 select-none">
              السؤال {index + 1} من {total}
            </span>
            <button onClick={onNext} disabled={index === total - 1} className="p-0.5 disabled:opacity-30 hover:text-brand-700">
              <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* prompt */}
      <div className="px-4 sm:px-5 py-5">
        <p className="text-base sm:text-lg font-black text-ink-900 leading-relaxed">{question.prompt}</p>
        {question.type === "essay" && (question as EssayQuestion).hint && (
          <p className="mt-1 text-[12px] text-ink-500">{(question as EssayQuestion).hint}</p>
        )}

        {/* renderer */}
        <div className="mt-5">
          {question.type === "mcq" && <McqRenderer q={question} answer={answer} onAnswer={onAnswer} />}
          {question.type === "tf" && <TfRenderer q={question} answer={answer} onAnswer={onAnswer} />}
          {question.type === "essay" && <EssayRenderer q={question} answer={answer} onAnswer={onAnswer} />}
        </div>

        {/* clear answer */}
        <div className="mt-5">
          <button
            onClick={onClear}
            disabled={!answer}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-600 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-700 rounded-lg px-2.5 py-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={12} />
            إلغاء الاختيار
          </button>
        </div>
      </div>

      {/* footer nav */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight size={14} />
          السؤال السابق
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="inline-flex items-center gap-2 self-center"
        >
          <span className="text-[11px] text-ink-500">انتقل إلى سؤال</span>
          <input
            type="number"
            min={1}
            max={total}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            className="w-16 text-center font-extrabold tabular-nums text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </form>

        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السؤال التالي
          <ArrowLeft size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────────────── Renderers ───────────────────── */
function McqRenderer({ q, answer, onAnswer }: { q: McqQuestion; answer?: Answer; onAnswer: (a: Answer) => void }) {
  const selected = answer?.type === "mcq" ? answer.optionId : undefined;
  const letters = ["A", "B", "C", "D", "E", "F"];
  return (
    <div className="space-y-2.5">
      {q.options.map((opt, i) => {
        const active = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => onAnswer({ type: "mcq", optionId: opt.id })}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
            whileHover={{ x: -2 }}
            className={`w-full text-right px-4 py-3.5 rounded-xl border-2 transition flex items-center justify-end gap-3 ${
              active
                ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-100"
                : "border-slate-200 hover:border-brand-200 hover:bg-slate-50"
            }`}
          >
            <p className={`flex-1 font-bold text-sm font-mono ${active ? "text-brand-900" : "text-ink-800"}`}>
              {letters[i]}. {opt.label}
            </p>
            <span
              className={`relative w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 transition ${
                active ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function TfRenderer({ q: _q, answer, onAnswer }: { q: TfQuestion; answer?: Answer; onAnswer: (a: Answer) => void }) {
  const selected = answer?.type === "tf" ? answer.value : undefined;
  const choices = [
    { value: true, label: "صح", icon: Check, accent: "emerald" as const },
    { value: false, label: "خطأ", icon: X, accent: "rose" as const },
  ];
  const accentMap = {
    emerald: { active: "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-100", iconBg: "bg-emerald-500" },
    rose: { active: "border-rose-500 bg-rose-50/70 ring-2 ring-rose-100", iconBg: "bg-rose-500" },
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {choices.map((c, i) => {
        const active = selected === c.value;
        const Icon = c.icon;
        const a = accentMap[c.accent];
        return (
          <motion.button
            key={c.label}
            type="button"
            onClick={() => onAnswer({ type: "tf", value: c.value })}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`px-5 py-6 rounded-2xl border-2 transition flex items-center gap-4 justify-center ${
              active ? a.active : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <span className={`w-12 h-12 rounded-xl grid place-items-center text-white shadow-soft ${active ? a.iconBg : "bg-slate-300"}`}>
              <Icon size={24} />
            </span>
            <span className={`text-lg font-black ${active ? "text-ink-900" : "text-ink-700"}`}>{c.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function EssayRenderer({ q, answer, onAnswer }: { q: EssayQuestion; answer?: Answer; onAnswer: (a: Answer) => void }) {
  const text = answer?.type === "essay" ? answer.text : "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = q.minWords ?? 0;
  const meets = wordCount >= minWords;
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => onAnswer({ type: "essay", text: e.target.value })}
        placeholder="اكتب إجابتك هنا..."
        rows={8}
        className="w-full text-sm leading-relaxed bg-white border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-y"
        dir="auto"
      />
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-ink-500">
          عدد الكلمات: <span className={`font-extrabold ${meets ? "text-emerald-700" : "text-ink-700"}`}>{wordCount}</span>
          {minWords > 0 && (
            <span className="text-ink-400"> / حد أدنى {minWords}</span>
          )}
        </span>
        {minWords > 0 && (
          <span className={`inline-flex items-center gap-1 font-extrabold ${meets ? "text-emerald-700" : "text-amber-700"}`}>
            {meets ? <Check size={11} /> : <CircleAlert size={11} />}
            {meets ? "الحد الأدنى مكتمل" : `أكمل ${minWords - wordCount} كلمة على الأقل`}
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── Palette ───────────────────── */
function Palette({
  questions,
  currentIdx,
  statusOf,
  onSelect,
  onShowAll,
}: {
  questions: Question[];
  currentIdx: number;
  statusOf: (q: Question) => "answered" | "bookmarked" | "seen" | "unseen";
  onSelect: (i: number) => void;
  onShowAll: () => void;
}) {
  return (
    <aside className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-fit lg:sticky lg:top-[88px]">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">الأسئلة ({questions.length})</p>
      </div>

      {/* legend */}
      <div className="px-4 py-3 border-b border-slate-100 grid grid-cols-1 gap-1.5 text-[11px]">
        <Legend dot="bg-emerald-500" label="تمت الإجابة" />
        <Legend dot="bg-rose-500" label="تمت المشاهدة بدون إجابة" />
        <Legend dot="bg-amber-500" label="سؤال مُعلّم" />
        <Legend dot="bg-slate-300" label="لم تتم المشاهدة" />
      </div>

      {/* grid */}
      <div className="p-3 grid grid-cols-4 gap-2 max-h-[440px] overflow-y-auto">
        {questions.map((q, i) => {
          const st = statusOf(q);
          const isCurrent = i === currentIdx;
          const cls =
            st === "answered"
              ? "bg-emerald-500 text-white border-emerald-600"
              : st === "bookmarked"
              ? "bg-amber-500 text-white border-amber-600"
              : st === "seen"
              ? "bg-rose-500 text-white border-rose-600"
              : "bg-slate-100 text-ink-500 border-slate-200";
          return (
            <motion.button
              key={q.id}
              onClick={() => onSelect(i)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-square rounded-lg border-2 text-sm font-extrabold tabular-nums transition ${cls} ${
                isCurrent ? "ring-2 ring-brand-500 ring-offset-2" : ""
              }`}
              aria-label={`السؤال ${i + 1}`}
            >
              {i + 1}
            </motion.button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onShowAll}
          className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-ink-700 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/40 rounded-xl px-3 py-2 transition"
        >
          <Logs size={13} />
          عرض جميع الأسئلة
        </button>
      </div>
    </aside>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-600">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ───────────────────── Bottom info cards ───────────────────── */
function QuestionTypesCard({ questions }: { questions: Question[] }) {
  const counts = questions.reduce(
    (m, q) => ({ ...m, [q.type]: (m[q.type] || 0) + 1 }),
    {} as Record<string, number>
  );
  const rows = (["mcq", "tf", "essay"] as const)
    .filter((t) => counts[t])
    .map((t, i) => ({ type: t, count: counts[t], idx: i + 1 }));
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
      <p className="text-sm font-extrabold text-ink-900 mb-3">أنواع الأسئلة في الاختبار</p>
      <ul className="space-y-2">
        {rows.map((r) => {
          const meta = questionTypeMeta(r.type);
          return (
            <li key={r.type} className="flex items-center justify-between text-[13px]">
              <span className="text-ink-700">{meta.label}</span>
              <span className="inline-flex items-center gap-2">
                <span className="text-[10px] text-ink-500">({r.count} سؤال)</span>
                <span className={`w-5 h-5 rounded-full text-[10px] grid place-items-center font-extrabold text-white ${meta.dot}`}>
                  {r.idx}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InstructionsCard({ mode }: { mode: ExamRunnerMode }) {
  const labels = MODE_LABELS[mode];
  const bullets = [
    "يمكنك التنقل بين الأسئلة باستخدام أرقام الأسئلة أو الأزرار.",
    "سيتم حفظ إجابتك تلقائياً عند اختيارها.",
    `يمكنك تغيير إجابتك في أي وقت قبل ${mode === "exam" ? "انتهاء الوقت" : "تسليم الواجب"}.`,
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
      <p className="text-sm font-extrabold text-ink-900 mb-3">تعليمات {labels.runnerType}</p>
      <ul className="space-y-2 text-[13px] text-ink-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
            <span className="leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────── Modals ───────────────────── */
function ModalShell({
  open,
  onClose,
  children,
  size = "sm",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "lg";
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-2xl shadow-card border border-slate-100 w-full ${size === "lg" ? "max-w-3xl" : "max-w-md"}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FinishModal({
  open,
  mode,
  answeredCount,
  totalQ,
  bookmarkedCount,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: ExamRunnerMode;
  answeredCount: number;
  totalQ: number;
  bookmarkedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const labels = MODE_LABELS[mode];
  const unanswered = totalQ - answeredCount;
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft mb-3">
          <Check size={26} />
        </span>
        <p className="text-lg font-black text-ink-900">تأكيد {labels.finishCta}</p>
        <p className="text-[12px] text-ink-600 mt-1">لن تتمكن من تعديل إجاباتك بعد التسليم.</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="مُجابة" value={answeredCount} cls="text-emerald-700" />
          <Stat label="بدون إجابة" value={unanswered} cls="text-rose-700" />
          <Stat label="مُعلَّمة" value={bookmarkedCount} cls="text-amber-700" />
        </div>

        {unanswered > 0 && (
          <p className="mt-4 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            لديك <span className="font-extrabold">{unanswered}</span> سؤال بدون إجابة. هل أنت متأكد؟
          </p>
        )}

        <div className="mt-5 flex items-center justify-center gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
            متابعة الحل
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 text-white text-xs font-extrabold shadow-soft hover:from-brand-800 hover:to-brand-600 transition">
            {labels.finishCta}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2.5">
      <p className={`text-2xl font-black tabular-nums ${cls}`}>{value}</p>
      <p className="text-[10px] text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}

function ExitModal({
  open,
  labels,
  onClose,
  onConfirm,
}: {
  open: boolean;
  labels: typeof MODE_LABELS[keyof typeof MODE_LABELS];
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-soft mb-3">
          <XCircle size={26} />
        </span>
        <p className="text-lg font-black text-ink-900">{labels.exitCta}؟</p>
        <p className="text-[12px] text-ink-600 mt-1">سيتم فقدان أي إجابات لم يتم تسليمها.</p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
            متابعة الحل
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-soft transition">
            خروج
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function AllQuestionsModal({
  open,
  questions,
  statusOf,
  currentIdx,
  onClose,
  onSelect,
}: {
  open: boolean;
  questions: Question[];
  statusOf: (q: Question) => "answered" | "bookmarked" | "seen" | "unseen";
  currentIdx: number;
  onClose: () => void;
  onSelect: (i: number) => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose} size="lg">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">جميع الأسئلة ({questions.length})</p>
        <button onClick={onClose} className="text-ink-500 hover:text-ink-900">
          <X size={18} />
        </button>
      </div>
      <div className="p-5 max-h-[70vh] overflow-y-auto">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {questions.map((q, i) => {
            const st = statusOf(q);
            const meta = questionTypeMeta(q.type);
            const stCls =
              st === "answered"
                ? "border-emerald-300 bg-emerald-50/40"
                : st === "bookmarked"
                ? "border-amber-300 bg-amber-50/40"
                : st === "seen"
                ? "border-rose-300 bg-rose-50/40"
                : "border-slate-200 bg-slate-50/60";
            return (
              <li key={q.id}>
                <button
                  onClick={() => onSelect(i)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl border-2 ${stCls} ${i === currentIdx ? "ring-2 ring-brand-400" : ""} hover:border-brand-300 transition`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold rounded-full border px-1.5 py-0.5 ${meta.chip}`}>{meta.label}</span>
                    <span className="text-[11px] font-extrabold text-ink-700">السؤال {i + 1}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-800 line-clamp-2 leading-relaxed">{q.prompt}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </ModalShell>
  );
}

function SubmittedModal({
  open,
  title,
  answered,
  total,
  backHref,
  reviewHref,
  timeUp,
}: {
  open: boolean;
  title: string;
  answered: number;
  total: number;
  backHref: string;
  reviewHref: string;
  timeUp: boolean;
}) {
  return (
    <ModalShell open={open} onClose={() => undefined}>
      <div className="p-6 text-center">
        <motion.span
          initial={{ scale: 0.6, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240 }}
          className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft mb-3"
        >
          <Check size={30} />
        </motion.span>
        <p className="text-lg font-black text-ink-900">{title}</p>
        {timeUp && <p className="text-[12px] text-amber-700 mt-1">تم التسليم تلقائياً عند انتهاء الوقت.</p>}
        <p className="text-[13px] text-ink-600 mt-2">
          عدد الإجابات: <span className="font-extrabold text-ink-900">{answered}</span> من {total}
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href={reviewHref}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 text-white text-xs font-extrabold shadow-soft hover:from-brand-800 hover:to-brand-600 transition"
          >
            <Sparkles size={14} />
            عرض نموذج الإجابة
          </Link>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
          >
            <ArrowRight size={14} />
            العودة إلى الكورس
          </Link>
        </div>
      </div>
    </ModalShell>
  );
}
