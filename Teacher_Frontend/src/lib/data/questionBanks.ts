// Question banks + questions mock model.

export type QuestionType = "mcq" | "truefalse" | "essay";

export interface MCQChoice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface BaseQuestion {
  id: string;
  bankId: string;
  type: QuestionType;
  text: string;
  explanation?: string;
  points: number;
  createdAt: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  choices: MCQChoice[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "truefalse";
  correct: boolean;
}

export interface EssayQuestion extends BaseQuestion {
  type: "essay";
  modelAnswer?: string;
}

export type Question = MCQQuestion | TrueFalseQuestion | EssayQuestion;

export interface QuestionBank {
  id: string;
  teacherId: string;
  title: string;
  grade: string | "all";
  description?: string;
  createdAt: string;
  questions: Question[];
}

const STORE = "lms.teacher.banks";

const SEED: QuestionBank[] = [
  {
    id: "b-alg",
    teacherId: "t-ahmed",
    title: "بنك الجبر — الصف الثالث",
    grade: "الصف الثالث الثانوي",
    description: "أسئلة متنوعة على الجبر.",
    createdAt: "2025-01-01",
    questions: [
      {
        id: "q1",
        bankId: "b-alg",
        type: "mcq",
        text: "ما ناتج جمع 2 + 3؟",
        points: 1,
        createdAt: "2025-01-01",
        choices: [
          { id: "c1", text: "4", isCorrect: false },
          { id: "c2", text: "5", isCorrect: true },
          { id: "c3", text: "6", isCorrect: false },
          { id: "c4", text: "7", isCorrect: false },
        ],
      },
      {
        id: "q2",
        bankId: "b-alg",
        type: "truefalse",
        text: "مجموع زوايا المثلث 180 درجة.",
        points: 1,
        correct: true,
        createdAt: "2025-01-02",
      },
    ],
  },
  {
    id: "b-geo",
    teacherId: "t-ahmed",
    title: "بنك الهندسة — لكل الصفوف",
    grade: "all",
    description: "أسئلة هندسة عامة.",
    createdAt: "2025-01-03",
    questions: [],
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function listBanks(teacherId?: string): QuestionBank[] {
  if (!isBrowser()) return SEED;
  const raw = sessionStorage.getItem(STORE);
  if (!raw) {
    sessionStorage.setItem(STORE, JSON.stringify(SEED));
    return teacherId ? SEED.filter((b) => b.teacherId === teacherId) : SEED;
  }
  try {
    const all = JSON.parse(raw) as QuestionBank[];
    return teacherId ? all.filter((b) => b.teacherId === teacherId) : all;
  } catch {
    return SEED;
  }
}

export function saveBanks(list: QuestionBank[]) {
  if (!isBrowser()) return;
  sessionStorage.setItem(STORE, JSON.stringify(list));
}

export function getBank(id: string): QuestionBank | undefined {
  return listBanks().find((b) => b.id === id);
}

export function upsertBank(b: QuestionBank) {
  const all = listBanks();
  const idx = all.findIndex((x) => x.id === b.id);
  if (idx >= 0) all[idx] = b;
  else all.unshift(b);
  saveBanks(all);
}

export function removeBank(id: string) {
  saveBanks(listBanks().filter((b) => b.id !== id));
}

export function upsertQuestion(bankId: string, q: Question) {
  const all = listBanks();
  const bank = all.find((x) => x.id === bankId);
  if (!bank) return;
  const idx = bank.questions.findIndex((y) => y.id === q.id);
  if (idx >= 0) bank.questions[idx] = q;
  else bank.questions.push(q);
  saveBanks(all);
}

export function removeQuestion(bankId: string, qId: string) {
  const all = listBanks();
  const bank = all.find((x) => x.id === bankId);
  if (!bank) return;
  bank.questions = bank.questions.filter((y) => y.id !== qId);
  saveBanks(all);
}

export const QUESTION_TYPES: { key: QuestionType; label: string; hint: string }[] = [
  { key: "mcq", label: "اختيار متعدد", hint: "سؤال MCQ بأربع اختيارات أو أكثر." },
  { key: "truefalse", label: "صح / خطأ", hint: "سؤال بإجابتين فقط." },
  { key: "essay", label: "مقالي", hint: "إجابة نصية يكتبها الطالب." },
];
