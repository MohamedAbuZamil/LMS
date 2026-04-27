"use client";
import { motion } from "framer-motion";
import { ChevronLeft, type LucideIcon } from "lucide-react";

type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  icon: LucideIcon;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
};

export function PageHeader({ title, icon: Icon, crumbs = [], actions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 mb-5"
    >
      <div className="flex-1 min-w-0">{actions}</div>

      <div className="text-right shrink-0">
        <div className="flex items-center justify-end gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink-900">{title}</h1>
          <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 grid place-items-center">
            <Icon size={18} />
          </span>
        </div>
        {crumbs.length > 0 && (
          <nav className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-500">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronLeft size={12} className="text-ink-300" />}
                {c.href ? (
                  <a href={c.href} className="hover:text-brand-700 transition">{c.label}</a>
                ) : (
                  <span className="text-ink-700 font-bold">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </motion.div>
  );
}
