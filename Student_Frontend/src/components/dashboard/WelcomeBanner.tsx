"use client";
import { motion } from "framer-motion";
import { GradCapIllustration } from "@/components/GradCapIllustration";

export function WelcomeBanner({ name = "أحمد" }: { name?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-100 via-brand-50 to-fuchsia-50 border border-brand-100 p-6 sm:p-8 mb-6"
    >
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 dots opacity-40" />

      <div className="relative grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        <div className="text-center sm:text-right order-2 sm:order-1 sm:col-start-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
            مرحباً بك {name}{" "}
            <motion.span
              animate={{ rotate: [0, 18, -10, 18, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block origin-bottom-right"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-sm text-ink-600 mt-2">
            استمر في التعلم، كل خطوة تقربك من هدفك
          </p>
        </div>

        <div className="order-1 sm:order-2 sm:col-start-1 sm:row-start-1 max-w-[220px] mx-auto sm:max-w-[260px] sm:mx-0">
          <div className="animate-float-slow">
            <GradCapIllustration />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
