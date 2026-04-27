"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
// Right-to-left day order in chart matches RTL reading
const data = [25, 35, 70, 95, 40, 50, 30];

export function WeekChart() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const w = 320;
  const h = 160;
  const padX = 16;
  const padY = 16;
  const max = 100;
  const stepX = (w - padX * 2) / (data.length - 1);
  // RTL: highest x = first index
  const points = data.map((v, i) => {
    const x = w - padX - i * stepX;
    const y = padY + ((max - v) / max) * (h - padY * 2);
    return { x, y, v };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    `M ${points[0].x},${h - padY} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${h - padY} Z`;

  const yAxis = [0, 20, 40, 60, 80, 100];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-5">
      <h3 className="text-sm font-extrabold text-ink-900 mb-4">الحصص المشاهدة</h3>

      <div className="flex gap-2">
        {/* y-axis labels (left in RTL flow but visually on left side) */}
        <div className="flex flex-col-reverse justify-between text-[10px] text-ink-400 py-1">
          {yAxis.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>

        <svg ref={ref} viewBox={`0 0 ${w} ${h}`} className="flex-1 h-40">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* grid */}
          {yAxis.map((v) => {
            const y = padY + ((max - v) / max) * (h - padY * 2);
            return (
              <line
                key={v}
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="#F1F5F9"
                strokeDasharray="3 4"
              />
            );
          })}

          {/* area */}
          <motion.path
            d={areaPath}
            fill="url(#areaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          />

          {/* line */}
          <motion.polyline
            points={polyline}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />

          {/* dots */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#fff"
              stroke="#7C3AED"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: inView ? 1 : 0 }}
              transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 400 }}
            />
          ))}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-ink-500 text-center">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <a href="#" className="block text-[11px] font-bold text-brand-700 hover:underline mt-3 text-center">
        عرض التقرير الكامل ←
      </a>
    </div>
  );
}
