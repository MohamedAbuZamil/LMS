"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Home,
  UserSquare2,
  GraduationCap,
  ShoppingCart,
  Wallet,
  ClipboardList,
  LineChart,
  Trophy,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";

type Item = { label: string; href: string; icon: LucideIcon };

const items: Item[] = [
  { label: "الرئيسية", href: "/dashboard", icon: Home },
  { label: "مدرسيني", href: "/dashboard/my-teachers", icon: UserSquare2 },
  { label: "المدرسين", href: "/dashboard/teachers", icon: GraduationCap },
  { label: "شراء كورس", href: "/dashboard/buy", icon: ShoppingCart },
  { label: "شحن رصيد", href: "/dashboard/recharge", icon: Wallet },
  { label: "السجل", href: "/dashboard/history", icon: ClipboardList },
  { label: "تقرير الطالب", href: "/dashboard/report", icon: LineChart },
  { label: "لوحة الشرف", href: "/dashboard/honor", icon: Trophy },
  { label: "الإعدادات", href: "/dashboard/settings", icon: Settings },
];

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((it, i) => {
        const active = pathname === it.href;
        return (
          <motion.li
            key={it.label}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <a
              href={it.href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition group
                ${active ? "text-brand-700" : "text-ink-600 hover:bg-slate-50"}`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-200 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <it.icon
                size={18}
                className={`shrink-0 transition ${active ? "text-brand-700" : "text-ink-400 group-hover:text-ink-700"}`}
              />
              <span className="flex-1">{it.label}</span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-brand-500"
                />
              )}
            </a>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // lock body scroll while drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  return (
    <>
      {/* desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 right-0 h-screen w-64 bg-white border-l border-slate-100 z-30">
        <div className="px-6 pt-6 pb-4">
          <Logo />
        </div>
        <nav className="flex-1 px-4 overflow-y-auto">
          <NavList pathname={pathname} />
        </nav>
        <div className="p-4">
          <a
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-ink-700 text-sm font-bold transition"
          >
            <LogOut size={16} />
            تسجيل خروج
          </a>
        </div>
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              key="dr"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:hidden fixed top-0 right-0 h-screen w-72 max-w-[80vw] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <Logo />
              </div>
              <nav className="flex-1 px-3 overflow-y-auto">
                <NavList pathname={pathname} onNavigate={onClose} />
              </nav>
              <div className="p-3">
                <a
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-ink-700 text-sm font-bold transition"
                >
                  <LogOut size={16} />
                  تسجيل خروج
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
