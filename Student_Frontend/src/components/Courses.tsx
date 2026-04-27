"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { stagger, fadeUp, viewportOnce } from "@/lib/motion";

type Course = {
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: string;
  free?: boolean;
  badge?: string;
  badgeColor?: string;
  image: string;
};

const courses: Course[] = [
  {
    title: "أساسيات البرمجة باستخدام Python",
    instructor: "م. أحمد علي",
    rating: 4.8,
    reviews: 230,
    price: "مجاني",
    free: true,
    badge: "جديد",
    badgeColor: "bg-brand-600",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "الرياضيات للثانوية العامة",
    instructor: "د. سارة محمود",
    rating: 4.9,
    reviews: 310,
    price: "$29.99",
    badge: "الأكثر مبيعاً",
    badgeColor: "bg-orange-500",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "دورة اللغة الإنجليزية من الصفر",
    instructor: "أ. منى أحمد",
    rating: 4.7,
    reviews: 180,
    price: "$19.99",
    badge: "جديد",
    badgeColor: "bg-brand-600",
    image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "تصميم واجهات UI/UX من البداية",
    instructor: "م. عمر خالد",
    rating: 4.8,
    reviews: 160,
    price: "$34.99",
    badge: "جديد",
    badgeColor: "bg-brand-600",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "مقدمة في الفيزياء الحديثة",
    instructor: "د. خالد حسن",
    rating: 4.6,
    reviews: 140,
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "أساسيات إدارة الأعمال",
    instructor: "م. يوسف فؤاد",
    rating: 4.7,
    reviews: 200,
    price: "$22.99",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  },
];

export function Courses() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  return (
    <section id="courses" className="bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="flex items-end justify-between mb-8"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.1)}
        >
          <div>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold text-ink-900">
              أحدث الكورسات
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-ink-500 mt-2">
              اكتشف أحدث الكورسات المتاحة على المنصة
            </motion.p>
          </div>
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 grid place-items-center transition shadow-card/40"
              aria-label="السابق"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 grid place-items-center transition shadow-card/40"
              aria-label="التالي"
            >
              <ChevronLeft size={18} />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-1 px-1"
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          {courses.map((c) => (
            <motion.article
              key={c.title}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="group flex-shrink-0 snap-start w-[280px] sm:w-[300px] bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card/40 hover:shadow-soft transition-shadow"
            >
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                {c.badge && (
                  <span className={`absolute top-3 right-3 ${c.badgeColor} text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-soft`}>
                    {c.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-extrabold text-ink-900 leading-snug line-clamp-2 min-h-[3rem] group-hover:text-brand-700 transition">
                  {c.title}
                </h3>
                <p className="text-xs text-ink-500 mt-2">{c.instructor}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold text-ink-800">{c.rating}</span>
                    <span className="text-[11px] text-ink-400">({c.reviews})</span>
                  </div>
                  <span className={`text-sm font-extrabold ${c.free ? "text-emerald-600" : "text-brand-700"}`}>
                    {c.price}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
