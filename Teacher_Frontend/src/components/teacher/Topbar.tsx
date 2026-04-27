"use client";
import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession, logout, type TeacherSession } from "@/lib/session";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const [s, setS] = useState<TeacherSession | null>(null);
  const router = useRouter();

  useEffect(() => setS(getSession()), []);

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3">
      <button
        onClick={onMenu}
        className="lg:hidden w-9 h-9 grid place-items-center rounded-xl bg-slate-50 text-ink-700 hover:bg-brand-50 hover:text-brand-700"
        aria-label="القائمة"
      >
        <Menu size={16} />
      </button>
      <div className="flex-1" />
      <button className="relative w-9 h-9 grid place-items-center rounded-xl bg-slate-50 text-ink-700 hover:bg-brand-50 hover:text-brand-700" aria-label="إشعارات">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
      </button>
      {s && (
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 rounded-2xl pr-3 pl-1.5 py-1">
          <div className="text-right leading-none">
            <p className="text-[12px] font-extrabold text-ink-900">{s.name}</p>
            <p className="text-[10px] text-ink-500 mt-0.5">
              {s.role === "teacher" ? "مدرس" : "سكرتارية"} • @{s.username}
            </p>
          </div>
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-extrabold">
            {s.name.charAt(0)}
          </span>
        </div>
      )}
      <button
        onClick={() => {
          logout();
          router.replace("/login");
        }}
        className="sm:hidden w-9 h-9 grid place-items-center rounded-xl bg-rose-50 text-rose-700"
        aria-label="خروج"
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}
