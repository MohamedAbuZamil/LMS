"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type Instructor = {
  name: string;
  title: string;
  photo: string;
  ring: string;
};

const instructors: Instructor[] = [
  {
    name: "م. أحمد علي",
    title: "Python",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    ring: "ring-brand-300",
  },
  {
    name: "د. سارة محمود",
    title: "رياضيات",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    ring: "ring-orange-300",
  },
  {
    name: "أ. منى أحمد",
    title: "إنجليزية",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    ring: "ring-sky-300",
  },
  {
    name: "م. عمر خالد",
    title: "UI/UX",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    ring: "ring-pink-300",
  },
  {
    name: "د. خالد حسن",
    title: "فيزياء",
    photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80",
    ring: "ring-amber-300",
  },
  {
    name: "أ. ليلى سامي",
    title: "تصميم",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    ring: "ring-fuchsia-300",
  },
  {
    name: "م. يوسف فؤاد",
    title: "إدارة أعمال",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    ring: "ring-emerald-300",
  },
  {
    name: "د. هدى رمزي",
    title: "أحياء",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    ring: "ring-rose-300",
  },
];

function InstructorCard({ i }: { i: Instructor }) {
  return (
    <motion.a
      href="#"
      whileHover={{ y: -6, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      className="flex-shrink-0 text-center w-32"
    >
      <div className={`relative w-28 h-28 mx-auto rounded-full ring-4 ${i.ring} ring-offset-4 ring-offset-white overflow-hidden bg-slate-100 shadow-card`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={i.photo} alt={i.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-700/40 to-transparent opacity-0 hover:opacity-100 transition" />
      </div>
      <p className="mt-4 font-extrabold text-sm text-ink-900 line-clamp-1">{i.name}</p>
      <p className="text-[11px] text-ink-500 mt-1">{i.title}</p>
    </motion.a>
  );
}

export function Instructors() {
  // duplicate list for seamless infinite marquee
  const loop = [...instructors, ...instructors];

  return (
    <section id="instructors" className="py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.1)}
        >
          <motion.p variants={fadeUp} className="text-xs font-bold text-brand-600 mb-2">
            فريق التدريس
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold text-ink-900">
            تعرّف على المدرسين
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-ink-500 mt-2">
            نخبة من الخبراء أصحاب الخبرة الطويلة، جاهزون لمساعدتك
          </motion.p>
        </motion.div>
      </div>

      {/* marquee */}
      <div className="relative marquee-paused">
        {/* gradient masks */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />

        <div className="overflow-hidden">
          <div className="flex gap-8 w-max animate-marquee py-6">
            {loop.map((i, idx) => (
              <InstructorCard key={`${i.name}-${idx}`} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
