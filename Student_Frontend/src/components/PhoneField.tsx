"use client";
import { useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Check, AlertCircle } from "lucide-react";

type Props = {
  label: string;
  hint?: ReactNode;
  value?: string;
  onValueChange?: (value: string, isValid: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

const VALID_PREFIXES = ["010", "011", "012", "015"] as const;

/** Egyptian mobile number validator: 11 digits starting with 010/011/012/015 */
export function validateEgyptPhone(v: string): { valid: boolean; reason?: string } {
  if (v.length === 0) return { valid: false };
  if (!/^\d+$/.test(v)) return { valid: false, reason: "أرقام فقط" };
  if (v.length < 11) return { valid: false, reason: `يتبقى ${11 - v.length} أرقام` };
  if (v.length > 11) return { valid: false, reason: "الرقم أطول من المطلوب" };
  const prefix = v.slice(0, 3);
  if (!VALID_PREFIXES.includes(prefix as (typeof VALID_PREFIXES)[number])) {
    return { valid: false, reason: "لازم يبدأ بـ 010 / 011 / 012 / 015" };
  }
  return { valid: true };
}

export function PhoneField({
  label,
  hint,
  value: controlled,
  onValueChange,
  required,
  placeholder = "01xxxxxxxxx",
  ...rest
}: Props) {
  const [internal, setInternal] = useState("");
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const value = controlled ?? internal;
  const check = useMemo(() => validateEgyptPhone(value), [value]);

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
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (controlled === undefined) setInternal(digits);
    onValueChange?.(digits, validateEgyptPhone(digits).valid);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-ink-800 mb-1.5">
        {label}
      </label>

      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all ${ringClass}`}
      >
        <input
          {...rest}
          dir="ltr"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={11}
          required={required}
          placeholder={placeholder}
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
          className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none text-left tracking-wider"
        />

        {/* right-side status icon (RTL => actually appears on the right visually) */}
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
                key="ph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={focused ? "text-brand-600" : "text-ink-400"}
              >
                <Phone size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      {/* progress bar: 11 dots */}
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 11 }).map((_, i) => {
          const filled = i < value.length;
          const invalidPrefix =
            i < 3 &&
            value.length >= 3 &&
            !VALID_PREFIXES.includes(value.slice(0, 3) as (typeof VALID_PREFIXES)[number]);
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{
                scale: filled ? 1.05 : 1,
                backgroundColor: invalidPrefix
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

      {/* message area */}
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
              تمام ✓ الرقم صحيح
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-ink-500"
            >
              {hint ?? "11 رقم يبدأ بـ 010 / 011 / 012 / 015"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
