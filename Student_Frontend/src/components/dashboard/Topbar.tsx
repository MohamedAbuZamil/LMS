"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Mail, Wallet, Plus, ChevronDown } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";
import { MessagesPanel } from "./MessagesPanel";

type OpenPanel = "none" | "notifs" | "msgs";

type Props = {
  onMenuToggle: () => void;
  mobileOpen: boolean;
};

export function Topbar({ onMenuToggle, mobileOpen }: Props) {
  const [open, setOpen] = useState<OpenPanel>("none");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (open === "none") return;
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen("none");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen("none");
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (panel: OpenPanel) => setOpen((cur) => (cur === panel ? "none" : panel));

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3">
        {/* Right (in RTL): hamburger + user chip + bell + mail */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0" ref={wrapRef}>
          {/* hamburger (mobile only) */}
          <button
            onClick={onMenuToggle}
            aria-label="القائمة"
            className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 hover:border-brand-300 grid place-items-center text-ink-700 hover:text-brand-700 transition"
          >
            <AnimatedHamburger open={mobileOpen} />
          </button>

          {/* user chip */}
          <button className="hidden sm:flex items-center gap-2 sm:gap-3 pe-3 ps-1 py-1 rounded-full border border-slate-200 hover:border-brand-300 transition group">
            <span className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white bg-brand-100 grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                alt="أحمد محمد"
                className="w-full h-full object-cover"
              />
            </span>
            <div className="text-right">
              <p className="text-xs font-extrabold text-ink-900 leading-none">أحمد محمد</p>
              <p className="text-[10px] text-ink-500 mt-1">الصف الثالث الثانوي</p>
            </div>
            <ChevronDown size={14} className="text-ink-400 group-hover:text-brand-600 transition" />
          </button>
          {/* mobile-only: just avatar */}
          <button className="sm:hidden w-10 h-10 rounded-full overflow-hidden border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
              alt="أحمد"
              className="w-full h-full object-cover"
            />
          </button>

          {/* notifications */}
          <div className="relative">
            <motion.button
              onClick={() => toggle("notifs")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={`relative w-10 h-10 rounded-xl border grid place-items-center transition
                ${open === "notifs"
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "bg-white border-slate-200 text-ink-600 hover:border-brand-300 hover:text-brand-700"}`}
              aria-label="إشعارات"
              aria-expanded={open === "notifs"}
            >
              <Bell size={18} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                className="absolute -top-1 -left-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-extrabold grid place-items-center px-1"
              >
                3
              </motion.span>
              {open !== "notifs" && (
                <span className="absolute -top-1 -left-1 w-[18px] h-[18px] rounded-full bg-rose-400/60 animate-ping" />
              )}
            </motion.button>
            <AnimatePresence>{open === "notifs" && <NotificationsPanel />}</AnimatePresence>
          </div>

          {/* messages */}
          <div className="relative">
            <motion.button
              onClick={() => toggle("msgs")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={`relative w-10 h-10 rounded-xl border grid place-items-center transition
                ${open === "msgs"
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "bg-white border-slate-200 text-ink-600 hover:border-brand-300 hover:text-brand-700"}`}
              aria-label="رسائل"
              aria-expanded={open === "msgs"}
            >
              <Mail size={18} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
                className="absolute -top-1 -left-1 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-extrabold grid place-items-center px-1"
              >
                2
              </motion.span>
            </motion.button>
            <AnimatePresence>{open === "msgs" && <MessagesPanel />}</AnimatePresence>
          </div>
        </div>

        {/* Left: balance + recharge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded-xl ps-3 pe-4 py-2">
            <span className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 grid place-items-center">
              <Wallet size={16} />
            </span>
            <div className="text-right">
              <p className="text-[10px] text-ink-500">الرصيد الحالي</p>
              <p className="text-sm font-extrabold text-ink-900">120.50 <span className="text-[10px] text-ink-500 font-bold">ج.م</span></p>
            </div>
          </div>
          <motion.a
            href="/dashboard/recharge"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-soft shimmer transition-colors whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="hidden xs:inline sm:inline">شحن رصيد</span>
          </motion.a>
        </div>
      </div>

      {/* mobile balance strip below topbar */}
      <div className="md:hidden flex items-center justify-between px-3 pb-2 text-xs">
        <div className="flex items-center gap-2 text-ink-600">
          <Wallet size={14} className="text-brand-600" />
          <span>الرصيد الحالي:</span>
          <span className="font-extrabold text-ink-900">120.50 ج.م</span>
        </div>
      </div>
    </header>
  );
}

function AnimatedHamburger({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <motion.path
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        animate={open ? { d: "M6 6 L18 18" } : { d: "M4 7 L20 7" }}
        transition={{ duration: 0.25 }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M4 12 L20 12"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        animate={open ? { d: "M6 18 L18 6" } : { d: "M4 17 L20 17" }}
        transition={{ duration: 0.25 }}
      />
    </svg>
  );
}
