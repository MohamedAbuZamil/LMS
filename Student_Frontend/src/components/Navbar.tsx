"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { label: "الرئيسية", href: "#" },
  { label: "الكورسات", href: "#courses" },
  { label: "المواد", href: "#categories" },
  { label: "المدرسين", href: "#instructors" },
  { label: "من نحن", href: "#" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Right (in RTL): logo */}
        <Logo />

        {/* Center: links */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-bold text-ink-700 hover:text-brand-700 transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Left (in RTL): CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="/login" className="text-sm font-bold text-ink-800 px-4 py-2 rounded-lg hover:bg-slate-50">
            تسجيل دخول
          </a>
          <a href="/signup" className="text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-soft transition">
            إنشاء حساب
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          aria-label="menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-4 flex flex-col gap-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm font-bold text-ink-700 hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a href="#" className="btn-outline py-2 text-sm">تسجيل دخول</a>
              <a href="#" className="btn-primary py-2 text-sm">إنشاء حساب</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
