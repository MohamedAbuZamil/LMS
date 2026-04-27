"use client";
import { motion } from "framer-motion";
import { UserCheck, Layers3, LineChart, BadgeCheck, Clock } from "lucide-react";
import { popIn, stagger, fadeUp, viewportOnce } from "@/lib/motion";

const features = [
  { icon: UserCheck, title: "مدرسين متخصصين", desc: "تعلم من أفضل الخبراء في مجالاتهم", color: "text-brand-600 bg-brand-100" },
  { icon: Layers3, title: "كورسات منظمة", desc: "محتوى شامل بخطوات واضحة وسلسة", color: "text-emerald-600 bg-emerald-100" },
  { icon: LineChart, title: "متابعة تقدمك", desc: "تقارير تفصيلية لمتابعة مستواك أولاً بأول", color: "text-orange-600 bg-orange-100" },
  { icon: BadgeCheck, title: "شهادات معتمدة", desc: "احصل على شهادات معتمدة تثبت مهارتك", color: "text-pink-600 bg-pink-100" },
  { icon: Clock, title: "تعلم في أي وقت", desc: "وفي أي مكان بأسلوب مرن يناسبك", color: "text-sky-600 bg-sky-100" },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="text-center mb-10"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.1)}
      >
        <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold text-ink-900">
          لماذا تختار LMS؟
        </motion.h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={popIn}
            whileHover={{ y: -6 }}
            className="text-center px-3 py-5 rounded-2xl hover:bg-white hover:shadow-card transition"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`w-14 h-14 rounded-2xl ${f.color} grid place-items-center mx-auto mb-3`}
            >
              <f.icon size={24} />
            </motion.div>
            <h3 className="font-extrabold text-sm text-ink-900">{f.title}</h3>
            <p className="text-xs text-ink-500 mt-2 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
