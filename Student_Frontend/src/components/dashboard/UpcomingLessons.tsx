"use client";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Lesson = {
  subject: string;
  teacher: string;
  when: string;
  date: string;
  color: string;
};

const lessons: Lesson[] = [
  { subject: "الرياضيات", teacher: "أ. محمد الثناوي", when: "اليوم", date: "04:00 م", color: "from-brand-500 to-brand-700" },
  { subject: "الفيزياء", teacher: "أ. أحمد سعيد", when: "غداً", date: "06:00 م", color: "from-emerald-500 to-emerald-700" },
  { subject: "اللغة الإنجليزية", teacher: "أ. سارة أحمد", when: "25 مايو", date: "08:00 م", color: "from-sky-500 to-indigo-600" },
];

export function UpcomingLessons() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-ink-900">الحصص القادمة</h3>
        <a href="#" className="text-[11px] font-bold text-brand-700 hover:underline">عرض الكل</a>
      </div>

      <motion.ul
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-3"
      >
        {lessons.map((l) => (
          <motion.li
            key={l.subject + l.date}
            variants={fadeUp}
            whileHover={{ x: -4 }}
            className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${l.color} grid place-items-center text-white shadow-soft`}>
                <Video size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-ink-900 truncate">{l.subject}</p>
                <p className="text-[11px] text-ink-500 mt-0.5 truncate">{l.teacher}</p>
              </div>
            </div>
            <div className="text-left shrink-0">
              <p className="text-[11px] font-bold text-brand-700">{l.when}</p>
              <p className="text-[11px] text-ink-500 mt-0.5">{l.date}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
