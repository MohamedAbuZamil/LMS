"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Users,
  Sparkles,
  Calculator,
  Atom,
  Languages,
  FlaskConical,
  BookText,
  Dna,
  Globe,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type { Teacher } from "@/lib/data/teachers";

export type { Teacher };

const subjectIcons: Record<string, LucideIcon> = {
  "الرياضيات": Calculator,
  "الفيزياء": Atom,
  "اللغة الإنجليزية": Languages,
  "الكيمياء": FlaskConical,
  "اللغة العربية": BookText,
  "الأحياء": Dna,
  "الجغرافيا": Globe,
  "التاريخ": Landmark,
};

export function TeacherCard({
  t,
  view = "grid",
  featured = false,
  index = 0,
}: {
  t: Teacher;
  view?: "grid" | "list";
  featured?: boolean;
  index?: number;
}) {
  const SubjectIcon = subjectIcons[t.subject] ?? BookOpen;

  const href = `/dashboard/my-teachers/${t.id}`;

  if (view === "list") {
    return (
      <motion.div layout whileHover={{ x: -4 }}>
        <Link
          href={href}
          className="group relative flex items-center gap-3 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft p-3 pe-4 transition overflow-hidden"
        >
          {/* gradient accent strip on the right (RTL) */}
          <span
            aria-hidden
            className={`absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${t.gradFrom} ${t.gradTo}`}
          />

          {/* circular avatar */}
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-soft ${t.bg}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.photo}
                alt={t.name}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-700"
              />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-soft grid place-items-center ${t.text}`}
              title={t.subject}
            >
              <SubjectIcon size={11} />
            </span>
            {t.online && (
              <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>

          {/* main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-sm text-ink-900 truncate">{t.name}</p>
              {featured && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 shrink-0">
                  <Sparkles size={9} />
                  مميز
                </span>
              )}
            </div>
            <p className={`text-[11px] mt-0.5 truncate inline-flex items-center gap-1 ${t.text} font-bold`}>
              <SubjectIcon size={11} />
              {t.subject}
            </p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-500">
              <span className={`font-bold ${t.text} inline-flex items-center gap-1`}>
                <BookOpen size={10} /> {t.courses} كورس
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                <Star size={10} fill="currentColor" /> {t.rating.toFixed(1)}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Users size={10} /> {t.students.toLocaleString("ar-EG")}
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-200 text-brand-700 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition">
            الدخول للكورسات
            <ArrowLeft size={14} />
          </span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative"
    >
      {/* animated gradient ring on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${t.gradFrom} ${t.gradTo} opacity-0 group-hover:opacity-60 blur transition duration-500`}
      />

      <div className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full transition group-hover:border-transparent group-hover:shadow-card">
        {/* gradient banner header (no photo) */}
        <div className={`relative h-24 bg-gradient-to-br ${t.gradFrom} ${t.gradTo} overflow-hidden`}>
          <span aria-hidden className="pointer-events-none absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          {/* big decorative subject icon */}
          <SubjectIcon
            size={120}
            strokeWidth={1.5}
            className="absolute -bottom-6 -left-2 text-white/15 -rotate-12"
          />

          {/* courses count badge */}
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/90 text-ink-800 backdrop-blur text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
            <BookOpen size={10} className="text-brand-600" />
            {t.courses} كورس
          </span>

          {/* online dot */}
          {t.online && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
              <span className="relative w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-60" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-white block" />
              </span>
              متاح
            </span>
          )}

          {/* featured ribbon */}
          {featured && (
            <motion.span
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 380 }}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-extrabold rounded-full px-2 py-1 shadow-soft"
            >
              <Sparkles size={10} className="animate-pulse" />
              الأكثر كورسات
            </motion.span>
          )}
        </div>

        {/* avatar overlapping the banner */}
        <div className="relative -mt-10 px-4 flex flex-col items-center text-center">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-card ${t.bg}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.photo}
                alt={t.name}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-700"
              />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-soft grid place-items-center ${t.text}`}
              title={t.subject}
            >
              <SubjectIcon size={14} />
            </span>
          </div>

          <p className="mt-2.5 font-extrabold text-sm text-ink-900 line-clamp-1 max-w-full">{t.name}</p>
          <p className={`text-[11px] font-bold ${t.text} mt-0.5 line-clamp-1 max-w-full`}>{t.subject}</p>
        </div>

        {/* stats row */}
        <div className="px-4 pt-3 grid grid-cols-3 gap-2 text-center">
          <StatChip icon={Star} label="تقييم" value={t.rating.toFixed(1)} cls="text-amber-600" />
          <StatChip icon={BookOpen} label="كورس" value={`${t.courses}`} cls="text-brand-700" />
          <StatChip icon={Users} label="طالب" value={t.students.toLocaleString("ar-EG")} cls="text-sky-600" />
        </div>

        {/* CTA button with sliding fill */}
        <div className="p-4 mt-auto">
          <Link
            href={href}
            className="relative block w-full text-center text-xs font-extrabold text-brand-700 border border-brand-200 rounded-xl py-2.5 overflow-hidden transition group-hover:text-white group-hover:border-brand-600"
          >
            <span className="absolute inset-0 bg-gradient-to-l from-brand-700 to-brand-500 scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500" />
            <span className="relative inline-flex items-center justify-center gap-1.5 max-w-full">
              <BookOpen size={13} />
              الدخول إلى الكورسات
              <ArrowLeft size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  cls,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  cls: string;
}) {
  return (
    <div className="bg-slate-50/70 rounded-lg border border-slate-100 px-2 py-1.5 leading-tight">
      <p className={`text-[12px] font-black inline-flex items-center justify-center gap-1 ${cls}`}>
        <Icon size={11} className={cls === "text-amber-600" ? "fill-current" : ""} />
        {value}
      </p>
      <p className="text-[9px] text-ink-500 mt-0.5">{label}</p>
    </div>
  );
}
