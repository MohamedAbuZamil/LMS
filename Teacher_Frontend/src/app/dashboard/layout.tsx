"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/teacher/Sidebar";
import { Topbar } from "@/components/teacher/Topbar";
import { getSession, type TeacherSession } from "@/lib/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [, setSession] = useState<TeacherSession | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-50">
        <div className="w-9 h-9 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
