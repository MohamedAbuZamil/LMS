"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { login } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const session = login(username, password);
      if (!session) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
        setBusy(false);
        return;
      }
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-slate-50">
      {/* decorative blobs */}
      <span aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-brand-200/50 blur-3xl animate-blob" />
      <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-fuchsia-200/40 blur-3xl animate-blob" style={{ animationDelay: "2.5s" }} />

      <div className="relative grid lg:grid-cols-2 min-h-screen">
        {/* Left: visual */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 text-center">
          <Logo />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 max-w-md"
          >
            <div className="relative mx-auto w-72 h-72">
              <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-300/50 to-brand-500/50 blur-2xl" />
              <div className="relative w-full h-full rounded-3xl bg-white shadow-card border border-slate-100 flex flex-col items-center justify-center p-8">
                <span className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                  <ShieldCheck size={36} />
                </span>
                <p className="mt-4 text-lg font-black text-ink-900">لوحة تحكم آمنة</p>
                <p className="text-[12px] text-ink-500 mt-1">إدارة المدرسين والكورسات والسكرتارية</p>
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-black text-ink-900">
              مرحباً بك في <span className="gradient-text">LMS Admin</span>
            </h2>
            <p className="text-[13px] text-ink-500 mt-2">
              سجّل دخولك للوصول إلى أدوات إدارة المنصة الكاملة.
            </p>
          </motion.div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-7"
          >
            <div className="lg:hidden mb-6 flex justify-center">
              <Logo />
            </div>

            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                <Lock size={18} />
              </span>
              <div>
                <h1 className="text-lg font-black text-ink-900">تسجيل الدخول</h1>
                <p className="text-[11px] text-ink-500">أدخل بياناتك للوصول إلى لوحة التحكم</p>
              </div>
            </div>

            {/* Username */}
            <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">اسم المستخدم</label>
            <div className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${error ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"}`}>
              <User size={15} className="text-ink-400 shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                dir="ltr"
                className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
              />
            </div>

            {/* Password */}
            <label className="block text-[11px] font-extrabold text-ink-700 mt-4 mb-1.5">كلمة المرور</label>
            <div className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${error ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"}`}>
              <Lock size={15} className="text-ink-400 shrink-0" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
                className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="text-ink-400 hover:text-ink-700 transition"
                aria-label="إظهار/إخفاء"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between mt-3">
              <label className="inline-flex items-center gap-2 text-[11px] text-ink-700 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 accent-brand-600"
                />
                تذكّرني
              </label>
              <button type="button" className="text-[11px] font-extrabold text-brand-700 hover:underline">
                نسيت كلمة المرور؟
              </button>
            </div>

            {error && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-rose-700">
                <AlertTriangle size={13} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold shadow-soft transition ${
                busy ? "bg-slate-100 text-ink-400 cursor-not-allowed" : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
              }`}
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  تسجيل الدخول
                  <ArrowLeft size={13} />
                </>
              )}
            </button>

            <div className="mt-5 bg-brand-50/60 border border-brand-100 rounded-xl p-3 flex items-start gap-2">
              <Sparkles size={13} className="text-brand-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-ink-700 leading-relaxed">
                للتجربة استخدم: <span className="font-extrabold">admin / admin</span>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
