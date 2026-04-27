"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Construction, type LucideIcon } from "lucide-react";
import Link from "next/link";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  hints,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  hints?: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-10 text-center"
    >
      <span className="relative inline-grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
        <Icon size={28} />
        <span aria-hidden className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-900 grid place-items-center shadow-soft border-2 border-white">
          <Construction size={11} />
        </span>
      </span>
      <h2 className="mt-4 text-xl font-black text-ink-900">{title}</h2>
      <p className="text-[12px] text-ink-500 mt-1 max-w-md mx-auto">{description}</p>

      {hints && hints.length > 0 && (
        <div className="mt-5 max-w-md mx-auto bg-brand-50/60 border border-brand-100 rounded-xl p-4 text-right">
          <p className="text-[11px] font-extrabold text-brand-800 mb-2">سيتضمن هذا القسم:</p>
          <ul className="space-y-1.5 text-[12px] text-ink-700">
            {hints.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/dashboard"
        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
      >
        العودة إلى لوحة التحكم
        <ArrowLeft size={13} />
      </Link>
    </motion.div>
  );
}
