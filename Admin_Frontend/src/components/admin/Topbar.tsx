"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, UserCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import type { AdminSession } from "@/lib/session";

export function Topbar({
  session,
  onLogout,
}: {
  session: AdminSession | null;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        {/* mobile logo */}
        <div className="lg:hidden">
          <Logo showText={false} />
        </div>

        {/* search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="ابحث في اللوحة..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pe-9 ps-3 py-2 text-sm focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
          />
        </div>

        <button
          aria-label="إشعارات"
          className="relative w-9 h-9 grid place-items-center rounded-xl text-ink-600 hover:bg-slate-50 hover:text-brand-700 transition"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* user menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1 ps-2 rounded-xl hover:bg-slate-50 transition"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
              <UserCircle size={18} />
            </span>
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-[12px] font-extrabold text-ink-900">{session?.name ?? "المدير"}</p>
              <p className="text-[10px] text-ink-500">@{session?.username ?? "admin"}</p>
            </div>
            <ChevronDown size={14} className="text-ink-400" />
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
              <div className="px-3 py-2.5 bg-slate-50/70 border-b border-slate-100">
                <p className="text-[12px] font-extrabold text-ink-900">{session?.name ?? "المدير"}</p>
                <p className="text-[10px] text-ink-500">{session?.username ?? "admin"}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] font-bold text-rose-700 hover:bg-rose-50 transition"
              >
                <LogOut size={14} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
