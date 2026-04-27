// Question bank for exams and assignments. Mock data for the runner UI.

export type QuestionType = "mcq" | "tf" | "essay";

export type McqQuestion = {
  id: string;
  type: "mcq";
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation?: string;
  marks: number;
};

export type TfQuestion = {
  id: string;
  type: "tf";
  prompt: string;
  correctValue: boolean;
  explanation?: string;
  marks: number;
};

export type EssayQuestion = {
  id: string;
  type: "essay";
  prompt: string;
  hint?: string;
  modelAnswer: string;
  rubric?: string[];
  marks: number;
  minWords?: number;
};

export type Question = McqQuestion | TfQuestion | EssayQuestion;

export type Answer =
  | { type: "mcq"; optionId: string }
  | { type: "tf"; value: boolean }
  | { type: "essay"; text: string };

const MCQ_BANK: Omit<McqQuestion, "id" | "marks">[] = [
  {
    type: "mcq",
    prompt: "أي من العبارات التالية تمثل خاصية توزيعية الضرب على الجمع؟",
    options: [
      { id: "a", label: "a(b + c) = ab + ac" },
      { id: "b", label: "a(b − c) = ab − ac" },
      { id: "c", label: "a + (b × c) = (a + b) × (a + c)" },
      { id: "d", label: "(a × b) × c = a × (b + c)" },
    ],
    correctOptionId: "a",
    explanation: "خاصية التوزيع تنصّ على أنّ الضرب يُوزّع على الجمع: a(b + c) = ab + ac. الخيار B يمثل التوزيع على الطرح وهو صحيح أيضاً لكن السؤال عن الجمع.",
  },
  {
    type: "mcq",
    prompt: "ما قيمة |−7| + |3|؟",
    options: [
      { id: "a", label: "10" },
      { id: "b", label: "−10" },
      { id: "c", label: "4" },
      { id: "d", label: "−4" },
    ],
    correctOptionId: "a",
    explanation: "|−7| = 7 و |3| = 3، إذن 7 + 3 = 10.",
  },
  {
    type: "mcq",
    prompt: "حل المعادلة |x − 2| = 5 هو:",
    options: [
      { id: "a", label: "x = 7 فقط" },
      { id: "b", label: "x = −3 أو x = 7" },
      { id: "c", label: "x = 3 أو x = −7" },
      { id: "d", label: "لا يوجد حل" },
    ],
    correctOptionId: "b",
    explanation: "|x − 2| = 5 تعطي حالتين: x − 2 = 5 ← x = 7، أو x − 2 = −5 ← x = −3.",
  },
  {
    type: "mcq",
    prompt: "أي من التالي يمثل البعد بين العددين 4 و −3 على خط الأعداد؟",
    options: [
      { id: "a", label: "1" },
      { id: "b", label: "−7" },
      { id: "c", label: "7" },
      { id: "d", label: "12" },
    ],
    correctOptionId: "c",
    explanation: "البعد = |4 − (−3)| = |7| = 7. البعد دائماً غير سالب.",
  },
  {
    type: "mcq",
    prompt: "ناتج عملية (−2)³ يساوي:",
    options: [
      { id: "a", label: "8" },
      { id: "b", label: "−8" },
      { id: "c", label: "6" },
      { id: "d", label: "−6" },
    ],
    correctOptionId: "b",
    explanation: "(−2)³ = (−2) × (−2) × (−2) = −8. الأس الفردي يحافظ على الإشارة السالبة.",
  },
];

const TF_BANK: Omit<TfQuestion, "id" | "marks">[] = [
  {
    type: "tf",
    prompt: "القيمة المطلقة لأي عدد حقيقي تكون موجبة أو صفر.",
    correctValue: true,
    explanation: "القيمة المطلقة |x| تُعرّف كالبعد عن الصفر، والبعد دائماً ≥ 0.",
  },
  {
    type: "tf",
    prompt: "إذا كان |x| = |y| فإن x = y بالضرورة.",
    correctValue: false,
    explanation: "مثال مضاد: |3| = |−3| = 3، لكن 3 ≠ −3. النتيجة الصحيحة: x = ±y.",
  },
  {
    type: "tf",
    prompt: "البعد بين أي عددين على خط الأعداد لا يكون سالباً.",
    correctValue: true,
    explanation: "البعد كمية هندسية غير سالبة دائماً.",
  },
  {
    type: "tf",
    prompt: "حل المتباينة |x| < 3 هو الفترة (−3, 3).",
    correctValue: true,
    explanation: "|x| < 3 تكافئ −3 < x < 3، وهو الفترة المفتوحة (−3, 3).",
  },
];

const ESSAY_BANK: Omit<EssayQuestion, "id" | "marks">[] = [
  {
    type: "essay",
    prompt: "اشرح بأسلوبك مفهوم القيمة المطلقة وأعطِ مثالاً عددياً يوضح استخدامها.",
    hint: "استخدم خط الأعداد في الشرح، وأعطِ مثالاً واحداً على الأقل.",
    minWords: 30,
    modelAnswer:
      "القيمة المطلقة لعدد حقيقي x هي بُعده عن الصفر على خط الأعداد، ونرمز لها بالرمز |x|. وبما أن البُعد كمية غير سالبة، فإنّ |x| ≥ 0 دائماً. مثال: |−5| = 5 لأن العدد −5 يبعد عن الصفر 5 وحدات، وكذلك |5| = 5. تُستخدم القيمة المطلقة في حساب البعد بين عددين على خط الأعداد: |a − b|، كما تُستخدم في حل المعادلات والمتباينات.",
    rubric: [
      "تعريف دقيق للقيمة المطلقة (3 درجات)",
      "ذكر خاصية أنها غير سالبة (2 درجة)",
      "مثال عددي صحيح (3 درجات)",
      "الربط بخط الأعداد أو تطبيق عملي (2 درجة)",
    ],
  },
  {
    type: "essay",
    prompt: "اذكر خطوات حل المعادلة |2x − 1| = 7 مع تبرير كل خطوة.",
    hint: "وضّح حالات الفصل عن القيمة المطلقة.",
    minWords: 40,
    modelAnswer:
      "الخطوة 1: المعادلة من الشكل |A| = k حيث k ≥ 0، إذن لها حل.\nالخطوة 2: نفصل إلى حالتين: إما 2x − 1 = 7 أو 2x − 1 = −7.\nالخطوة 3 (الحالة الأولى): 2x = 8 ← x = 4.\nالخطوة 4 (الحالة الثانية): 2x = −6 ← x = −3.\nالخطوة 5 (التحقق): نعوض في المعادلة الأصلية: |2(4) − 1| = |7| = 7 ✓، |2(−3) − 1| = |−7| = 7 ✓.\nالجواب النهائي: x = 4 أو x = −3.",
    rubric: [
      "شرط وجود الحل (2 درجة)",
      "الفصل إلى حالتين بشكل صحيح (3 درجات)",
      "حل كل حالة (3 درجات)",
      "التحقق من الحلول (2 درجة)",
    ],
  },
];

/**
 * Build a deterministic list of questions for a given exam/assignment id.
 * Mixes MCQ / True-False / Essay so the runner can demo all 3 types.
 */
export function buildQuestions(seedId: string, count: number, fullMark: number): Question[] {
  const seed = stringHash(seedId);
  // distribute marks roughly evenly
  const perMark = Math.max(1, Math.round(fullMark / count));

  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const slot = (seed + i * 7) % 10; // 0..9
    let q: Question;
    if (slot < 6) {
      const t = MCQ_BANK[(seed + i) % MCQ_BANK.length];
      q = { id: `${seedId}-q${i + 1}`, marks: perMark, ...t };
    } else if (slot < 8) {
      const t = TF_BANK[(seed + i) % TF_BANK.length];
      q = { id: `${seedId}-q${i + 1}`, marks: perMark, ...t };
    } else {
      const t = ESSAY_BANK[(seed + i) % ESSAY_BANK.length];
      q = { id: `${seedId}-q${i + 1}`, marks: perMark * 2, ...t };
    }
    out.push(q);
  }
  return out;
}

function stringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function questionTypeMeta(t: QuestionType): { label: string; chip: string; dot: string } {
  switch (t) {
    case "mcq":
      return { label: "اختيار من متعدد", chip: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" };
    case "tf":
      return { label: "صح أو خطأ", chip: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" };
    case "essay":
      return { label: "مقالي (إجابة نصية)", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  }
}

/** Parse "60 دقيقة" / "90 دقيقة" / "30 دقيقة" → minutes number. */
export function parseDurationMinutes(label: string): number {
  const m = label.match(/(\d+)/);
  return m ? Number(m[1]) : 60;
}

/** Count questions in a list and return total possible marks. */
export function totalMarks(qs: Question[]): number {
  return qs.reduce((a, q) => a + q.marks, 0);
}

/* ========================================================================== *
 *                            Grading & Persistence                           *
 * ========================================================================== */

export type Grade = "correct" | "wrong" | "unanswered" | "pending";

/** Grade a single answer against its question. Essays are marked "pending". */
export function gradeAnswer(q: Question, a?: Answer): Grade {
  if (!a) return "unanswered";
  if (q.type === "mcq" && a.type === "mcq") return a.optionId === q.correctOptionId ? "correct" : "wrong";
  if (q.type === "tf" && a.type === "tf") return a.value === q.correctValue ? "correct" : "wrong";
  if (q.type === "essay" && a.type === "essay") return a.text.trim() ? "pending" : "unanswered";
  return "wrong";
}

export type ScoreSummary = {
  correct: number;
  wrong: number;
  unanswered: number;
  pending: number;
  earnedAutoMarks: number;
  pendingMarks: number;
  autoMarks: number; // sum of auto-gradable marks (mcq + tf)
  totalMarks: number;
  percentage: number; // 0-100, based on earnedAuto / autoMarks
};

export function summarizeAnswers(questions: Question[], answers: Record<string, Answer>): ScoreSummary {
  let correct = 0, wrong = 0, unanswered = 0, pending = 0;
  let earnedAutoMarks = 0, pendingMarks = 0, autoMarks = 0;
  let total = 0;
  for (const q of questions) {
    total += q.marks;
    const g = gradeAnswer(q, answers[q.id]);
    if (q.type === "essay") {
      pendingMarks += q.marks;
      if (g === "pending") pending++;
      else unanswered++;
    } else {
      autoMarks += q.marks;
      if (g === "correct") { correct++; earnedAutoMarks += q.marks; }
      else if (g === "wrong") wrong++;
      else unanswered++;
    }
  }
  const percentage = autoMarks > 0 ? Math.round((earnedAutoMarks / autoMarks) * 100) : 0;
  return { correct, wrong, unanswered, pending, earnedAutoMarks, pendingMarks, autoMarks, totalMarks: total, percentage };
}

/** Arabic grade label based on percentage. */
export function gradeLabel(pct: number): { label: string; cls: string; accent: string } {
  if (pct >= 90) return { label: "ممتاز", cls: "text-emerald-700", accent: "emerald" };
  if (pct >= 80) return { label: "جيد جداً", cls: "text-sky-700", accent: "sky" };
  if (pct >= 65) return { label: "جيد", cls: "text-brand-700", accent: "brand" };
  if (pct >= 50) return { label: "مقبول", cls: "text-amber-700", accent: "amber" };
  return { label: "راسب", cls: "text-rose-700", accent: "rose" };
}

/* ---------- sessionStorage persistence ---------- */

const STORAGE_PREFIX = "lms.runner.";

export type StoredAttempt = {
  answers: Record<string, Answer>;
  timeSpentSec: number;
  submittedAt: number; // epoch ms
};

export function saveAttempt(runnerId: string, attempt: StoredAttempt) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + runnerId, JSON.stringify(attempt));
  } catch { /* ignore */ }
}

export function loadAttempt(runnerId: string): StoredAttempt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + runnerId);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAttempt;
  } catch { return null; }
}

/**
 * Generate plausible demo answers so the review page has data even when the
 * user hasn't just submitted (e.g., revisiting an already-submitted exam).
 * Most answers are correct; some are intentionally wrong or unanswered.
 */
export function generateDemoAnswers(questions: Question[], seedId: string): Record<string, Answer> {
  const seed = stringHash(seedId + ":demo");
  const out: Record<string, Answer> = {};
  questions.forEach((q, i) => {
    const slot = (seed + i * 13) % 10; // 0..9
    // 10% unanswered, 25% wrong, 65% correct
    if (slot === 0) return; // unanswered
    const beWrong = slot <= 2;
    if (q.type === "mcq") {
      if (beWrong) {
        const wrongs = q.options.filter((o) => o.id !== q.correctOptionId);
        const pick = wrongs[(seed + i) % wrongs.length];
        out[q.id] = { type: "mcq", optionId: pick.id };
      } else {
        out[q.id] = { type: "mcq", optionId: q.correctOptionId };
      }
    } else if (q.type === "tf") {
      out[q.id] = { type: "tf", value: beWrong ? !q.correctValue : q.correctValue };
    } else {
      // essay: put partial text roughly matching the model answer
      const text = beWrong
        ? "إجابة مختصرة تحتاج إلى تفصيل أكثر."
        : q.modelAnswer.slice(0, Math.floor(q.modelAnswer.length * 0.65));
      out[q.id] = { type: "essay", text };
    }
  });
  return out;
}
