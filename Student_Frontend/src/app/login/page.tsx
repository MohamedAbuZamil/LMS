"use client";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoginIllustration } from "@/components/LoginIllustration";
import { LoginForm } from "@/components/LoginForm";
import { PerksBar } from "@/components/PerksBar";

export default function LoginPage() {
  return (
    <main className="bg-slate-50/40">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-100/70 via-brand-50/40 to-transparent">
        <div className="pointer-events-none absolute -top-24 -right-32 w-96 h-96 rounded-full bg-brand-300/40 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-20 -left-24 w-80 h-80 rounded-full bg-fuchsia-300/30 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="pointer-events-none absolute top-10 right-10 w-32 h-32 dots opacity-50" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="order-1 text-center lg:text-right"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-ink-900">
                <span className="gradient-text">أهلاً بعودتك!</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-ink-600">
                سجّل الدخول بكود الطالب وكلمة المرور لمتابعة رحلتك التعليمية
              </p>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: 72 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="block h-1 bg-brand-500 rounded-full mt-5 mx-auto lg:ms-auto lg:mr-0"
              />
            </motion.div>

            <motion.div
              className="order-2 mx-auto max-w-md w-full"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="animate-float-slow">
                <LoginIllustration />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 pb-12">
        <LoginForm />
      </section>

      <PerksBar />
      <Footer />
    </main>
  );
}
