"use client";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 px-6 sm:px-10 py-10 sm:py-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7 }}
      >
        {/* animated blobs */}
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/10 blur-2xl animate-blob" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-fuchsia-400/20 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 dots opacity-20" />

        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-3 items-center gap-6"
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {/* graduation cluster */}
          <motion.div variants={fadeUp} className="hidden md:flex items-end gap-2 justify-start">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur grid place-items-center text-white"
            >
              <GraduationCap size={40} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur grid place-items-center text-white"
            >
              <BookOpen size={26} />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Sparkles size={14} className="animate-sparkle" />
              انضم لآلاف الطلاب
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">ابدأ رحلتك التعليمية الآن</h3>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              سجّل الآن وانضم إلى آلاف الطلاب الذين يطورون مهاراتهم معنا.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center md:justify-end">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="bg-white text-brand-700 hover:bg-brand-50 font-bold rounded-xl px-5 py-3 inline-flex items-center justify-center transition shimmer"
            >
              تسجيل دخول
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="bg-brand-900/40 hover:bg-brand-900/60 ring-1 ring-white/30 text-white font-bold rounded-xl px-5 py-3 inline-flex items-center justify-center transition"
            >
              إنشاء حساب
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
