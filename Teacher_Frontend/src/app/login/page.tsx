"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, EyeOff, KeyRound, LogIn, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSession, login, SECRETARY_DEMO, TEACHER_DEMO } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!username.trim() || !password) {
      setErr("أدخل اسم المستخدم وكلمة المرور.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const s = login(username, password);
      setBusy(false);
      if (!s) {
        setErr("بيانات الدخول غير صحيحة.");
        return;
      }
      router.replace("/dashboard");
    }, 500);
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8"
        >
          <Logo size={48} />
          <h1 className="mt-5 text-2xl font-black text-ink-900">تسجيل الدخول</h1>
          <p className="text-[12px] text-ink-500 mt-1">
            ادخل بحساب المدرس أو أحد حسابات السكرتارية للبدء.
          </p>

          {err && (
            <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 text-[12px] font-extrabold text-rose-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {err}
            </div>
          )}

          <div className="mt-5 space-y-3">
            <Field icon={User} label="اسم المستخدم" required>
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={TEACHER_DEMO.username}
                className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
              />
            </Field>
            <Field icon={KeyRound} label="كلمة المرور" required>
              <input
                type={show ? "text" : "password"}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="text-ink-500 hover:text-brand-700"
                aria-label={show ? "إخفاء" : "إظهار"}
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>
          </div>

          <button
            type="submit"
            disabled={busy}
            className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-extrabold shadow-soft transition ${
              busy
                ? "bg-slate-100 text-ink-400 cursor-not-allowed"
                : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
            }`}
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                جاري الدخول...
              </>
            ) : (
              <>
                <LogIn size={14} />
                دخول
              </>
            )}
          </button>

          <div className="mt-5 bg-brand-50/60 border border-brand-100 rounded-xl p-3 text-[11px] text-ink-700">
            <p className="font-extrabold text-brand-800 mb-1.5">بيانات تجربة:</p>
            <ul className="space-y-0.5">
              <li>
                <span className="font-extrabold">مدرس:</span> {TEACHER_DEMO.username} / {TEACHER_DEMO.password}
              </li>
              <li>
                <span className="font-extrabold">سكرتارية:</span> {SECRETARY_DEMO.username} / {SECRETARY_DEMO.password}
              </li>
            </ul>
          </div>
        </motion.form>
      </div>

      {/* Decorative side */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 text-white">
        <span aria-hidden className="absolute -top-24 -right-12 w-96 h-96 rounded-full bg-white/15 blur-3xl animate-blob" />
        <span aria-hidden className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="relative h-full flex items-center justify-center p-10">
          <div className="max-w-sm text-center">
            <div className="inline-grid place-items-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur mb-5">
              <LogIn size={32} />
            </div>
            <p className="text-3xl font-black mb-2">أهلاً بك في لوحة المدرس</p>
            <p className="text-white/85 text-sm font-bold leading-relaxed">
              أدر كورساتك، بنوك الأسئلة، الامتحانات، الطلاب، الحضور، والمدفوعات من مكان واحد.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: typeof User;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-600 mr-1">*</span>}
      </label>
      <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition">
        <Icon size={14} className="text-ink-400 shrink-0" />
        {children}
      </div>
    </div>
  );
}
