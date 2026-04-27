"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  UserSquare2,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
};

const NAV: Item[] = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/teachers", label: "المدرسين", icon: UserSquare2 },
  { href: "/dashboard/courses", label: "الكورسات", icon: BookOpen },
  { href: "/dashboard/secretaries", label: "السكرتارية", icon: Users },
  { href: "/dashboard/students", label: "الطلاب", icon: ShieldCheck },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 sticky top-0 h-screen bg-white border-l border-slate-100 flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition group ${
                active
                  ? "text-white"
                  : "text-ink-700 hover:bg-slate-50 hover:text-brand-700"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 shadow-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={17} className="relative z-10 shrink-0" />
              <span className="relative z-10 flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-extrabold ${
                    active ? "bg-white/25 text-white" : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-700 hover:bg-rose-50 transition"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
