"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const overall = 72;
const subjects = [
  { name: "الرياضيات", value: 85, color: "bg-emerald-500" },
  { name: "الفيزياء", value: 75, color: "bg-brand-500" },
  { name: "اللغة الإنجليزية", value: 65, color: "bg-orange-500" },
  { name: "الكيمياء", value: 60, color: "bg-amber-500" },
];

function Donut({ percent }: { percent: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-32 h-32">
      <svg ref={ref} viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EDE9FE" strokeWidth="10" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#7C3AED"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: inView ? c - (percent / 100) * c : c }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-ink-900">{percent}%</p>
        </div>
      </div>
    </div>
  );
}

export function PerformanceCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-5">
      <h3 className="text-sm font-extrabold text-ink-900 mb-4">أدائي في المواد</h3>

      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center shrink-0">
          <Donut percent={overall} />
          <p className="text-[11px] text-ink-500 mt-2">معدل التقدم العام</p>
        </div>

        <motion.ul
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex-1 space-y-3 min-w-0"
        >
          {subjects.map((s) => (
            <motion.li key={s.name} variants={fadeUp}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-ink-700 truncate">{s.name}</span>
                <span className="font-extrabold text-ink-900">{s.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.value}%` }}
                  viewport={viewportOnce}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`h-full rounded-full ${s.color}`}
                />
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <a href="#" className="block text-[11px] font-bold text-brand-700 hover:underline mt-4 text-center">
        عرض كل المواد ←
      </a>
    </div>
  );
}
