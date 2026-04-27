"use client";
import { motion } from "framer-motion";
import { Code2, Sigma, Languages, Atom, Palette, Briefcase, Microscope } from "lucide-react";
import { popIn, stagger, viewportOnce, fadeUp } from "@/lib/motion";

const cats = [
  { icon: Code2, name: "برمجة", count: 32, color: "bg-brand-100 text-brand-700" },
  { icon: Sigma, name: "رياضيات", count: 28, color: "bg-emerald-100 text-emerald-700" },
  { icon: Languages, name: "اللغة الإنجليزية", count: 24, color: "bg-orange-100 text-orange-700" },
  { icon: Atom, name: "فيزياء", count: 18, color: "bg-amber-100 text-amber-700" },
  { icon: Palette, name: "تصميم", count: 20, color: "bg-pink-100 text-pink-700" },
  { icon: Briefcase, name: "إدارة أعمال", count: 16, color: "bg-sky-100 text-sky-700" },
  { icon: Microscope, name: "أحياء", count: 12, color: "bg-rose-100 text-rose-700" },
];

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="text-center mb-10"
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.1)}
      >
        <motion.p variants={fadeUp} className="text-xs font-bold text-brand-600 mb-2">
          تصفح حسب المادة
        </motion.p>
        <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold text-ink-900">
          اختر المجال الذي يهمك
        </motion.h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
        variants={stagger(0.06)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
      >
        {cats.map((c) => (
          <motion.button
            key={c.name}
            variants={popIn}
            whileHover={{ y: -6, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 text-center shadow-card/40 hover:shadow-soft hover:border-brand-200 transition-colors"
          >
            <motion.div
              whileHover={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-xl ${c.color} grid place-items-center mx-auto mb-3`}
            >
              <c.icon size={22} />
            </motion.div>
            <p className="font-extrabold text-sm text-ink-900">{c.name}</p>
            <p className="text-[11px] text-ink-500 mt-1">{c.count} كورس</p>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ delay: 0.3 }}
      >
        <motion.a
          href="#courses"
          className="btn-outline"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          عرض جميع المواد
        </motion.a>
      </motion.div>
    </section>
  );
}
