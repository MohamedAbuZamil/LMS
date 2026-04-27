import { GraduationCap } from "lucide-react";

export function Logo({ withText = true, size = 40 }: { withText?: boolean; size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="relative inline-grid place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft"
        style={{ width: size, height: size }}
      >
        <GraduationCap size={Math.round(size * 0.55)} />
      </span>
      {withText && (
        <div className="leading-none">
          <p className="text-[15px] font-black text-ink-900">لوحة المدرس</p>
          <p className="text-[10px] font-extrabold text-brand-700 mt-0.5">LMS Teacher</p>
        </div>
      )}
    </div>
  );
}
