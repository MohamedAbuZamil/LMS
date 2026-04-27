"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Building2,
  MapPin,
  Mail,
  UserPlus,
  Loader2,
  Check,
} from "lucide-react";
import { Field, SelectField } from "./Field";
import { PhoneField } from "./PhoneField";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const grades = [
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
];

const govs = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الشرقية",
  "الغربية",
  "المنوفية",
  "البحيرة",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "مرسى مطروح",
  "شمال سيناء",
  "جنوب سيناء",
  "الوادي الجديد",
];

type Status = "idle" | "loading" | "done";

function generateStudentCode(): string {
  // 7-digit code starting with 26 (e.g. 2600001..2699999)
  return `26${Math.floor(1 + Math.random() * 99998).toString().padStart(5, "0")}`;
}

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export function SignupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const code = generateStudentCode();
    const pw = generatePassword();
    setTimeout(() => {
      setStatus("done");
      setTimeout(() => {
        router.push(`/signup/success?code=${code}&pw=${pw}`);
      }, 700);
    }, 1200);
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 sm:p-8"
    >
      {/* tab title */}
      <motion.div
        className="flex items-center justify-center gap-2 pb-5 mb-6 border-b border-slate-100"
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
      >
        <div className="w-9 h-9 rounded-full bg-brand-100 grid place-items-center text-brand-700">
          <UserPlus size={18} />
        </div>
        <h2 className="text-base font-extrabold text-ink-900">بيانات الطالب</h2>
      </motion.div>

      {/* Section 1: Student data */}
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <Field
            label="الاسم الكامل"
            placeholder="اكتب اسمك الكامل"
            icon={<User size={16} />}
            required
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <PhoneField label="رقم الموبايل (الطالب)" required />
        </motion.div>
        <motion.div variants={fadeUp}>
          <SelectField
            label="الصف الدراسي"
            icon={<GraduationCap size={16} />}
            hint="من الصف الثالث الإعدادي إلى الصف الثالث الثانوي"
            required
            defaultValue=""
          >
            <option value="" disabled>
              اختر الصف
            </option>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </SelectField>
        </motion.div>
      </motion.div>

      <SectionDivider title="بيانات ولي الأمر" />

      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.div variants={fadeUp}>
          <PhoneField label="رقم هاتف الأب" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <PhoneField label="رقم هاتف الأم" />
        </motion.div>
      </motion.div>

      <SectionDivider title="البيانات التعليمية" />

      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <Field
            label="المدرسة"
            placeholder="اكتب اسم المدرسة"
            icon={<Building2 size={16} />}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <SelectField
            label="المحافظة"
            icon={<MapPin size={16} />}
            defaultValue=""
            required
          >
            <option value="" disabled>
              اختر المحافظة
            </option>
            {govs.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </SelectField>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Field
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            icon={<Mail size={16} />}
            required
          />
        </motion.div>
      </motion.div>

      {/* submit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ delay: 0.2 }}
        className="mt-7"
      >
        <motion.button
          type="submit"
          disabled={status !== "idle"}
          whileHover={status === "idle" ? { scale: 1.02 } : undefined}
          whileTap={status === "idle" ? { scale: 0.98 } : undefined}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white shadow-soft transition-colors
            ${status === "done" ? "bg-emerald-600" : "bg-brand-600 hover:bg-brand-700"} ${status === "idle" ? "shimmer" : ""}`}
        >
          {status === "idle" && (
            <>
              <UserPlus size={18} />
              إنشاء حساب
            </>
          )}
          {status === "loading" && (
            <>
              <Loader2 size={18} className="animate-spin" />
              جارٍ إنشاء الحساب…
            </>
          )}
          {status === "done" && (
            <>
              <Check size={18} />
              تم إنشاء حسابك بنجاح
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-ink-500 mt-4">
          لديك حساب بالفعل؟{" "}
          <a href="#" className="font-bold text-brand-700 hover:underline">
            تسجيل دخول
          </a>
        </p>
      </motion.div>
    </motion.form>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewportOnce}
      className="my-7 flex items-center gap-3"
    >
      <span className="h-px flex-1 bg-gradient-to-l from-brand-200 to-transparent" />
      <h3 className="text-sm font-extrabold text-brand-700">{title}</h3>
      <span className="h-px flex-1 bg-gradient-to-r from-brand-200 to-transparent" />
    </motion.div>
  );
}
