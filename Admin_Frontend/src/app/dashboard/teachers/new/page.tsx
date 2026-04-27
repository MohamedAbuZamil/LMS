"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SUBJECTS } from "@/lib/data/teachers";

export default function AddTeacherPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = "اسم المدرس يجب أن يكون 3 أحرف فأكثر.";
    if (!/^[a-z0-9._-]{3,}$/i.test(username.trim())) e.username = "اسم المستخدم يحتوي على حروف/أرقام/نقاط فقط (3 على الأقل).";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "صيغة البريد غير صحيحة.";
    if (phone && phone.replace(/\D/g, "").length < 9) e.phone = "رقم الهاتف غير صحيح.";
    if (password.length < 6) e.password = "كلمة المرور يجب أن تكون 6 أحرف فأكثر.";
    else if (password !== confirm) e.confirm = "كلمتا المرور غير متطابقتين.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      window.setTimeout(() => router.push("/dashboard/teachers"), 1200);
    }, 800);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        title="إضافة مدرس جديد"
        subtitle="أدخل بيانات المدرس وسيُرسل له بريد تفعيل الحساب."
        icon={UserPlus}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "المدرسين", href: "/dashboard/teachers" },
          { label: "إضافة" },
        ]}
      />

      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-8 text-center"
        >
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft mb-3">
            <CheckCircle2 size={28} />
          </span>
          <p className="text-lg font-black text-emerald-900">تمت إضافة المدرس بنجاح</p>
          <p className="text-[12px] text-emerald-800 mt-1">جاري التحويل إلى قائمة المدرسين...</p>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-5">
          {/* Personal info */}
          <Section title="البيانات الأساسية" desc="معلومات المدرس الشخصية وبيانات الاتصال." icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="الاسم الكامل" error={errors.name} icon={User} required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
                  placeholder="أ. محمد الثناوي"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
              </Field>

              <Field label="اسم المستخدم" error={errors.username} icon={AtSign} required>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrors((er) => ({ ...er, username: "" })); }}
                  placeholder="m.thanawy"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
              </Field>

              <Field label="البريد الإلكتروني" error={errors.email} icon={Mail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); }}
                  placeholder="teacher@lms.eg"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
              </Field>

              <Field label="رقم الهاتف" error={errors.phone} icon={Phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((er) => ({ ...er, phone: "" })); }}
                  placeholder="+20 100 000 0000"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
              </Field>
            </div>
          </Section>

          {/* Academic */}
          <Section title="البيانات الأكاديمية" desc="المادة التي يدرّسها المدرس ونبذة قصيرة عنه." icon={Sparkles}>
            <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">المادة</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => {
                const active = subject === s;
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`text-[11px] font-extrabold rounded-full border-2 px-3 py-1.5 transition ${
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

            <label className="block text-[11px] font-extrabold text-ink-700 mt-4 mb-1.5">نبذة (اختياري)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="مثال: خبرة 15 سنة في تدريس الرياضيات للثانوية العامة..."
              rows={3}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition resize-none"
            />
          </Section>

          {/* Credentials */}
          <Section title="بيانات الدخول" desc="سيستخدم المدرس هذه البيانات لتسجيل الدخول." icon={Lock}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="كلمة المرور" error={errors.password} icon={Lock} required>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: "" })); }}
                  placeholder="••••••••"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-ink-400 hover:text-ink-700 shrink-0" aria-label="إظهار/إخفاء">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </Field>

              <Field label="تأكيد كلمة المرور" error={errors.confirm} icon={Lock} required>
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setErrors((er) => ({ ...er, confirm: "" })); }}
                  placeholder="••••••••"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
              </Field>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={busy}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-soft transition ${
                busy ? "bg-slate-100 text-ink-400 cursor-not-allowed" : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
              }`}
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={13} />
                  حفظ المدرس
                  <ArrowLeft size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ============================================================ */
function Section({
  title,
  desc,
  icon: Icon,
  children,
}: {
  title: string;
  desc?: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 grid place-items-center">
          <Icon size={16} />
        </span>
        <div>
          <p className="text-sm font-extrabold text-ink-900">{title}</p>
          {desc && <p className="text-[11px] text-ink-500">{desc}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  error?: string;
  icon: typeof User;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-600 mr-1">*</span>}
      </label>
      <div
        className={`relative flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${
          error
            ? "border-rose-300"
            : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
        }`}
      >
        <Icon size={14} className="text-ink-400 shrink-0" />
        {children}
      </div>
      {error && (
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
