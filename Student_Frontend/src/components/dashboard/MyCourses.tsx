"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Course = {
  title: string;
  grade: string;
  progress: number;
  image: string;
};

const courses: Course[] = [
  {
    title: "الرياضيات",
    grade: "الصف الثالث الثانوي",
    progress: 75,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "الفيزياء",
    grade: "الصف الثالث الثانوي",
    progress: 60,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "اللغة الإنجليزية",
    grade: "الصف الثالث الثانوي",
    progress: 80,
    image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "الكيمياء",
    grade: "الصف الثالث الثانوي",
    progress: 50,
    image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=600&q=80",
  },
];

export function MyCourses() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card/40 p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-ink-900">كورساتي</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-brand-300 hover:text-brand-700 grid place-items-center transition"
            aria-label="السابق"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-brand-300 hover:text-brand-700 grid place-items-center transition"
            aria-label="التالي"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      <motion.div
        ref={scrollRef}
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {courses.map((c) => (
          <motion.a
            key={c.title}
            href="#"
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="group flex-shrink-0 snap-start w-[180px] rounded-xl overflow-hidden border border-slate-100 hover:border-brand-200 hover:shadow-soft transition"
          >
            <div className="relative h-24 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="p-3">
              <p className="font-extrabold text-xs text-ink-900 truncate">{c.title}</p>
              <p className="text-[10px] text-ink-500 mt-0.5 truncate">{c.grade}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.progress}%` }}
                    viewport={viewportOnce}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </div>
                <span className="text-[10px] font-extrabold text-brand-700">{c.progress}%</span>
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
