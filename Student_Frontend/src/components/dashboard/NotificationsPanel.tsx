"use client";
import { motion } from "framer-motion";
import { Bell, BookOpen, Trophy, Wallet, type LucideIcon } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

type Notif = {
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
  bg: string;
  fg: string;
  unread?: boolean;
};

const notifs: Notif[] = [
  {
    icon: BookOpen,
    title: "حصة جديدة متاحة",
    desc: "الرياضيات - الفصل الثالث",
    time: "منذ 5 دقائق",
    bg: "bg-brand-50",
    fg: "text-brand-700",
    unread: true,
  },
  {
    icon: Trophy,
    title: "حصلت على 50 نقطة",
    desc: "تهانينا! نتيجة اختبار الفيزياء",
    time: "منذ ساعة",
    bg: "bg-amber-50",
    fg: "text-amber-700",
    unread: true,
  },
  {
    icon: Wallet,
    title: "تم شحن رصيدك",
    desc: "أُضيف 100 ج.م إلى رصيدك",
    time: "أمس",
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    unread: true,
  },
  {
    icon: Bell,
    title: "تذكير بحصة قادمة",
    desc: "اللغة الإنجليزية الساعة 8 م",
    time: "منذ يومين",
    bg: "bg-sky-50",
    fg: "text-sky-700",
  },
];

export function NotificationsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed top-[92px] inset-x-3 sm:absolute sm:top-12 sm:inset-x-auto sm:left-0 sm:w-[360px] origin-top bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden z-50"
    >
      {/* arrow indicator */}
      <span className="hidden sm:block absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-600" />
          <h3 className="text-sm font-extrabold text-ink-900">الإشعارات</h3>
          <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">3</span>
        </div>
        <button className="text-[11px] font-bold text-brand-700 hover:underline">
          تحديد الكل كمقروء
        </button>
      </div>

      {/* list */}
      <motion.ul
        variants={stagger(0.05)}
        initial="hidden"
        animate="show"
        className="max-h-[360px] overflow-y-auto divide-y divide-slate-50"
      >
        {notifs.map((n, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            whileHover={{ x: -3 }}
            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${n.unread ? "bg-brand-50/30" : ""} hover:bg-slate-50`}
          >
            <div className={`w-9 h-9 shrink-0 rounded-xl ${n.bg} ${n.fg} grid place-items-center`}>
              <n.icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-ink-900 truncate">{n.title}</p>
              <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-2">{n.desc}</p>
              <p className="text-[10px] text-ink-400 mt-1">{n.time}</p>
            </div>
            {n.unread && (
              <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0 animate-pulse" />
            )}
          </motion.li>
        ))}
      </motion.ul>

      {/* footer */}
      <a
        href="#"
        className="block text-center text-xs font-bold text-brand-700 hover:bg-brand-50 py-3 border-t border-slate-100 transition"
      >
        عرض كل الإشعارات
      </a>
    </motion.div>
  );
}
