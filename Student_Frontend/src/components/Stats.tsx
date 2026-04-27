"use client";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Users, BookOpen, GraduationCap, Layers, Star, type LucideIcon } from "lucide-react";
import { stagger, popIn, viewportOnce } from "@/lib/motion";

type Stat = {
  icon: LucideIcon;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color: string;
};

const stats: Stat[] = [
  { icon: Users, value: 12, prefix: "+", suffix: "K", label: "طالب وطالبة", color: "text-emerald-500 bg-emerald-50" },
  { icon: BookOpen, value: 150, prefix: "+", label: "كورس تعليمي", color: "text-brand-600 bg-brand-50" },
  { icon: GraduationCap, value: 45, prefix: "+", label: "مدرس محترف", color: "text-orange-500 bg-orange-50" },
  { icon: Layers, value: 20, prefix: "+", label: "مادة تعليمية", color: "text-sky-500 bg-sky-50" },
  { icon: Star, value: 95, suffix: "%", label: "نسبة رضا الطلاب", color: "text-pink-500 bg-pink-50" },
];

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 1.6, ease: "easeOut" });
      return () => controls.stop();
    }
  }, [inView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
      <motion.div
        className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={popIn} className="flex items-center gap-3 px-2">
              <div className={`w-11 h-11 rounded-xl grid place-items-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-ink-900 leading-none">
                  <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="text-xs text-ink-500 mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
