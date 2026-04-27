"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { getSession, logout, type AdminSession } from "@/lib/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router]);

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <span className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar session={session} onLogout={onLogout} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
