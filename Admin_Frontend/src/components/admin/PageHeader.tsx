"use client";
import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  crumbs,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-[11px] text-ink-500 mb-1.5">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {c.href ? (
                  <Link href={c.href} className="hover:text-brand-700 transition">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink-700 font-bold">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronLeft size={12} className="text-ink-300" />}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shrink-0 shadow-soft">
              <Icon size={18} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-ink-900 truncate">{title}</h1>
            {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
