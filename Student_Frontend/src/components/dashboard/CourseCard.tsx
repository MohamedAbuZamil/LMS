"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, PlayCircle, Clock } from "lucide-react";
import { CourseCover } from "./CourseCover";
import type { Course } from "@/lib/data/teachers";

export function CourseCard({ c, teacherId, index = 0 }: { c: Course; teacherId: string; index?: number }) {
  const href = `/dashboard/my-teachers/${teacherId}/${c.id}`;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft overflow-hidden flex flex-col transition"
    >
      {/* cover */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <CourseCover theme={c.theme} />
        {/* veil + scale on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 group-hover:scale-105 transition duration-700" />

        {/* play button on hover */}
        <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition duration-300">
          <span className="w-12 h-12 rounded-full bg-white/95 text-brand-700 grid place-items-center shadow-soft scale-90 group-hover:scale-100 transition duration-300">
            <PlayCircle size={24} />
          </span>
        </span>

        {/* duration badge */}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white text-[10px] font-bold rounded-full px-2 py-0.5">
          <Clock size={10} />
          {c.duration}
        </span>
      </div>

      {/* body */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="font-extrabold text-sm text-ink-900 truncate">{c.title}</p>
        <p className="text-[11px] text-ink-500 mt-1 truncate">{c.grade}</p>

        {/* progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-extrabold text-brand-700">{c.progress}%</span>
            <span className="text-ink-400">{c.lessons} درس</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${c.progress}%` }}
              transition={{ delay: 0.15 + index * 0.04, duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-l from-brand-600 to-brand-400"
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="relative mt-4 block w-full text-center text-xs font-bold text-brand-700 border border-brand-200 rounded-lg py-2.5 overflow-hidden transition group-hover:text-white group-hover:border-brand-600"
        >
          <span className="absolute inset-0 bg-gradient-to-l from-brand-600 to-brand-500 scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500" />
          <span className="relative inline-flex items-center justify-center gap-1.5">
            دخول الكورس
            <ArrowLeft size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
