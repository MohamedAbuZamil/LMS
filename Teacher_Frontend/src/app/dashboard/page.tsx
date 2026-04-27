"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Database,
  Home,
  MessageSquare,
  UserCheck,
  Users,
  Users2,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses } from "@/lib/data/courses";
import { listBanks } from "@/lib/data/questionBanks";
import { listEnrollments, listStudents } from "@/lib/data/students";
import { listSecretaries } from "@/lib/data/secretaries";
import { getSession, type TeacherSession } from "@/lib/session";

export default function DashboardOverview() {
  const [s, setS] = useState<TeacherSession | null>(null);
  const [stats, setStats] = useState({
    courses: 0,
    banks: 0,
    students: 0,
    secretaries: 0,
  });

  useEffect(() => {
    const sess = getSession();
    setS(sess);
    const tid = sess?.teacherId ?? "";
    const courses = listCourses(tid);
    const banks = listBanks(tid);
    const enrolledIds = new Set(
      listEnrollments()
        .filter((e) => e.active && courses.some((c) => c.id === e.courseId))
        .map((e) => e.studentId)
    );
    setStats({
      courses: courses.length,
      banks: banks.length,
      students: Array.from(enrolledIds).filter((id) => listStudents().some((x) => x.id === id)).length,
      secretaries: listSecretaries().length,
    });
  }, []);

  const shortcuts = [
    { href: "/dashboard/courses", label: "الكورسات", icon: BookOpen, hint: "إضافة وتعديل الكورسات والحصص." },
    { href: "/dashboard/banks", label: "بنوك الأسئلة", icon: Database, hint: "إنشاء بنوك وإضافة الأسئلة." },
    { href: "/dashboard/manage", label: "إدارة الحصص", icon: ClipboardList, hint: "فيديوهات وامتحانات وملفات الحصة." },
    { href: "/dashboard/students", label: "الطلاب", icon: Users, hint: "تسجيل الطلاب ومتابعة اشتراكاتهم." },
    { href: "/dashboard/attendance", label: "الحضور والغياب", icon: UserCheck, hint: "متابعة الحضور وإشعار ولي الأمر." },
    { href: "/dashboard/payments", label: "المدفوعات", icon: Wallet, hint: "تسجيل الدفعات لكل طالب." },
    { href: "/dashboard/messages", label: "الرسائل", icon: MessageSquare, hint: "إرسال تقارير وإشعارات." },
    { href: "/dashboard/secretaries", label: "السكرتارية", icon: Users2, hint: "إدارة الحسابات المساعدة." },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`أهلاً ${s?.name ?? "بك"}`}
        subtitle="نظرة سريعة على حسابك وإجراءات مختصرة."
        icon={Home}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={BookOpen} label="كورسات" value={stats.courses} bg="bg-emerald-50" fg="text-emerald-700" />
        <Stat icon={Database} label="بنوك أسئلة" value={stats.banks} bg="bg-accent-50" fg="text-accent-700" />
        <Stat icon={Users} label="طلاب" value={stats.students} bg="bg-amber-50" fg="text-amber-700" />
        <Stat icon={Users2} label="سكرتارية" value={stats.secretaries} bg="bg-pink-50" fg="text-pink-700" />
      </div>

      {/* Shortcuts */}
      <div>
        <p className="text-sm font-extrabold text-ink-900 mb-2">اختصارات سريعة</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shortcuts.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <motion.div
                key={sc.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={sc.href}
                  className="group block bg-white rounded-2xl border border-slate-100 p-4 hover:border-brand-200 hover:shadow-soft transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
                      <Icon size={18} />
                    </span>
                    <ArrowLeft size={14} className="text-ink-400 group-hover:text-brand-700 transition" />
                  </div>
                  <p className="mt-3 text-[13px] font-extrabold text-ink-900">{sc.label}</p>
                  <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{sc.hint}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  bg,
  fg,
}: {
  icon: typeof Home;
  label: string;
  value: number | string;
  bg: string;
  fg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
      <span className={`w-11 h-11 rounded-xl ${bg} ${fg} grid place-items-center shrink-0`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xl font-black text-ink-900 leading-none tabular-nums">{value}</p>
        <p className="text-[11px] text-ink-500 mt-1.5">{label}</p>
      </div>
    </div>
  );
}
