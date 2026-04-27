"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Loader2, Check, AlertCircle } from "lucide-react";
import { CodeField, validateStudentCode } from "./CodeField";
import { PasswordField } from "./PasswordField";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Status = "idle" | "loading" | "done" | "error";

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStudentCode(code).valid) {
      setErrorMsg("كود الطالب غير صحيح");
      setStatus("error");
      return;
    }
    if (pw.length < 4) {
      setErrorMsg("كلمة المرور قصيرة");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    // simulate auth
    setTimeout(() => {
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 700);
    }, 1100);
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 sm:p-8"
    >
      {/* header */}
      <motion.div
        className="flex items-center justify-center gap-2 pb-5 mb-6 border-b border-slate-100"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-9 h-9 rounded-full bg-brand-100 grid place-items-center text-brand-700">
          <LogIn size={18} />
        </div>
        <h2 className="text-base font-extrabold text-ink-900">تسجيل الدخول</h2>
      </motion.div>

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <CodeField
            label="كود الطالب"
            value={code}
            onValueChange={(v) => {
              setCode(v);
              if (status === "error") setStatus("idle");
            }}
            required
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <PasswordField
            label="كلمة المرور"
            placeholder="••••••••"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            required
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-300 accent-brand-600"
            />
            تذكرني
          </label>
          <a href="#" className="text-xs font-bold text-brand-700 hover:underline">
            هل نسيت كلمة المرور؟
          </a>
        </motion.div>
      </motion.div>

      {/* error banner */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm"
          >
            <AlertCircle size={16} />
            <span className="font-semibold">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* submit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6"
      >
        <motion.button
          type="submit"
          disabled={status === "loading" || status === "done"}
          whileHover={status === "idle" || status === "error" ? { scale: 1.02 } : undefined}
          whileTap={status === "idle" || status === "error" ? { scale: 0.98 } : undefined}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white shadow-soft transition-colors
            ${status === "done" ? "bg-emerald-600" : "bg-brand-600 hover:bg-brand-700"} ${status === "idle" || status === "error" ? "shimmer" : ""}`}
        >
          {(status === "idle" || status === "error") && (
            <>
              <LogIn size={18} />
              تسجيل الدخول
            </>
          )}
          {status === "loading" && (
            <>
              <Loader2 size={18} className="animate-spin" />
              جارٍ التحقق…
            </>
          )}
          {status === "done" && (
            <>
              <Check size={18} />
              مرحباً بعودتك
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-ink-500 mt-4">
          ليس لديك حساب؟{" "}
          <a href="/signup" className="font-bold text-brand-700 hover:underline">
            إنشاء حساب جديد
          </a>
        </p>
      </motion.div>
    </motion.form>
  );
}
