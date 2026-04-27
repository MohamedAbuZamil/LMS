"use client";
import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

type Props = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function PasswordField({ label, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-ink-800 mb-1.5">{label}</label>

      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all
          ${focused ? "border-brand-500 ring-4 ring-brand-100" : "border-slate-200 hover:border-slate-300"}`}
      >
        <input
          {...rest}
          type={show ? "text" : "password"}
          autoComplete="current-password"
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setCapsOn(false);
            rest.onBlur?.(e);
          }}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "إخفاء" : "إظهار"}
          className={`shrink-0 px-3 transition-colors ${focused ? "text-brand-600" : "text-ink-400"} hover:text-brand-700`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {show ? (
              <motion.span
                key="off"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <EyeOff size={16} />
              </motion.span>
            ) : (
              <motion.span
                key="on"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Eye size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <span className={`shrink-0 ps-3 ${focused ? "text-brand-600" : "text-ink-400"}`}>
          <Lock size={16} />
        </span>
      </div>

      <div className="min-h-[18px] mt-1.5 text-[11px]">
        <AnimatePresence>
          {capsOn && (
            <motion.p
              key="caps"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-amber-600 font-semibold inline-flex items-center gap-1"
            >
              <AlertTriangle size={12} />
              Caps Lock مفعّل
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
