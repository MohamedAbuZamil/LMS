"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Star,
  Users,
  UserSquare2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SUBJECTS, teachers, type Teacher } from "@/lib/data/teachers";

const ALL = "كل المواد";
type StatusFilter = "all" | "active" | "suspended";

export default function TeachersListPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>(ALL);
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim();
    return teachers.filter((t) => {
      if (subject !== ALL && t.subject !== subject) return false;
      if (status !== "all" && t.status !== status) return false;
      if (q && !t.name.includes(q) && !t.username.includes(q.toLowerCase()) && !t.subject.includes(q)) return false;
      return true;
    });
  }, [query, subject, status]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="المدرسين"
        subtitle="إدارة جميع المدرسين على المنصة"
        icon={UserSquare2}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "المدرسين" }]}
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

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المدرس أو المادة أو اسم المستخدم..."
              className="w-full bg-slate-50/70 border border-slate-100 rounded-xl pe-9 ps-3 py-2.5 text-sm focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
            />
          </div>

          <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1">
            {(["all", "active", "suspended"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`relative px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition ${
                  status === s ? "text-white" : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {status === s && (
                  <motion.span
                    layoutId="status-pill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-l from-brand-700 to-brand-500 shadow-soft"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {s === "all" ? "الكل" : s === "active" ? "نشط" : "موقوف"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[ALL, ...SUBJECTS].map((s) => {
            const active = subject === s;
            return (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`shrink-0 text-[11px] font-extrabold rounded-full border-2 px-3 py-1.5 transition ${
                  active
                    ? "border-brand-500 bg-brand-50/80 text-brand-800"
                    : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table-like grid */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] gap-4 px-5 py-3 bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-ink-500">
          <span>المدرس</span>
          <span>المادة</span>
          <span className="text-center">الكورسات</span>
          <span className="text-center">الطلاب</span>
          <span className="text-center">التقييم</span>
          <span className="text-center">الحالة</span>
          <span className="text-center">إجراء</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[12px] text-ink-500">
            لا يوجد مدرسون مطابقون لبحثك.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <TeacherRow key={t.id} t={t} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TeacherRow({ t }: { t: Teacher }) {
  return (
    <li>
      <Link
        href={`/dashboard/teachers/${t.id}`}
        className="group grid grid-cols-1 md:grid-cols-[1.6fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto] gap-3 md:gap-4 items-center px-4 md:px-5 py-3 hover:bg-slate-50/70 transition"
      >
        {/* teacher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`relative w-11 h-11 rounded-xl overflow-hidden ${t.bg} ring-1 ${t.ring} shrink-0`}>
            <Image src={t.photo} alt={t.name} fill sizes="44px" className="object-cover object-top" />
            {t.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-ink-900 truncate">{t.name}</p>
            <p className="text-[10px] text-ink-500 truncate">@{t.username}</p>
          </div>
        </div>

        {/* subject */}
        <p className={`text-[12px] font-bold ${t.text} truncate`}>{t.subject}</p>

        {/* courses */}
        <p className="text-center text-[12px] font-extrabold text-ink-900 tabular-nums hidden md:block">
          {t.courses}
        </p>
        {/* students */}
        <p className="text-center text-[12px] font-extrabold text-ink-900 tabular-nums hidden md:block">
          {t.students.toLocaleString("ar-EG")}
        </p>
        {/* rating */}
        <p className="text-center text-[12px] font-extrabold text-amber-600 tabular-nums hidden md:flex items-center justify-center gap-1">
          <Star size={11} fill="currentColor" />
          {t.rating.toFixed(1)}
        </p>
        {/* status */}
        <div className="flex md:justify-center">
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              t.status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {t.status === "active" ? "نشط" : "موقوف"}
          </span>
        </div>
        {/* action */}
        <span className="hidden md:inline-flex items-center justify-center text-ink-300 group-hover:text-brand-600 group-hover:-translate-x-1 transition">
          <ArrowLeft size={14} />
        </span>
      </Link>
    </li>
  );
}
