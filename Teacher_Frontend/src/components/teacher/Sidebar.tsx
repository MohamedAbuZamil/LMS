"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Database,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  UserCheck,
  Users,
  Users2,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { getSession, logout } from "@/lib/session";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: typeof Home };

const NAV: Item[] = [
  { href: "/dashboard", label: "اللوحة", icon: Home },
  { href: "/dashboard/courses", label: "الكورسات", icon: BookOpen },
  { href: "/dashboard/banks", label: "بنوك الأسئلة", icon: Database },
  { href: "/dashboard/manage", label: "إدارة الحصص", icon: ClipboardList },
  { href: "/dashboard/students", label: "الطلاب", icon: Users },
  { href: "/dashboard/attendance", label: "الحضور", icon: UserCheck },
  { href: "/dashboard/payments", label: "المدفوعات", icon: Wallet },
  { href: "/dashboard/messages", label: "الرسائل", icon: MessageSquare },
  { href: "/dashboard/secretaries", label: "السكرتارية", icon: Users2 },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<"teacher" | "secretary" | null>(null);

  useEffect(() => {
    const s = getSession();
    setRole(s?.role ?? null);
  }, []);

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-l border-slate-100 px-4 py-5">
      <Link href="/dashboard" className="px-2 mb-4">
        <Logo />
      </Link>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-extrabold transition ${
                active
                  ? "bg-gradient-to-l from-brand-700 to-brand-500 text-white shadow-soft"
                  : "text-ink-700 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 pt-3 mt-3">
        {role && (
          <p className="text-[10px] text-ink-500 mb-2 text-center">
            الدور: <span className="font-extrabold text-brand-700">{role === "teacher" ? "مدرس" : "سكرتارية"}</span>
          </p>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-[12px] font-extrabold transition"
        >
          <LogOut size={14} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
