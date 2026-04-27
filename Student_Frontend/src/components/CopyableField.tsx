"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

type Props = {
  label: string;
  value: string;
  mono?: boolean;
};

export function CopyableField({ label, value, mono }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-card/30"
    >
      <span className="text-xs font-bold text-ink-700">{label}</span>

      <div className="flex items-center gap-2">
        <span
          className={`text-base font-extrabold text-ink-900 select-all ${mono ? "font-mono tracking-wider" : "tracking-widest"}`}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label="نسخ"
          className="relative w-9 h-9 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 grid place-items-center transition"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="ok"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="text-emerald-600"
              >
                <Check size={16} strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span
                key="cp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-ink-500"
              >
                <Copy size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
