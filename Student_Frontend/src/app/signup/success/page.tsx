"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ShieldCheck, LogIn, Home } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PerksBar } from "@/components/PerksBar";
import { Confetti } from "@/components/Confetti";
import { CopyableField } from "@/components/CopyableField";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

function SuccessContent() {
  const params = useSearchParams();
  const code = params.get("code") ?? "2600000";
  const password = params.get("pw") ?? "password123";

  return (
    <main className="bg-slate-50/40">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 sm:p-10 text-center"
        >
          {/* Check + confetti */}
          <div className="relative w-fit mx-auto">
            <Confetti count={26} />

            {/* outer rings */}
            <motion.span
              className="absolute inset-0 rounded-full bg-brand-200/50 blur-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1.4, opacity: [0, 0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-brand-700 ring-8 ring-brand-100 grid place-items-center shadow-soft"
            >
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.55, type: "spring", stiffness: 350 }}
              >
                <Check size={56} strokeWidth={3} className="text-white" />
              </motion.span>
            </motion.div>
          </div>

          {/* title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-2xl sm:text-3xl font-extrabold text-ink-900"
          >
            تم إنشاء حسابك بنجاح!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-2 text-sm text-ink-500"
          >
            مرحباً بك في منصة LMS التعليمية
          </motion.p>

          {/* credentials box */}
          <motion.div
            variants={stagger(0.08, 0.9)}
            initial="hidden"
            animate="show"
            className="mt-7 text-right rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4 sm:p-5 space-y-3"
          >
            <motion.p variants={fadeUp} className="text-xs sm:text-sm text-ink-700 leading-relaxed text-center">
              تم إنشاء حسابك بنجاح، استخدم بياناتك التالية لتسجيل الدخول والاستمتاع برحلتك التعليمية.
            </motion.p>
            <motion.div variants={fadeUp}>
              <CopyableField label="كود الطالب" value={code} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <CopyableField label="كلمة المرور" value={password} mono />
            </motion.div>
          </motion.div>

          {/* warning box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 1.1 }}
            className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 flex items-start gap-3 text-right"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white grid place-items-center text-brand-600 shadow-card/40">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-800">
                يرجى الاحتفاظ بهذه البيانات
              </h3>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                ستحتاج إلى كود الطالب وكلمة المرور لتسجيل الدخول في كل مرة.
              </p>
            </div>
          </motion.div>

          {/* actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 1.25 }}
            className="mt-6 space-y-3"
          >
            <motion.a
              href="/login"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-soft shimmer transition-colors"
            >
              <LogIn size={18} />
              الذهاب إلى تسجيل الدخول
            </motion.a>
            <a
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-brand-700 hover:bg-brand-50 transition"
            >
              <Home size={16} />
              العودة إلى الصفحة الرئيسية
            </a>
          </motion.div>
        </motion.div>
      </section>

      <PerksBar />
      <Footer />
    </main>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
