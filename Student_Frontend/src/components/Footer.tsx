import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Logo } from "./Logo";

const cols = [
  {
    title: "المنصة",
    links: ["الكورسات", "المواد", "المدرسين", "من نحن"],
  },
  {
    title: "معلومات",
    links: ["الأسئلة الشائعة", "السياسة الخصوصية", "شروط الاستخدام", "تواصل معنا"],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Logo className="[&_span]:text-white" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-md">
            منصة تعليمية متكاملة تساعدك على تعلم المهارات الجديدة وتطوير نفسك.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-600 grid place-items-center transition"
                aria-label="social"
              >
                <I size={16} />
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-white font-extrabold mb-4">{c.title}</h4>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-400">
          جميع الحقوق محفوظة © LMS 2024
        </div>
      </div>
    </footer>
  );
}
