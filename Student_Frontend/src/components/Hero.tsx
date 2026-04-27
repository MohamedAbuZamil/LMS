"use client";
import { motion } from "framer-motion";
import { Play, BookOpen, Sparkles } from "lucide-react";
import { HeroIllustration } from "./HeroIllustration";
import { fadeUp, stagger } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-radial">
      {/* animated blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-300/40 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-fuchsia-300/30 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />

      {/* decorative dots */}
      <div className="pointer-events-none absolute top-10 right-6 w-28 h-28 dots opacity-60" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-24 h-24 dots opacity-40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">
          {/* Text */}
          <motion.div
            className="order-1 text-center lg:text-right"
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 chip mb-5">
              <Sparkles size={14} className="animate-sparkle" />
              منصة تعليمية رقم 1 في الوطن العربي
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-ink-900"
            >
              تعلَّم العلم،
              <br />
              وابنِ{" "}
              <span className="relative gradient-text inline-block">
                مستقبلك
                <motion.span
                  className="absolute -bottom-2 right-0 h-2 bg-brand-300/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-base sm:text-lg text-ink-600 max-w-xl mx-auto lg:mx-0 leading-loose"
            >
              منصة LMS التعليمية تقدم لك أفضل الكورسات بأسلوب بسيط وعملي مع نخبة من أفضل المدرسين.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <motion.a
                href="#courses"
                className="btn-primary shimmer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                ابدأ الآن مجاناً
              </motion.a>
              <motion.a
                href="#categories"
                className="btn-outline"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <BookOpen size={18} />
                تصفح الكورسات
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <div className="order-2 relative">
            <motion.div
              className="relative mx-auto max-w-md lg:max-w-none"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="animate-float-slow">
                <HeroIllustration />
              </div>

              {/* sparkles around illustration */}
              <Sparkles className="absolute top-10 left-6 text-amber-400 animate-sparkle" size={20} />
              <Sparkles className="absolute bottom-32 right-2 text-brand-400 animate-sparkle" size={16} style={{ animationDelay: "0.6s" }} />
              <Sparkles className="absolute top-1/2 left-2 text-pink-400 animate-sparkle" size={14} style={{ animationDelay: "1.2s" }} />

              {/* progress card */}
              <motion.div
                className="absolute top-6 right-2 sm:right-6 bg-white rounded-2xl shadow-card p-3 sm:p-4 flex items-center gap-3 border border-slate-100"
                initial={{ opacity: 0, x: 30, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ y: -4, scale: 1.04 }}
              >
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#EDE9FE" strokeWidth="4" />
                    <motion.circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke="#7C3AED" strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.75 }}
                      transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-[11px] font-extrabold text-brand-700">
                    75%
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-ink-500">تقدمك في التعلم</p>
                  <p className="text-sm font-extrabold text-ink-900">75%</p>
                </div>
              </motion.div>

              {/* courses count */}
              <motion.div
                className="absolute top-40 left-0 sm:left-2 bg-white rounded-2xl shadow-card p-3 flex items-center gap-3 border border-slate-100"
                initial={{ opacity: 0, x: -30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                whileHover={{ y: -4, scale: 1.04 }}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-100 grid place-items-center text-brand-700">
                  <BookOpen size={18} />
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-ink-500">الكورسات المتاحة</p>
                  <p className="text-sm font-extrabold text-ink-900">12</p>
                </div>
              </motion.div>

              {/* play button */}
              <motion.button
                className="absolute top-2 left-2 sm:left-8 w-12 h-12 rounded-full bg-brand-600 text-white grid place-items-center shadow-soft"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 250 }}
                whileHover={{ scale: 1.15, rotate: 8 }}
                whileTap={{ scale: 0.92 }}
              >
                <span className="absolute inset-0 rounded-full bg-brand-500/40 animate-ping" />
                <Play size={20} fill="white" className="relative" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
