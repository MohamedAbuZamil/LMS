"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  BadgeCheck,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Edit3,
  GraduationCap,
  KeyRound,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { getTeacher } from "@/lib/data/teachers";
import { getSecretariesByTeacher, type Secretary } from "@/lib/data/secretaries";
import {
  DEFAULT_PERMISSIONS,
  PERMISSIONS,
  type PermissionKey,
} from "@/lib/data/permissions";

type Tab = "overview" | "courses" | "secretaries";

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const teacher = getTeacher(params?.id ?? "");
  if (!teacher) notFound();

  const [tab, setTab] = useState<Tab>("overview");
  const [secretaries, setSecretaries] = useState<Secretary[]>(() =>
    getSecretariesByTeacher(teacher.id)
  );
  const [addOpen, setAddOpen] = useState(false);

  const stats = useMemo(
    () => ({
      courses: teacher.courses,
      students: teacher.students,
      secretaries: secretaries.length,
      rating: teacher.rating,
    }),
    [teacher, secretaries.length]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={teacher.name}
        subtitle={`${teacher.subject} • @${teacher.username}`}
        icon={GraduationCap}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "المدرسين", href: "/dashboard/teachers" },
          { label: teacher.name },
        ]}
        actions={
          <>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
              <Edit3 size={13} />
              تعديل
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-extrabold hover:bg-rose-50 transition">
              {teacher.status === "active" ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
              {teacher.status === "active" ? "إيقاف" : "تنشيط"}
            </button>
          </>
        }
      />

      {/* Profile banner */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl text-white p-5 sm:p-6 bg-gradient-to-br ${teacher.gradFrom} ${teacher.gradTo}`}
      >
        <span aria-hidden className="pointer-events-none absolute -top-20 -left-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-card shrink-0 ${teacher.bg}`}>
            <Image src={teacher.photo} alt={teacher.name} fill sizes="96px" className="object-cover object-top" />
            {teacher.online && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black truncate">{teacher.name}</h2>
              <StatusBadge status={teacher.status} />
            </div>
            <p className="text-white/85 text-sm font-bold mt-0.5">{teacher.subject}</p>
            {teacher.bio && <p className="text-white/75 text-[12px] mt-2 max-w-xl">{teacher.bio}</p>}
            <div className="mt-3 flex items-center flex-wrap gap-3 text-[11px]">
              <Pill icon={AtSign}>{teacher.username}</Pill>
              <Pill icon={Mail}>{teacher.email}</Pill>
              <Pill icon={Phone}>{teacher.phone}</Pill>
              <Pill icon={Calendar}>منذ {new Date(teacher.createdAt).toLocaleDateString("ar-EG")}</Pill>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={BookOpen} label="كورسات" value={stats.courses} bg="bg-emerald-50" fg="text-emerald-700" />
        <Stat icon={Users} label="طلاب" value={stats.students.toLocaleString("ar-EG")} bg="bg-amber-50" fg="text-amber-700" />
        <Stat icon={UserPlus} label="سكرتارية" value={stats.secretaries} bg="bg-pink-50" fg="text-pink-700" />
        <Stat icon={Star} label="تقييم" value={stats.rating.toFixed(1)} bg="bg-brand-50" fg="text-brand-700" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 inline-flex w-full sm:w-auto">
        {([
          { key: "overview", label: "نظرة عامة", icon: User },
          { key: "courses", label: "الكورسات", icon: BookOpen, count: teacher.courses },
          { key: "secretaries", label: "السكرتارية", icon: Users, count: secretaries.length },
        ] as { key: Tab; label: string; icon: typeof User; count?: number }[]).map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                active ? "text-white" : "text-ink-700 hover:text-brand-700"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="teacher-tab-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 shadow-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={13} className="relative z-10" />
              <span className="relative z-10">{t.label}</span>
              {typeof t.count === "number" && (
                <span
                  className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-extrabold ${
                    active ? "bg-white/25 text-white" : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <OverviewTab teacherId={teacher.id} secretaries={secretaries} />
          </motion.div>
        )}
        {tab === "courses" && (
          <motion.div key="courses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <CoursesTab teacherId={teacher.id} />
          </motion.div>
        )}
        {tab === "secretaries" && (
          <motion.div key="secretaries" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <SecretariesTab
              teacherId={teacher.id}
              list={secretaries}
              onAdd={() => setAddOpen(true)}
              onUpdate={setSecretaries}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AddSecretaryModal
        open={addOpen}
        teacherId={teacher.id}
        onClose={() => setAddOpen(false)}
        onCreate={(s) => {
          setSecretaries((arr) => [s, ...arr]);
          setAddOpen(false);
        }}
      />
    </div>
  );
}

/* ============================================================ */
function StatusBadge({ status }: { status: "active" | "suspended" }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full px-2 py-0.5 border ${
        active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"
      }`}
    >
      {active ? <BadgeCheck size={10} /> : <ShieldAlert size={10} />}
      {active ? "نشط" : "موقوف"}
    </span>
  );
}

function Pill({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-2.5 py-1 backdrop-blur">
      <Icon size={11} />
      <span className="font-bold">{children}</span>
    </span>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  bg,
  fg,
}: {
  icon: typeof User;
  label: string;
  value: number | string;
  bg: string;
  fg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
      <span className={`w-11 h-11 rounded-xl ${bg} ${fg} grid place-items-center shrink-0`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xl font-black text-ink-900 leading-none tabular-nums">{value}</p>
        <p className="text-[11px] text-ink-500 mt-1.5">{label}</p>
      </div>
    </div>
  );
}

/* ============================================================ *
 *                    OVERVIEW TAB                              *
 * ============================================================ */
function OverviewTab({
  teacherId,
  secretaries,
}: {
  teacherId: string;
  secretaries: Secretary[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-extrabold text-ink-900 mb-2">إجراءات سريعة</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickAction label="إضافة كورس جديد" icon={BookOpen} href={`/dashboard/teachers/${teacherId}?tab=courses`} />
          <QuickAction label="إضافة سكرتارية" icon={UserPlus} href={`/dashboard/teachers/${teacherId}?tab=secretaries`} />
          <QuickAction label="إعادة ضبط كلمة المرور" icon={KeyRound} />
          <QuickAction label="إرسال إشعار" icon={Mail} />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-extrabold text-ink-900 mb-2">آخر السكرتارية المضافة</p>
        {secretaries.length === 0 ? (
          <p className="text-[12px] text-ink-500 bg-slate-50/70 rounded-xl p-3 text-center">لم تتم إضافة أي سكرتارية بعد.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {secretaries.slice(0, 3).map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                  <User size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-extrabold text-ink-900 truncate">{s.name}</p>
                  <p className="text-[10px] text-ink-500">@{s.username} • {s.permissions.length} صلاحية</p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function QuickAction({ label, icon: Icon, href }: { label: string; icon: typeof User; href?: string }) {
  const className =
    "flex items-center gap-2 bg-slate-50/70 border border-slate-100 rounded-xl px-3 py-2.5 text-[12px] font-extrabold text-ink-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition";
  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon size={14} />
        <span className="flex-1 text-right">{label}</span>
        <ArrowLeft size={12} />
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      <Icon size={14} />
      <span className="flex-1 text-right">{label}</span>
      <ArrowLeft size={12} />
    </button>
  );
}

/* ============================================================ *
 *                    COURSES TAB                               *
 * ============================================================ */
function CoursesTab({ teacherId }: { teacherId: string }) {
  // Placeholder courses (since Admin_Frontend doesn't yet wire to courses backend).
  const placeholder = Array.from({ length: 6 }).map((_, i) => ({
    id: `${teacherId}-c${i + 1}`,
    title: `كورس ${i + 1} للمدرس`,
    grade: "الصف الثالث الثانوي",
    lessons: 12 + i,
    duration: `${6 + (i % 5)} ساعات`,
    status: i % 4 === 0 ? "draft" : "published",
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">كورسات المدرس</p>
        <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition">
          <Plus size={13} />
          إضافة كورس
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {placeholder.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft transition overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-brand-500 via-brand-600 to-fuchsia-500 relative">
              <span aria-hidden className="pointer-events-none absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
              <BookOpen size={80} className="absolute -bottom-3 -left-1 text-white/20 -rotate-12" strokeWidth={1.5} />
              <span
                className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full px-2 py-0.5 ${
                  c.status === "published"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {c.status === "published" ? "منشور" : "مسودّة"}
              </span>
            </div>
            <div className="p-3">
              <p className="text-[13px] font-extrabold text-ink-900 truncate">{c.title}</p>
              <p className="text-[10px] text-ink-500 mt-0.5">{c.grade}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-ink-500">
                <span className="inline-flex items-center gap-1"><BookOpen size={10} /> {c.lessons} درس</span>
                <span className="inline-flex items-center gap-1"><Clock size={10} /> {c.duration}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-brand-200">
                  <Edit3 size={11} />
                  تعديل
                </button>
                <button className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-rose-200" aria-label="حذف">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-ink-500 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 p-3">
        💡 سيتم ربط هذه الواجهة لاحقاً بإدارة الكورسات الفعلية (إضافة حصص + رفع فيديوهات).
      </p>
    </div>
  );
}

/* ============================================================ *
 *                    SECRETARIES TAB                           *
 * ============================================================ */
function SecretariesTab({
  teacherId,
  list,
  onAdd,
  onUpdate,
}: {
  teacherId: string;
  list: Secretary[];
  onAdd: () => void;
  onUpdate: (next: Secretary[]) => void;
}) {
  const toggleStatus = (id: string) => {
    onUpdate(
      list.map((s) =>
        s.id === id ? { ...s, status: s.status === "active" ? "suspended" : "active" } : s
      )
    );
  };

  const remove = (id: string) => {
    if (!confirm("هل تريد حذف هذه السكرتارية؟")) return;
    onUpdate(list.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-ink-900">السكرتارية التابعة للمدرس</p>
          <p className="text-[11px] text-ink-500">إدارة الحسابات المساعدة وصلاحياتها.</p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
        >
          <Plus size={13} />
          إضافة سكرتارية
        </button>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700">
            <UserPlus size={22} />
          </span>
          <p className="mt-3 text-sm font-extrabold text-ink-900">لا توجد سكرتارية بعد</p>
          <p className="text-[12px] text-ink-500 mt-1">أضف أول سكرتارية لهذا المدرس مع تحديد صلاحياتها.</p>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة سكرتارية
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {list.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shrink-0">
                  <User size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-ink-900 truncate">{s.name}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-[10px] text-ink-500 mt-0.5">@{s.username} • {s.email}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-extrabold text-ink-700 mb-1.5">الصلاحيات الممنوحة</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.permissions.length === 0 ? (
                    <span className="text-[11px] text-ink-400">— بدون صلاحيات —</span>
                  ) : (
                    s.permissions.slice(0, 6).map((p) => {
                      const def = PERMISSIONS.find((x) => x.key === p);
                      if (!def) return null;
                      const Icon = def.icon;
                      return (
                        <span key={p} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
                          <Icon size={10} />
                          {def.label}
                        </span>
                      );
                    })
                  )}
                  {s.permissions.length > 6 && (
                    <span className="inline-flex items-center bg-slate-100 text-ink-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
                      +{s.permissions.length - 6}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-brand-200">
                  <Edit3 size={11} />
                  تعديل الصلاحيات
                </button>
                <button
                  onClick={() => toggleStatus(s.id)}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-ink-700 hover:text-amber-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-amber-200"
                  aria-label={s.status === "active" ? "إيقاف" : "تنشيط"}
                >
                  {s.status === "active" ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-rose-200"
                  aria-label="حذف"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================ *
 *                ADD SECRETARY MODAL                           *
 * ============================================================ */
function AddSecretaryModal({
  open,
  teacherId,
  onClose,
  onCreate,
}: {
  open: boolean;
  teacherId: string;
  onClose: () => void;
  onCreate: (s: Secretary) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<PermissionKey[]>(DEFAULT_PERMISSIONS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setPerms(DEFAULT_PERMISSIONS);
    setErrors({});
  };

  const togglePerm = (k: PermissionKey) => {
    setPerms((arr) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 3) er.name = "الاسم يجب أن يكون 3 أحرف فأكثر.";
    if (!/^[a-z0-9._-]{3,}$/i.test(username.trim())) er.username = "اسم المستخدم غير صالح.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) er.email = "بريد غير صحيح.";
    if (password.length < 6) er.password = "كلمة المرور 6 أحرف على الأقل.";
    setErrors(er);
    if (Object.keys(er).length > 0) return;

    setBusy(true);
    window.setTimeout(() => {
      onCreate({
        id: `s-${Date.now()}`,
        teacherId,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
        permissions: perms,
      });
      reset();
      setBusy(false);
    }, 600);
  };

  // group permissions
  const groups = useMemo(() => {
    const map: Record<string, typeof PERMISSIONS> = {};
    for (const p of PERMISSIONS) {
      (map[p.group] ||= []).push(p);
    }
    return Object.entries(map);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink-900/60 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            initial={{ y: 32, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-brand-50/80 to-white">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                  <UserPlus size={16} />
                </span>
                <div>
                  <p className="text-sm font-black text-ink-900">إضافة سكرتارية</p>
                  <p className="text-[11px] text-ink-500">سيتم إنشاء حساب جديد بصلاحيات محدّدة.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 grid place-items-center rounded-xl text-ink-500 hover:bg-slate-100 hover:text-ink-900 transition"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModalField label="الاسم الكامل" icon={User} error={errors.name} required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
                    placeholder="منى السيد"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </ModalField>
                <ModalField label="اسم المستخدم" icon={AtSign} error={errors.username} required>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrors((er) => ({ ...er, username: "" })); }}
                    placeholder="mona.sayed"
                    dir="ltr"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </ModalField>
                <ModalField label="البريد الإلكتروني" icon={Mail} error={errors.email}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); }}
                    placeholder="mona@lms.eg"
                    dir="ltr"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </ModalField>
                <ModalField label="رقم الهاتف" icon={Phone}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    dir="ltr"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </ModalField>
                <ModalField label="كلمة المرور" icon={KeyRound} error={errors.password} required>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: "" })); }}
                    placeholder="••••••••"
                    dir="ltr"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </ModalField>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-extrabold text-ink-900 inline-flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-brand-600" />
                    الصلاحيات
                  </p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPerms(PERMISSIONS.map((p) => p.key))}
                      className="font-extrabold text-brand-700 hover:underline"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-ink-300">•</span>
                    <button
                      type="button"
                      onClick={() => setPerms([])}
                      className="font-extrabold text-rose-700 hover:underline"
                    >
                      إلغاء الكل
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {groups.map(([group, list]) => (
                    <div key={group}>
                      <p className="text-[10px] font-extrabold text-ink-500 mb-1.5">{group}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {list.map((p) => {
                          const checked = perms.includes(p.key);
                          const Icon = p.icon;
                          return (
                            <button
                              type="button"
                              key={p.key}
                              onClick={() => togglePerm(p.key)}
                              className={`text-right flex items-start gap-2 p-2.5 rounded-xl border-2 transition ${
                                checked
                                  ? "border-brand-500 bg-brand-50/60"
                                  : "border-slate-200 bg-white hover:border-brand-200"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 transition ${
                                  checked ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-600"
                                }`}
                              >
                                <Icon size={14} />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[12px] font-extrabold ${checked ? "text-brand-800" : "text-ink-900"}`}>
                                  {p.label}
                                </p>
                                <p className="text-[10px] text-ink-500 mt-0.5 line-clamp-1">{p.description}</p>
                              </div>
                              <span
                                className={`w-5 h-5 rounded-md grid place-items-center shrink-0 mt-0.5 transition ${
                                  checked ? "bg-brand-600 text-white" : "bg-white border-2 border-slate-200"
                                }`}
                              >
                                {checked && <Check size={12} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
              <p className="text-[11px] text-ink-500">
                <span className="font-extrabold text-ink-800 tabular-nums">{perms.length}</span> صلاحية مختارة
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-extrabold shadow-soft transition ${
                    busy ? "bg-slate-100 text-ink-400 cursor-not-allowed" : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
                  }`}
                >
                  {busy ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      إنشاء الحساب
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalField({
  label,
  icon: Icon,
  error,
  required,
  children,
}: {
  label: string;
  icon: typeof User;
  error?: string;
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
