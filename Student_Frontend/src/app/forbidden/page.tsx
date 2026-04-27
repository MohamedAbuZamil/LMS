"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Headset, Home, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-ink-900" dir="rtl">
      {/* decorative blobs */}
      <span aria-hidden className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-fuchsia-200/40 blur-3xl" />

      {/* Top bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
        <Logo />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] sm:text-sm font-extrabold text-ink-700 hover:text-brand-700 transition"
        >
          <Home size={15} />
          العودة للرئيسية
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-4 pb-16 text-center">
        <ForbiddenIllustration />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-8 text-2xl sm:text-3xl font-black text-ink-900"
        >
          عذرًا، لا يمكنك الوصول إلى هذه الصفحة
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-2 text-[13px] sm:text-sm text-ink-500"
        >
          ليس لديك صلاحية للوصول إلى هذا الرابط أو أن الرابط غير صحيح.
        </motion.p>

        {/* Support card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-6 mx-auto max-w-md bg-white/80 backdrop-blur border border-brand-100 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-soft"
        >
          <div className="text-right leading-tight">
            <p className="text-[12px] sm:text-[13px] font-extrabold text-ink-900">
              إذا كنت تعتقد أن هذا خطأ..
            </p>
            <p className="text-[11px] sm:text-[12px] text-ink-500 mt-0.5">
              يرجى التواصل مع الدعم الفني
            </p>
          </div>
          <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0">
            <Headset size={20} />
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-ink-800 text-sm font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
          >
            <ArrowRight size={15} />
            الرجوع للخلف
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-sm font-extrabold shadow-soft transition"
          >
            <Home size={15} />
            العودة للرئيسية
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

/* ============================================================ *
 *           Illustration: browser window + lock + 403          *
 * ============================================================ */
function ForbiddenIllustration() {
  return (
    <div className="relative mx-auto mt-6 sm:mt-10 w-full max-w-sm aspect-[5/4]">
      {/* tiny floating sparkles */}
      <Sparkle className="absolute top-2 left-6 text-brand-300" size={10} delay={0} />
      <Sparkle className="absolute top-10 right-2 text-brand-400" size={14} delay={0.6} />
      <Sparkle className="absolute bottom-10 left-0 text-brand-300" size={12} delay={1.2} />
      <Sparkle className="absolute bottom-3 right-6 text-fuchsia-300" size={10} delay={0.3} />
      <Sparkle className="absolute top-1/2 right-1 text-ink-300" size={8} delay={0.9} />

      {/* Browser window (back) */}
      <motion.div
        initial={{ opacity: 0, y: 14, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease: "easeOut" }}
        className="absolute top-2 right-4 sm:right-8 w-[78%] h-[78%] rounded-2xl bg-white shadow-card border border-slate-100 overflow-hidden"
      >
        {/* window controls */}
        <div className="flex items-center gap-1.5 px-3 h-7 bg-slate-50 border-b border-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        </div>
        {/* skeleton lines */}
        <div className="p-4 space-y-2">
          <div className="h-2.5 rounded-full bg-brand-100/80 w-[60%]" />
          <div className="h-2 rounded-full bg-slate-100 w-[85%]" />
          <div className="h-2 rounded-full bg-slate-100 w-[70%]" />
          <div className="h-2 rounded-full bg-slate-100 w-[78%]" />
        </div>
      </motion.div>

      {/* Big lock (front) */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18, type: "spring", stiffness: 220, damping: 22 }}
        className="absolute bottom-6 left-4 sm:left-10 w-[52%]"
      >
        <LockGlyph />
      </motion.div>

      {/* 403 badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 18 }}
        className="absolute bottom-2 right-1/3 sm:right-[38%] w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-card border-4 border-white"
      >
        <span className="text-2xl sm:text-3xl font-black tracking-wider tabular-nums">403</span>
      </motion.div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-auto drop-shadow-xl" aria-hidden>
      <defs>
        <linearGradient id="lockBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="lockShackle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="lockHighlight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* shackle */}
      <path
        d="M60 95 V70 a40 40 0 0 1 80 0 V95"
        fill="none"
        stroke="url(#lockShackle)"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* body */}
      <rect x="30" y="92" width="140" height="120" rx="22" fill="url(#lockBody)" />
      {/* highlight */}
      <rect x="30" y="92" width="140" height="60" rx="22" fill="url(#lockHighlight)" />

      {/* keyhole */}
      <circle cx="100" cy="148" r="14" fill="#3B0764" />
      <rect x="94" y="156" width="12" height="26" rx="4" fill="#3B0764" />
    </svg>
  );
}

function Sparkle({
  className = "",
  size = 10,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.1, 0.7] }}
      transition={{ duration: 2.4, delay, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      <ShieldAlert size={size} />
    </motion.span>
  );
}
