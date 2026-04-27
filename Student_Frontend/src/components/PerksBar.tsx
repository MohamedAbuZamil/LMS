"use client";
import { motion } from "framer-motion";
import { LineChart, PlayCircle, ClipboardCheck, BadgeCheck } from "lucide-react";
import { popIn, stagger, viewportOnce } from "@/lib/motion";

const perks = [
  {
    icon: LineChart,
    title: "متابعة سهلة",
    desc: "تابع تقدمك الدراسي بسهولة",
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    icon: PlayCircle,
    title: "كورسات مميزة",
    desc: "تعلم من أفضل المدرسين",
    color: "text-brand-600 bg-brand-100",
  },
  {
    icon: ClipboardCheck,
    title: "اختبارات وتقييمات",
    desc: "اختبر نفسك وتابع تقدمك",
    color: "text-orange-600 bg-orange-100",
  },
  {
    icon: BadgeCheck,
    title: "شهادات معتمدة",
    desc: "احصل على شهادات معتمدة",
    color: "text-pink-600 bg-pink-100",
  },
];

export function PerksBar() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {perks.map((p) => (
          <motion.div
            key={p.title}
            variants={popIn}
            whileHover={{ y: -6 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-card/40 hover:shadow-soft p-4 flex items-center gap-3 transition"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 shrink-0 rounded-xl ${p.color} grid place-items-center`}
            >
              <p.icon size={22} />
            </motion.div>
            <div>
              <h3 className="font-extrabold text-sm text-ink-900">{p.title}</h3>
              <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
