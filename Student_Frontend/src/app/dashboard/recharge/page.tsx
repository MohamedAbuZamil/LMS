"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  History,
  Lock,
  PiggyBank,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  User,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { currentUser, formatCurrency } from "@/lib/data/currentUser";

/* ────────────────────────────── *
 *   Shared storage keys          *
 * ────────────────────────────── */
const STORAGE_BALANCE = "lms.buy.balance"; // shared with /dashboard/buy
const STORAGE_HISTORY = "lms.recharge.history";

type Method = "card" | "visa";

type RechargeTx = {
  id: string;
  method: Method;
  amount: number;
  reference: string; // last 4 digits / card serial
  at: number; // ms timestamp
};

/* ────────────────────────────── *
 *   Mock scratch-card decoder    *
 * ────────────────────────────── */
const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

/** Demo cards with fixed amounts. Anything else falls back to deterministic
 * value derived from the card digits. */
const DEMO_CARDS: Record<string, number> = {
  "1111111111111111": 50,
  "2222222222222222": 100,
  "3333333333333333": 200,
  "4444444444444444": 500,
  "5555555555555555": 1000,
};

function decodeScratchCard(digits: string): number {
  if (DEMO_CARDS[digits] !== undefined) return DEMO_CARDS[digits];
  // Deterministic fallback so any 16-digit input "looks" valid.
  let h = 0;
  for (let i = 0; i < digits.length; i++) h = (h * 31 + digits.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % PRESET_AMOUNTS.length;
  return PRESET_AMOUNTS[idx];
}

/* ────────────────────────────── *
 *   Page                         *
 * ────────────────────────────── */
export default function RechargePage() {
  const [method, setMethod] = useState<Method>("card");
  const [balance, setBalance] = useState<number>(currentUser.balance);
  const [history, setHistory] = useState<RechargeTx[]>([]);
  const [success, setSuccess] = useState<RechargeTx | null>(null);

  /* hydrate from sessionStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const b = window.sessionStorage.getItem(STORAGE_BALANCE);
      const h = window.sessionStorage.getItem(STORAGE_HISTORY);
      if (b !== null) setBalance(Number(b));
      if (h) setHistory(JSON.parse(h));
    } catch { /* ignore */ }
  }, []);

  /* persist */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(STORAGE_BALANCE, String(balance));
      window.sessionStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
    } catch { /* ignore */ }
  }, [balance, history]);

  const completeRecharge = (tx: RechargeTx) => {
    setBalance((b) => b + tx.amount);
    setHistory((h) => [tx, ...h].slice(0, 12));
    setSuccess(tx);
  };

  return (
    <div className="space-y-6">
      <Hero balance={balance} totalRecharged={history.reduce((a, t) => a + t.amount, 0)} txCount={history.length} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-5">
          <MethodTabs method={method} setMethod={setMethod} />

          <AnimatePresence mode="wait">
            {method === "card" ? (
              <motion.div
                key="card"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
              >
                <ScratchCardForm onSuccess={completeRecharge} />
              </motion.div>
            ) : (
              <motion.div
                key="visa"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
              >
                <VisaForm onSuccess={completeRecharge} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-5">
          <SecurityCard />
          <HistoryList history={history} />
        </aside>
      </div>

      <SuccessModal tx={success} balance={balance} onClose={() => setSuccess(null)} />
    </div>
  );
}

/* ────────────────────────────── *
 *   Hero                         *
 * ────────────────────────────── */
function Hero({
  balance,
  totalRecharged,
  txCount,
}: {
  balance: number;
  totalRecharged: number;
  txCount: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl text-white p-5 sm:p-7"
    >
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-5">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 border border-white/20 rounded-full px-2.5 py-1 backdrop-blur">
            <Wallet size={12} />
            شحن المحفظة
          </span>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            اشحن رصيدك بسهولة
            <span className="block text-white/85 text-base sm:text-lg font-bold mt-1">
              عن طريق كارت شحن أو بطاقة فيزا - الإضافة فورية على محفظتك.
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <Pill icon={ShieldCheck} text="معاملات مشفّرة" />
            <Pill icon={Zap} text="تفعيل خلال ثوانٍ" />
            <Pill icon={BadgeCheck} text="بدون رسوم خفية" />
          </div>
        </div>

        <div className="bg-white/95 text-ink-900 rounded-2xl shadow-soft p-4 sm:p-5 min-w-[260px] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white grid place-items-center shrink-0 shadow-soft">
              <PiggyBank size={20} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] text-ink-500 font-bold">الرصيد الحالي</p>
              <p className="text-2xl font-black tabular-nums">{formatCurrency(balance)}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 rounded-xl p-2">
              <p className="text-[10px] text-ink-500">إجمالي الشحن</p>
              <p className="text-sm font-black text-amber-700 tabular-nums">{formatCurrency(totalRecharged)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2">
              <p className="text-[10px] text-ink-500">عدد العمليات</p>
              <p className="text-sm font-black text-amber-700 tabular-nums">{txCount}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Pill({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 backdrop-blur">
      <Icon size={11} />
      {text}
    </span>
  );
}

/* ────────────────────────────── *
 *   Method Tabs                  *
 * ────────────────────────────── */
function MethodTabs({ method, setMethod }: { method: Method; setMethod: (m: Method) => void }) {
  const items: { k: Method; label: string; sub: string; icon: typeof Ticket; bg: string; iconBg: string }[] = [
    {
      k: "card",
      label: "كارت شحن",
      sub: "16 رقم على ظهر الكارت",
      icon: Ticket,
      bg: "from-amber-50 to-orange-50",
      iconBg: "from-amber-500 to-orange-600",
    },
    {
      k: "visa",
      label: "بطاقة فيزا",
      sub: "Visa / Mastercard / Meeza",
      icon: CreditCard,
      bg: "from-sky-50 to-indigo-50",
      iconBg: "from-sky-500 to-indigo-600",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => {
        const active = method === it.k;
        const Icon = it.icon;
        return (
          <button
            key={it.k}
            type="button"
            onClick={() => setMethod(it.k)}
            className={`relative text-right rounded-2xl border-2 p-4 transition group ${
              active
                ? "border-brand-500 shadow-soft bg-white"
                : `border-slate-200 bg-gradient-to-br ${it.bg} hover:border-brand-200`
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-11 h-11 rounded-xl text-white grid place-items-center shrink-0 shadow-soft bg-gradient-to-br ${it.iconBg}`}
              >
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink-900">{it.label}</p>
                <p className="text-[11px] text-ink-500 mt-0.5">{it.sub}</p>
              </div>
            </div>
            {active && (
              <motion.span
                layoutId="recharge-tab"
                className="absolute -top-2 -left-2 inline-grid place-items-center w-6 h-6 rounded-full bg-brand-600 text-white shadow-soft"
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
              >
                <Check size={12} />
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────── *
 *   Helpers                      *
 * ────────────────────────────── */
const onlyDigits = (s: string) => s.replace(/\D/g, "");

function formatCardDigits(digits: string, group = 4): string {
  const d = onlyDigits(digits).slice(0, 16);
  return d.match(new RegExp(`.{1,${group}}`, "g"))?.join(" ") ?? "";
}

function luhnValid(num: string): boolean {
  const d = onlyDigits(num);
  if (d.length < 12) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectBrand(num: string): "visa" | "master" | "meeza" | "amex" | "unknown" {
  const d = onlyDigits(num);
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "master";
  if (/^(3[47])/.test(d)) return "amex";
  if (/^(50|627)/.test(d)) return "meeza";
  return "unknown";
}

/* ────────────────────────────── *
 *   Scratch Card Form            *
 * ────────────────────────────── */
function ScratchCardForm({ onSuccess }: { onSuccess: (tx: RechargeTx) => void }) {
  const [raw, setRaw] = useState("");
  const [reveal, setReveal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const digits = onlyDigits(raw);
  const isFull = digits.length === 16;
  const formatted = formatCardDigits(raw, 4);
  const previewAmount = isFull ? decodeScratchCard(digits) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFull) {
      setError("يجب إدخال 16 رقماً مطبوعة على ظهر الكارت.");
      return;
    }
    setBusy(true);
    // simulate network latency
    window.setTimeout(() => {
      const amount = decodeScratchCard(digits);
      onSuccess({
        id: `tx-${Date.now()}`,
        method: "card",
        amount,
        reference: digits.slice(-4),
        at: Date.now(),
      });
      setRaw("");
      setBusy(false);
    }, 700);
  };

  const fillDemo = (d: string) => setRaw(formatCardDigits(d, 4));

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white grid place-items-center shrink-0 shadow-soft">
          <Ticket size={18} />
        </span>
        <div>
          <p className="text-base font-black text-ink-900">شحن بكارت شحن</p>
          <p className="text-[12px] text-ink-500">اكشط ظهر الكارت وأدخل الـ 16 رقم بالترتيب.</p>
        </div>
      </div>

      {/* Big card number input */}
      <div>
        <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">
          رقم الكارت <span className="text-ink-400 font-bold">(16 رقم)</span>
        </label>
        <div
          className={`relative flex items-center gap-2 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 rounded-2xl px-3.5 py-3.5 transition ${
            error ? "border-rose-400" : isFull ? "border-emerald-400" : "border-amber-200 focus-within:border-brand-500"
          }`}
        >
          <Hash size={16} className="text-amber-700 shrink-0" />
          <input
            type={reveal ? "text" : "password"}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={formatted}
            onChange={(e) => {
              setError(null);
              setRaw(e.target.value);
            }}
            placeholder="0000  0000  0000  0000"
            dir="ltr"
            className="flex-1 bg-transparent outline-none text-lg sm:text-xl font-black tracking-[0.2em] text-ink-900 placeholder:text-ink-300 placeholder:font-bold tabular-nums"
            maxLength={19} // 16 digits + 3 spaces
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="text-ink-500 hover:text-ink-900 transition shrink-0"
            aria-label="إظهار/إخفاء"
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* progress + chips */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(digits.length / 16) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-[11px] font-extrabold text-ink-700 tabular-nums">{digits.length}/16</span>
        </div>

        {error && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-rose-700">
            <AlertTriangle size={13} />
            {error}
          </p>
        )}
      </div>

      {/* Amount preview */}
      <div
        className={`rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 transition ${
          previewAmount
            ? "border-emerald-300 bg-emerald-50/60"
            : "border-dashed border-slate-200 bg-slate-50/60"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-9 h-9 rounded-xl grid place-items-center text-white shrink-0 ${
              previewAmount ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <ScanLine size={16} />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] text-ink-500 font-bold">قيمة الكارت</p>
            <p className={`text-base font-black ${previewAmount ? "text-emerald-800" : "text-ink-400"}`}>
              {previewAmount ? formatCurrency(previewAmount) : "أدخل الأرقام لعرض القيمة"}
            </p>
          </div>
        </div>
        {previewAmount && (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full border bg-white px-2 py-1 border-emerald-200 text-emerald-700">
            <CheckCircle2 size={10} />
            كارت صالح
          </span>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={!isFull || busy}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold shadow-soft transition ${
            isFull && !busy
              ? "bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              : "bg-slate-100 text-ink-400 cursor-not-allowed"
          }`}
        >
          {busy ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              <Zap size={15} />
              شحن الرصيد
              <ArrowLeft size={13} />
            </>
          )}
        </button>
      </div>

      {/* Demo cards (helper) */}
      <details className="group">
        <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink-500 hover:text-brand-700 transition">
          <Sparkles size={12} />
          أرقام كروت تجريبية
          <span className="text-ink-400 group-open:hidden">▾</span>
        </summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(DEMO_CARDS).map(([d, amt]) => (
            <button
              type="button"
              key={d}
              onClick={() => fillDemo(d)}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50 hover:border-amber-300 px-3 py-2 text-[11px] transition"
            >
              <span className="font-mono tabular-nums text-ink-700" dir="ltr">
                {formatCardDigits(d, 4)}
              </span>
              <span className="font-extrabold text-amber-700">{formatCurrency(amt)}</span>
            </button>
          ))}
        </div>
      </details>
    </form>
  );
}

/* ────────────────────────────── *
 *   Visa Form                    *
 * ────────────────────────────── */
function VisaForm({ onSuccess }: { onSuccess: (tx: RechargeTx) => void }) {
  const [amount, setAmount] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>("");

  const [num, setNum] = useState("");
  const [name, setName] = useState(currentUser.name);
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const numDigits = onlyDigits(num);
  const expDigits = onlyDigits(exp);
  const brand = detectBrand(numDigits);

  const finalAmount = customAmount ? Math.max(0, Math.min(20000, Number(onlyDigits(customAmount)))) : amount;

  const onExpChange = (v: string) => {
    const d = onlyDigits(v).slice(0, 4);
    setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (numDigits.length !== 16) e.num = "رقم البطاقة يجب أن يكون 16 رقماً.";
    else if (!luhnValid(numDigits)) e.num = "رقم البطاقة غير صالح.";
    if (name.trim().length < 3) e.name = "أدخل الاسم كما يظهر على البطاقة.";
    if (expDigits.length !== 4) e.exp = "أدخل تاريخ صلاحية صحيح (MM/YY).";
    else {
      const mm = parseInt(expDigits.slice(0, 2), 10);
      const yy = parseInt(expDigits.slice(2), 10);
      const now = new Date();
      const curYY = now.getFullYear() % 100;
      const curMM = now.getMonth() + 1;
      if (mm < 1 || mm > 12) e.exp = "الشهر غير صحيح.";
      else if (yy < curYY || (yy === curYY && mm < curMM)) e.exp = "البطاقة منتهية الصلاحية.";
    }
    if (cvv.length < 3) e.cvv = "أدخل رمز الأمان (CVV).";
    if (finalAmount < 10) e.amount = "أقل قيمة شحن هي 10 ج.م.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    window.setTimeout(() => {
      onSuccess({
        id: `tx-${Date.now()}`,
        method: "visa",
        amount: finalAmount,
        reference: numDigits.slice(-4),
        at: Date.now(),
      });
      setBusy(false);
      setNum("");
      setExp("");
      setCvv("");
      setCustomAmount("");
    }, 900);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Card preview */}
      <CardPreview num={numDigits} name={name} exp={exp} brand={brand} />

      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-[11px] font-extrabold text-ink-700 mb-2">قيمة الشحن</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAmount(a);
                  setCustomAmount("");
                  setErrors((e) => ({ ...e, amount: "" }));
                }}
                className={`text-xs font-extrabold rounded-xl border-2 px-3 py-2 transition ${
                  !customAmount && amount === a
                    ? "border-brand-500 bg-brand-50/60 text-brand-800"
                    : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"
                }`}
              >
                {formatCurrency(a)}
              </button>
            ))}
          </div>
          <div className="mt-3 relative">
            <input
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(onlyDigits(e.target.value));
                setErrors((er) => ({ ...er, amount: "" }));
              }}
              placeholder="أو أدخل قيمة مخصصة..."
              className={`w-full bg-slate-50/70 border rounded-xl ps-3 pe-16 py-2.5 text-sm font-extrabold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-100 transition ${
                errors.amount ? "border-rose-300" : "border-slate-200 focus:border-brand-300"
              }`}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-500 font-bold">ج.م</span>
          </div>
          {errors.amount && <FieldError msg={errors.amount} />}
        </div>

        {/* Card number */}
        <div>
          <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">رقم البطاقة</label>
          <div
            className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${
              errors.num ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
            }`}
          >
            <CreditCard size={15} className="text-ink-400 shrink-0" />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              dir="ltr"
              value={formatCardDigits(num, 4)}
              onChange={(e) => {
                setNum(e.target.value);
                setErrors((er) => ({ ...er, num: "" }));
              }}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="flex-1 bg-transparent outline-none text-sm font-extrabold tabular-nums tracking-wider text-ink-900 placeholder:text-ink-300"
            />
            <BrandBadge brand={brand} />
          </div>
          {errors.num && <FieldError msg={errors.num} />}
        </div>

        {/* Cardholder name */}
        <div>
          <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">اسم حامل البطاقة</label>
          <div
            className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${
              errors.name ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
            }`}
          >
            <User size={15} className="text-ink-400 shrink-0" />
            <input
              type="text"
              autoComplete="cc-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((er) => ({ ...er, name: "" }));
              }}
              placeholder="الاسم كما يظهر على البطاقة"
              className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
            />
          </div>
          {errors.name && <FieldError msg={errors.name} />}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">تاريخ الصلاحية</label>
            <div
              className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${
                errors.exp ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
              }`}
            >
              <Calendar size={15} className="text-ink-400 shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                dir="ltr"
                value={exp}
                onChange={(e) => {
                  onExpChange(e.target.value);
                  setErrors((er) => ({ ...er, exp: "" }));
                }}
                placeholder="MM/YY"
                maxLength={5}
                className="flex-1 bg-transparent outline-none text-sm font-extrabold tabular-nums text-ink-900 placeholder:text-ink-300"
              />
            </div>
            {errors.exp && <FieldError msg={errors.exp} />}
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">CVV</label>
            <div
              className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${
                errors.cvv ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
              }`}
            >
              <Lock size={15} className="text-ink-400 shrink-0" />
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                dir="ltr"
                value={cvv}
                onChange={(e) => {
                  setCvv(onlyDigits(e.target.value).slice(0, 4));
                  setErrors((er) => ({ ...er, cvv: "" }));
                }}
                placeholder="•••"
                maxLength={4}
                className="flex-1 bg-transparent outline-none text-sm font-extrabold tabular-nums text-ink-900 placeholder:text-ink-300"
              />
            </div>
            {errors.cvv && <FieldError msg={errors.cvv} />}
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] bg-sky-50 border border-sky-200 text-sky-900 rounded-xl px-3 py-2">
          <ShieldCheck size={13} className="text-sky-600 mt-0.5 shrink-0" />
          <p>
            بياناتك مشفّرة ولا يتم تخزينها على الخادم. هذه الصفحة وهمية للعرض فقط - استخدم رقم
            <span className="font-extrabold"> 4242 4242 4242 4242 </span>
            للتجربة.
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold shadow-soft transition ${
            busy
              ? "bg-slate-100 text-ink-400 cursor-not-allowed"
              : "bg-gradient-to-l from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white"
          }`}
        >
          {busy ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              جاري المعالجة الآمنة...
            </>
          ) : (
            <>
              <Lock size={14} />
              ادفع {formatCurrency(finalAmount)} الآن
              <ArrowLeft size={13} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
      <AlertTriangle size={11} />
      {msg}
    </p>
  );
}

/* ────────────────────────────── *
 *   Card Preview (Visa)          *
 * ────────────────────────────── */
function CardPreview({
  num,
  name,
  exp,
  brand,
}: {
  num: string;
  name: string;
  exp: string;
  brand: ReturnType<typeof detectBrand>;
}) {
  const padded = num.padEnd(16, "•");
  const groups = padded.match(/.{1,4}/g) ?? [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      className="relative rounded-3xl text-white p-6 overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-sky-700 shadow-card"
    >
      {/* decoration */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 border border-white/20 rounded-full px-2.5 py-1 backdrop-blur">
          <Smartphone size={12} />
          بطاقة افتراضية
        </span>
        <BrandLogo brand={brand} />
      </div>

      {/* chip */}
      <div className="relative mt-7 flex items-center gap-2">
        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner relative">
          <div className="absolute inset-1 rounded-sm border border-amber-700/40" />
        </div>
        <ScanLine size={20} className="text-white/70" />
      </div>

      {/* number */}
      <p
        className="relative mt-3 text-xl sm:text-2xl font-black tracking-[0.18em] tabular-nums"
        dir="ltr"
      >
        {groups.join("  ")}
      </p>

      <div className="relative mt-4 grid grid-cols-[1fr_auto] gap-4 items-end">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/60">Cardholder</p>
          <p className="text-sm font-extrabold truncate">{name || "اسم حامل البطاقة"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Expires</p>
          <p className="text-sm font-extrabold tabular-nums" dir="ltr">
            {exp || "MM/YY"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function BrandBadge({ brand }: { brand: ReturnType<typeof detectBrand> }) {
  if (brand === "unknown") return null;
  const map = {
    visa: { label: "VISA", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    master: { label: "MASTER", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    amex: { label: "AMEX", cls: "bg-sky-50 text-sky-700 border-sky-200" },
    meeza: { label: "MEEZA", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  } as const;
  const m = map[brand];
  return (
    <span
      className={`shrink-0 text-[10px] font-black tracking-wider rounded-md border px-2 py-0.5 ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function BrandLogo({ brand }: { brand: ReturnType<typeof detectBrand> }) {
  const label =
    brand === "visa" ? "VISA" : brand === "master" ? "Mastercard" : brand === "amex" ? "AMEX" : brand === "meeza" ? "Meeza" : "CARD";
  return (
    <span className="text-base sm:text-lg font-black italic tracking-wider text-white drop-shadow">
      {label}
    </span>
  );
}

/* ────────────────────────────── *
 *   Side: Security + History     *
 * ────────────────────────────── */
function SecurityCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center">
          <ShieldCheck size={16} />
        </span>
        <p className="text-sm font-extrabold text-ink-900">دفع آمن 100%</p>
      </div>
      <ul className="text-[12px] text-ink-600 space-y-1.5 mt-2">
        <li className="flex items-start gap-2">
          <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
          تشفير SSL لجميع المعاملات.
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
          لا يتم تخزين بيانات البطاقة لديك.
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
          الإضافة على المحفظة فورية بعد التحقق.
        </li>
      </ul>
    </div>
  );
}

function HistoryList({ history }: { history: RechargeTx[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 grid place-items-center">
          <History size={16} />
        </span>
        <p className="text-sm font-extrabold text-ink-900">آخر العمليات</p>
      </div>
      {history.length === 0 ? (
        <p className="text-[12px] text-ink-500 bg-slate-50/70 rounded-xl p-3 text-center">
          لا توجد عمليات شحن بعد.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.slice(0, 5).map((tx) => (
            <li
              key={tx.id}
              className="flex items-center gap-3 bg-slate-50/70 border border-slate-100 rounded-xl px-3 py-2"
            >
              <span
                className={`w-8 h-8 rounded-lg grid place-items-center text-white shrink-0 ${
                  tx.method === "card" ? "bg-amber-500" : "bg-indigo-500"
                }`}
              >
                {tx.method === "card" ? <Ticket size={14} /> : <CreditCard size={14} />}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[12px] font-extrabold text-ink-900">
                  {tx.method === "card" ? "كارت شحن" : "بطاقة فيزا"} •••• {tx.reference}
                </p>
                <p className="text-[10px] text-ink-500">
                  {new Date(tx.at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              <span className="text-[12px] font-extrabold text-emerald-700 tabular-nums shrink-0">
                +{formatCurrency(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ────────────────────────────── *
 *   Success Modal                *
 * ────────────────────────────── */
function SuccessModal({
  tx,
  balance,
  onClose,
}: {
  tx: RechargeTx | null;
  balance: number;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {tx && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-card border border-slate-100 w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <motion.span
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240 }}
                className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft mb-3"
              >
                <Check size={30} />
              </motion.span>
              <p className="text-lg font-black text-ink-900">تم الشحن بنجاح</p>
              <p className="text-[12px] text-ink-500 mt-1">
                تمت إضافة <span className="font-extrabold text-emerald-700">+{formatCurrency(tx.amount)}</span> إلى محفظتك.
              </p>

              <div className="mt-4 bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-[12px] text-right space-y-1.5">
                <Row label="طريقة الشحن" value={tx.method === "card" ? "كارت شحن" : "بطاقة فيزا"} />
                <Row label="المرجع" value={`•••• ${tx.reference}`} />
                <Row
                  label="التاريخ"
                  value={new Date(tx.at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                />
                <div className="border-t border-slate-200 pt-1.5">
                  <Row
                    label="الرصيد الحالي"
                    value={<span className="text-emerald-700 font-extrabold">{formatCurrency(balance)}</span>}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
                <a
                  href="/dashboard/buy"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
                >
                  <Sparkles size={13} />
                  اشترِ كورساً الآن
                </a>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
                >
                  <X size={13} />
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-extrabold text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}
