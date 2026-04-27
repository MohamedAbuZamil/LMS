"use client";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { BookOpen, PlayCircle, CalendarDays, ClipboardList, Trophy, type LucideIcon } from "lucide-react";
import { popIn, stagger, viewportOnce } from "@/lib/motion";

type Stat = {
  icon: LucideIcon;
  value: number;
  label: string;
  link: string;
  bg: string;
  fg: string;
};

const stats: Stat[] = [
  { icon: BookOpen, value: 8, label: "كورساتي", link: "عرض الكل", bg: "bg-brand-50", fg: "text-brand-700" },
  { icon: PlayCircle, value: 24, label: "الحصص التي تم مشاهدتها", link: "عرض التفاصيل", bg: "bg-rose-50", fg: "text-rose-600" },
  { icon: CalendarDays, value: 6, label: "الحصص القادمة", link: "عرض الجدول", bg: "bg-sky-50", fg: "text-sky-600" },
  { icon: ClipboardList, value: 2, label: "الامتحانات القادمة", link: "عرض الامتحانات", bg: "bg-amber-50", fg: "text-amber-600" },
  { icon: Trophy, value: 320, label: "نقاطي", link: "لوحة الشرف", bg: "bg-emerald-50", fg: "text-emerald-600" },
];

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    if (inView) {
      const c = animate(count, to, { duration: 1.4, ease: "easeOut" });
      return () => c.stop();
    }
  }, [inView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function StatsRow() {
  return (
    <motion.div
      variants={stagger(0.07)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={popIn}
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-4 transition"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 shrink-0 rounded-xl ${s.bg} ${s.fg} grid place-items-center`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-ink-900 leading-none">
                <Counter to={s.value} />
              </p>
              <p className="text-[11px] text-ink-500 mt-1.5">{s.label}</p>
            </div>
          </div>
          <a href="#" className={`mt-3 inline-block text-[11px] font-bold ${s.fg} hover:underline`}>
            {s.link} ←
          </a>
        </motion.div>
      ))}
    </motion.div>
  );
}
