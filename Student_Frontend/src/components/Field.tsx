"use client";
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type CommonProps = {
  label: string;
  icon?: ReactNode;
  hint?: string;
};

export function Field({
  label,
  icon,
  hint,
  ...props
}: CommonProps & InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-ink-800 mb-1.5">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all
          ${focused ? "border-brand-500 ring-4 ring-brand-100" : "border-slate-200 hover:border-slate-300"}`}
      >
        <input
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className="w-full bg-transparent rounded-xl px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none"
        />
        {icon && (
          <span
            className={`shrink-0 px-3 transition-colors ${focused ? "text-brand-600" : "text-ink-400"}`}
          >
            {icon}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-ink-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export function SelectField({
  label,
  icon,
  hint,
  children,
  ...props
}: CommonProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-ink-800 mb-1.5">
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all
          ${focused ? "border-brand-500 ring-4 ring-brand-100" : "border-slate-200 hover:border-slate-300"}`}
      >
        <span className="shrink-0 ps-3 text-ink-400 pointer-events-none">
          <ChevronDown size={16} />
        </span>
        <select
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className="w-full appearance-none bg-transparent rounded-xl px-3 py-2.5 text-sm text-ink-900 outline-none"
        >
          {children}
        </select>
        {icon && (
          <span
            className={`shrink-0 px-3 transition-colors ${focused ? "text-brand-600" : "text-ink-400"}`}
          >
            {icon}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-ink-500 mt-1.5">{hint}</p>}
    </div>
  );
}
