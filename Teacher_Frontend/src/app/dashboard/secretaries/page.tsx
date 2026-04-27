"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AtSign,
  BadgeCheck,
  Check,
  Edit3,
  KeyRound,
  Mail,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import {
  listSecretaries,
  removeSecretary,
  upsertSecretary,
  type Secretary,
} from "@/lib/data/secretaries";
import {
  DEFAULT_PERMISSIONS,
  PERMISSIONS,
  type PermissionKey,
} from "@/lib/data/permissions";

export default function SecretariesPage() {
  const [list, setList] = useState<Secretary[]>([]);
  const [editing, setEditing] = useState<Secretary | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setList(listSecretaries());
  }, []);

  const onSave = (s: Secretary) => {
    upsertSecretary(s);
    setList(listSecretaries());
    setOpen(false);
    setEditing(null);
  };

  const onDelete = (id: string) => {
    if (!confirm("هل تريد حذف هذه السكرتارية؟")) return;
    removeSecretary(id);
    setList(listSecretaries());
  };

  const toggleStatus = (s: Secretary) => {
    upsertSecretary({ ...s, status: s.status === "active" ? "suspended" : "active" });
    setList(listSecretaries());
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="السكرتارية"
        subtitle="أنشئ حسابات سكرتارية بصلاحيات محددة لمساعدتك في إدارة الكورسات والطلاب."
        icon={Users2}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "السكرتارية" }]}
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
          >
            <Plus size={13} />
            إضافة سكرتارية
          </button>
        }
      />

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700">
            <UserPlus size={22} />
          </span>
          <p className="mt-3 text-sm font-extrabold text-ink-900">لا توجد سكرتارية بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {list.map((s) => (
            <article key={s.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-brand-200 transition">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shrink-0">
                  <User size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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
                <button
                  onClick={() => {
                    setEditing(s);
                    setOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 text-[11px] font-extrabold transition border border-slate-100 hover:border-brand-200"
                >
                  <Edit3 size={11} />
                  تعديل
                </button>
                <button
                  onClick={() => toggleStatus(s)}
                  className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-ink-700 hover:text-amber-700 transition border border-slate-100"
                  aria-label={s.status === "active" ? "إيقاف" : "تنشيط"}
                >
                  {s.status === "active" ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition border border-slate-100"
                  aria-label="حذف"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <SecretaryModal open={open} existing={editing} onClose={() => setOpen(false)} onSave={onSave} />
    </div>
  );
}

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

function SecretaryModal({
  open,
  existing,
  onClose,
  onSave,
}: {
  open: boolean;
  existing: Secretary | null;
  onClose: () => void;
  onSave: (s: Secretary) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<PermissionKey[]>(DEFAULT_PERMISSIONS);
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setName(existing.name);
      setUsername(existing.username);
      setEmail(existing.email);
      setPhone(existing.phone);
      setPassword("");
      setPerms(existing.permissions);
    } else {
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setPerms(DEFAULT_PERMISSIONS);
    }
    setErr({});
  }, [open, existing]);

  const togglePerm = (k: PermissionKey) => {
    setPerms((arr) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]));
  };

  const groups = useMemo(() => {
    const map: Record<string, typeof PERMISSIONS> = {};
    for (const p of PERMISSIONS) (map[p.group] ||= []).push(p);
    return Object.entries(map);
  }, []);

  const submit = () => {
    const er: Record<string, string> = {};
    if (name.trim().length < 3) er.name = "الاسم 3 أحرف فأكثر.";
    if (!/^[a-z0-9._-]{3,}$/i.test(username.trim())) er.username = "اسم المستخدم غير صالح.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) er.email = "بريد غير صحيح.";
    if (!existing && password.length < 6) er.password = "كلمة المرور 6 أحرف على الأقل.";
    setErr(er);
    if (Object.keys(er).length > 0) return;

    onSave({
      id: existing?.id ?? `s-${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      phone: phone.trim(),
      status: existing?.status ?? "active",
      createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
      permissions: perms,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink-900/60 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-brand-50/80 to-white">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                  <UserPlus size={16} />
                </span>
                <p className="text-sm font-black text-ink-900">{existing ? "تعديل سكرتارية" : "إضافة سكرتارية"}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-xl text-ink-500 hover:bg-slate-100 hover:text-ink-900 transition">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="الاسم الكامل" icon={User} error={err.name} required>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
                </Field>
                <Field label="اسم المستخدم" icon={AtSign} error={err.username} required>
                  <input dir="ltr" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
                </Field>
                <Field label="البريد" icon={Mail} error={err.email}>
                  <input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
                </Field>
                <Field label="الهاتف" icon={Phone}>
                  <input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
                </Field>
                {!existing && (
                  <Field label="كلمة المرور" icon={KeyRound} error={err.password} required>
                    <input dir="ltr" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
                  </Field>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-extrabold text-ink-900 inline-flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-brand-600" />
                    الصلاحيات
                  </p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button type="button" onClick={() => setPerms(PERMISSIONS.map((p) => p.key))} className="font-extrabold text-brand-700 hover:underline">تحديد الكل</button>
                    <span className="text-ink-300">•</span>
                    <button type="button" onClick={() => setPerms([])} className="font-extrabold text-rose-700 hover:underline">إلغاء الكل</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {groups.map(([group, items]) => (
                    <div key={group}>
                      <p className="text-[10px] font-extrabold text-ink-500 mb-1.5">{group}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((p) => {
                          const checked = perms.includes(p.key);
                          const Icon = p.icon;
                          return (
                            <button
                              type="button"
                              key={p.key}
                              onClick={() => togglePerm(p.key)}
                              className={`text-right flex items-start gap-2 p-2.5 rounded-xl border-2 transition ${checked ? "border-brand-500 bg-brand-50/60" : "border-slate-200 bg-white hover:border-brand-200"}`}
                            >
                              <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 transition ${checked ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-600"}`}>
                                <Icon size={14} />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[12px] font-extrabold ${checked ? "text-brand-800" : "text-ink-900"}`}>{p.label}</p>
                                <p className="text-[10px] text-ink-500 mt-0.5 line-clamp-1">{p.description}</p>
                              </div>
                              <span className={`w-5 h-5 rounded-md grid place-items-center shrink-0 mt-0.5 transition ${checked ? "bg-brand-600 text-white" : "bg-white border-2 border-slate-200"}`}>
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

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
              <p className="text-[11px] text-ink-500">
                <span className="font-extrabold text-ink-800 tabular-nums">{perms.length}</span> صلاحية مختارة
              </p>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
                  إلغاء
                </button>
                <button onClick={submit} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[12px] font-extrabold shadow-soft transition">
                  <Check size={12} /> {existing ? "حفظ" : "إنشاء"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, icon: Icon, error, required, children }: { label: string; icon: typeof User; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-600 mr-1">*</span>}
      </label>
      <div className={`flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${error ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"}`}>
        <Icon size={14} className="text-ink-400 shrink-0" />
        {children}
      </div>
      {error && (
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
          <AlertTriangle size={11} /> {error}
        </p>
      )}
    </div>
  );
}
