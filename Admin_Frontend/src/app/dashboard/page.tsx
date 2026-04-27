"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Sparkles,
  Star,
  Users,
  UserSquare2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { teachers } from "@/lib/data/teachers";
import { secretaries } from "@/lib/data/secretaries";

export default function DashboardOverviewPage() {
  const totals = {
    teachers: teachers.length,
    courses: teachers.reduce((a, t) => a + t.courses, 0),
    students: teachers.reduce((a, t) => a + t.students, 0),
    secretaries: secretaries.length,
  };

  const recent = [...teachers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="نظرة عامة"
        subtitle="ملخص سريع لأداء المنصة"
        icon={LayoutDashboard}
        crumbs={[{ label: "اللوحة" }]}
        actions={
          <Link
            href="/dashboard/teachers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={14} />
            إضافة مدرس
          </Link>
        }
      />

      {/* Hero card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-fuchsia-600 rounded-3xl text-white p-6"
      >
        <span aria-hidden className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 border border-white/20 rounded-full px-2.5 py-1 backdrop-blur">
              <Sparkles size={12} />
              مرحباً بعودتك!
            </span>
            <h2 className="mt-2 text-2xl font-black leading-tight">إدارة منصة LMS</h2>
            <p className="text-white/85 text-sm font-bold mt-1">
              {totals.teachers} مدرس • {totals.courses} كورس • {totals.students.toLocaleString("ar-EG")} طالب نشط
            </p>
          </div>
          <Link
            href="/dashboard/teachers"
            className="inline-flex items-center gap-1.5 bg-white text-brand-700 hover:bg-brand-50 transition rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-soft"
          >
            عرض المدرسين
            <ArrowLeft size={13} />
          </Link>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={UserSquare2} label="مدرسون" value={totals.teachers} bg="bg-brand-50" fg="text-brand-700" />
        <StatTile icon={BookOpen} label="كورسات" value={totals.courses} bg="bg-emerald-50" fg="text-emerald-700" />
        <StatTile icon={Users} label="طلاب" value={totals.students.toLocaleString("ar-EG")} bg="bg-amber-50" fg="text-amber-700" />
        <StatTile icon={GraduationCap} label="سكرتارية" value={totals.secretaries} bg="bg-pink-50" fg="text-pink-700" />
      </div>

      {/* Recent teachers */}
      <section className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-base font-extrabold text-ink-900">أحدث المدرسين</p>
            <p className="text-[11px] text-ink-500">أحدث المدرسين المضافين على المنصة.</p>
          </div>
          <Link href="/dashboard/teachers" className="text-[11px] font-extrabold text-brand-700 hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/teachers/${t.id}`}
              className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition"
            >
              <div className={`relative w-12 h-12 rounded-xl overflow-hidden ${t.bg} ring-1 ${t.ring} shrink-0`}>
                <Image src={t.photo} alt={t.name} fill sizes="48px" className="object-cover object-top" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-ink-900 truncate">{t.name}</p>
                <p className={`text-[11px] font-bold ${t.text} truncate`}>{t.subject}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold">
                  <Star size={11} fill="currentColor" />
                  {t.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={11} />
                  {t.courses}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={11} />
                  {t.students.toLocaleString("ar-EG")}
                </span>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  t.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {t.status === "active" ? "نشط" : "موقوف"}
              </span>
              <ArrowLeft size={14} className="text-ink-300 group-hover:text-brand-600 group-hover:-translate-x-1 transition" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  bg,
  fg,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  bg: string;
  fg: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 transition"
    >
      <span className={`w-11 h-11 rounded-xl ${bg} ${fg} grid place-items-center shrink-0`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-black text-ink-900 leading-none tabular-nums">{value}</p>
        <p className="text-[11px] text-ink-500 mt-1.5">{label}</p>
      </div>
    </motion.div>
  );
}
