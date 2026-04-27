"use client";
import { motion } from "framer-motion";
import { TrendingUp, Atom } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Exam = {
  subject: string;
  description: string;
  month: string;
  year: string;
  bg: string;
  fg: string;
  icon: typeof TrendingUp;
};

const exams: Exam[] = [
  {
    subject: "الرياضيات",
    description: "اختبار شامل - الفصل الثالث",
    month: "مايو",
    year: "2024",
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    icon: TrendingUp,
  },
  {
    subject: "الفيزياء",
    description: "اختبار شامل - الفصل الثالث",
    month: "مايو",
    year: "2025",
    bg: "bg-brand-50",
    fg: "text-brand-700",
    icon: Atom,
  },
];

export function UpcomingExams() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-ink-900">الامتحانات القادمة</h3>
        <a href="#" className="text-[11px] font-bold text-brand-700 hover:underline">عرض الكل</a>
      </div>

      <motion.ul
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-3"
      >
        {exams.map((ex) => (
          <motion.li
            key={ex.subject + ex.year}
            variants={fadeUp}
            whileHover={{ x: -4 }}
            className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 shrink-0 rounded-xl ${ex.bg} ${ex.fg} grid place-items-center`}>
                <ex.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-ink-900 truncate">{ex.subject}</p>
                <p className="text-[11px] text-ink-500 mt-0.5 truncate">{ex.description}</p>
              </div>
            </div>
            <div className="text-left shrink-0">
              <p className="text-[11px] font-bold text-ink-800">{ex.month}</p>
              <p className="text-[11px] text-ink-500 mt-0.5">{ex.year}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
