import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  crumbs = [],
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && (
          <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft shrink-0">
            <Icon size={20} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          {crumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-[10px] text-ink-500 mb-1">
              {crumbs.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-brand-700 font-extrabold">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="font-extrabold text-ink-700">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <ChevronLeft size={10} />}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-lg sm:text-xl font-black text-ink-900 truncate">{title}</h1>
          {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
