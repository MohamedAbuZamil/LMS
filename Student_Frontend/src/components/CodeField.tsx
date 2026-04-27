"use client";
import { useMemo, useState, type InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IdCard, Check, AlertCircle } from "lucide-react";

type Props = {
  label: string;
  value?: string;
  onValueChange?: (value: string, isValid: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export const STUDENT_CODE_LENGTH = 7;

/** Student code = 7 digits starting with "26" */
export function validateStudentCode(v: string): { valid: boolean; reason?: string } {
  if (v.length === 0) return { valid: false };
  if (!/^\d+$/.test(v)) return { valid: false, reason: "أرقام فقط" };
  if (v.length < STUDENT_CODE_LENGTH) return { valid: false, reason: `يتبقى ${STUDENT_CODE_LENGTH - v.length} أرقام` };
  if (v.length > STUDENT_CODE_LENGTH) return { valid: false, reason: "الكود أطول من المطلوب" };
  if (!v.startsWith("26")) return { valid: false, reason: "كود الطالب يبدأ بـ 26" };
  return { valid: true };
}

export function CodeField({
  label,
  value: controlled,
  onValueChange,
  required,
  ...rest
}: Props) {
  const [internal, setInternal] = useState("");
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const value = controlled ?? internal;
  const check = useMemo(() => validateStudentCode(value), [value]);

  const showError = touched && !focused && value.length > 0 && !check.valid;
  const showSuccess = check.valid;

  const ringClass = showError
    ? "border-rose-400 ring-4 ring-rose-100"
    : showSuccess
      ? "border-emerald-400 ring-4 ring-emerald-100"
      : focused
        ? "border-brand-500 ring-4 ring-brand-100"
        : "border-slate-200 hover:border-slate-300";

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, STUDENT_CODE_LENGTH);
    if (controlled === undefined) setInternal(digits);
    onValueChange?.(digits, validateStudentCode(digits).valid);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-ink-800 mb-1.5">{label}</label>

      <div className={`relative flex items-center rounded-xl border bg-white transition-all ${ringClass}`}>
        <input
          {...rest}
          dir="ltr"
          inputMode="numeric"
          autoComplete="username"
          maxLength={STUDENT_CODE_LENGTH}
          required={required}
          placeholder="2600000"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setTouched(true);
            rest.onBlur?.(e);
          }}
          className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none text-left tracking-[0.3em] font-mono"
        />
        <span className="shrink-0 px-3 relative w-10 h-10 grid place-items-center">
          <AnimatePresence mode="wait" initial={false}>
            {showSuccess ? (
              <motion.span
                key="ok"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="text-emerald-600"
              >
                <Check size={18} strokeWidth={3} />
              </motion.span>
            ) : showError ? (
              <motion.span
                key="err"
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: [0, -3, 3, -2, 2, 0] }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.4 }}
                className="text-rose-500"
              >
                <AlertCircle size={18} />
              </motion.span>
            ) : (
              <motion.span
                key="ic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={focused ? "text-brand-600" : "text-ink-400"}
              >
                <IdCard size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      {/* 6-dot progress */}
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 6 }).map((_, i) => {
          const filled = i < value.length;
          const wrongPrefix =
            i < 2 && value.length >= 2 && !value.startsWith("26");
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{
                scale: filled ? 1.05 : 1,
                backgroundColor: wrongPrefix
                  ? "#F43F5E"
                  : filled
                    ? check.valid
                      ? "#10B981"
                      : "#7C3AED"
                    : "#E2E8F0",
              }}
              transition={{ duration: 0.2 }}
              className="h-1.5 flex-1 rounded-full"
            />
          );
        })}
      </div>

      <div className="min-h-[18px] mt-1.5 text-[11px]">
        <AnimatePresence mode="wait" initial={false}>
          {showError && check.reason ? (
            <motion.p
              key="err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-rose-600 font-semibold"
            >
              {check.reason}
            </motion.p>
          ) : showSuccess ? (
            <motion.p
              key="ok"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-600 font-semibold"
            >
              تمام ✓
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-ink-500"
            >
              {STUDENT_CODE_LENGTH} أرقام يبدؤون بـ 26
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
