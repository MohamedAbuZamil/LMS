"use client";
import { useEffect, useState } from "react";
import { Construction, Settings, User } from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { getSession, type TeacherSession } from "@/lib/session";

export default function SettingsPage() {
  const [s, setS] = useState<TeacherSession | null>(null);
  useEffect(() => setS(getSession()), []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="الإعدادات"
        subtitle="الملف الشخصي وإعدادات الحساب."
        icon={Settings}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الإعدادات" }]}
      />

      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
        <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
          <User size={26} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-ink-900">{s?.name ?? "—"}</p>
          <p className="text-[11px] text-ink-500 mt-0.5">@{s?.username ?? "—"} • {s?.role === "teacher" ? "حساب مدرس" : "حساب سكرتارية"}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-700">
          <Construction size={22} />
        </span>
        <p className="mt-3 text-sm font-extrabold text-ink-900">إعدادات إضافية قريباً</p>
        <p className="text-[12px] text-ink-500 mt-1 max-w-md mx-auto">
          سيتضمّن هذا القسم: تغيير كلمة المرور، الصورة الشخصية، إعدادات الإشعارات، وإعدادات الفوترة.
        </p>
      </div>
    </div>
  );
}
