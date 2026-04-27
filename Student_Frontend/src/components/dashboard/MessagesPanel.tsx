"use client";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

type Msg = {
  name: string;
  preview: string;
  time: string;
  photo: string;
  unread?: boolean;
};

const messages: Msg[] = [
  {
    name: "أ. محمد الثناوي",
    preview: "تم رفع ملف المراجعة النهائية للفصل الثالث",
    time: "10:24 ص",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    unread: true,
  },
  {
    name: "د. سارة محمود",
    preview: "أحسنت يا أحمد على الواجب الأخير",
    time: "أمس",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    unread: true,
  },
  {
    name: "أ. منى أحمد",
    preview: "اللقاء القادم سيكون يوم الأحد بإذن الله",
    time: "السبت",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "م. عمر خالد",
    preview: "هل احتجت أي مساعدة في تمرين التصميم؟",
    time: "23 مايو",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

export function MessagesPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed top-[92px] inset-x-3 sm:absolute sm:top-12 sm:inset-x-auto sm:left-0 sm:w-[360px] origin-top bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden z-50"
    >
      <span className="hidden sm:block absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-brand-600" />
          <h3 className="text-sm font-extrabold text-ink-900">الرسائل</h3>
          <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">2</span>
        </div>
        <button className="text-[11px] font-bold text-brand-700 hover:underline">
          رسالة جديدة
        </button>
      </div>

      <motion.ul
        variants={stagger(0.05)}
        initial="hidden"
        animate="show"
        className="max-h-[360px] overflow-y-auto divide-y divide-slate-50"
      >
        {messages.map((m, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            whileHover={{ x: -3 }}
            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${m.unread ? "bg-brand-50/30" : ""} hover:bg-slate-50`}
          >
            <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
              {m.unread && (
                <span className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-extrabold text-ink-900 truncate">{m.name}</p>
                <span className="text-[10px] text-ink-400 shrink-0">{m.time}</span>
              </div>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${m.unread ? "text-ink-700 font-semibold" : "text-ink-500"}`}>
                {m.preview}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <a
        href="#"
        className="block text-center text-xs font-bold text-brand-700 hover:bg-brand-50 py-3 border-t border-slate-100 transition"
      >
        عرض كل الرسائل
      </a>
    </motion.div>
  );
}
