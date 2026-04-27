"use client";
import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:mr-64">
        <Topbar onMenuToggle={() => setMobileOpen((o) => !o)} mobileOpen={mobileOpen} />
        <main className="px-3 sm:px-6 py-5">{children}</main>
      </div>
    </div>
  );
}
