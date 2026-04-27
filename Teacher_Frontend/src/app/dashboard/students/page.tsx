"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Check,
  DollarSign,
  Filter,
  Hash,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses, type Course } from "@/lib/data/courses";
import {
  addPayment,
  enroll,
  getStudentByCode,
  isEnrolled,
  listEnrollmentsByCourse,
  listStudents,
  unenroll,
  type Enrollment,
  type Student,
} from "@/lib/data/students";
import { GOVERNORATES } from "@/lib/data/governorates";
import { getSession } from "@/lib/session";

export default function StudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [gov, setGov] = useState<string>("all");
  const [refresh, setRefresh] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState<{ student: Student; enrollment: Enrollment } | null>(null);

  useEffect(() => {
    const s = getSession();
    const list = listCourses(s?.teacherId);
    setCourses(list);
    if (list.length > 0 && !courseId) setCourseId(list[0].id);
  }, [courseId]);

  const enrolled = useMemo(() => {
    if (!courseId) return [];
    const enrollments = listEnrollmentsByCourse(courseId).filter((e) => e.active);
    const students = listStudents();
    return enrollments
      .map((e) => {
        const student = students.find((s) => s.id === e.studentId);
        return student ? { student, enrollment: e } : null;
      })
      .filter(Boolean) as { student: Student; enrollment: Enrollment }[];
  }, [courseId, refresh]);

  const filtered = useMemo(() => {
    return enrolled.filter(({ student }) => {
      if (gov !== "all" && student.governorate !== gov) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          student.name.toLowerCase().includes(q) ||
          student.code.toLowerCase().includes(q) ||
          student.phone.includes(q)
        );
      }
      return true;
    });
  }, [enrolled, gov, search]);

  const byGov = useMemo(() => {
    const map: Record<string, number> = {};
    enrolled.forEach(({ student }) => {
      map[student.governorate] = (map[student.governorate] ?? 0) + 1;
    });
    return map;
  }, [enrolled]);

  const handleRemove = (studentId: string) => {
    if (!courseId) return;
    if (!confirm("هل تريد إلغاء تسجيل هذا الطالب من الكورس؟")) return;
    unenroll(courseId, studentId);
    setRefresh((n) => n + 1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="الطلاب"
        subtitle="أضف الطلاب لكورساتك بكود الطالب وسجّل دفعاتهم وتابع توزيعهم الجغرافي."
        icon={Users}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الطلاب" }]}
        actions={
          <button
            onClick={() => setAddOpen(true)}
            disabled={!courseId}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-soft transition ${
              !courseId
                ? "bg-slate-100 text-ink-400 cursor-not-allowed"
                : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
            }`}
          >
            <UserPlus size={13} />
            إضافة طالب للكورس
          </button>
        }
      />

      {/* Course picker */}
      {courses.length === 0 ? (
        <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          لا توجد كورسات بعد. أنشئ كورساً أولاً.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 space-y-3">
            <div>
              <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">الكورس</p>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} — {c.grade}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5">
                <Search size={14} className="text-ink-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم/الكود/الهاتف"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5">
                <MapPin size={14} className="text-ink-400 shrink-0" />
                <select
                  value={gov}
                  onChange={(e) => setGov(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900"
                >
                  <option value="all">كل المحافظات</option>
                  {GOVERNORATES.map((g) => (
                    <option key={g} value={g}>{g} {byGov[g] ? `(${byGov[g]})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats by governorate */}
          {Object.keys(byGov).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
              <p className="text-[11px] font-extrabold text-ink-700 mb-2 inline-flex items-center gap-1.5">
                <Filter size={12} />
                التوزيع الجغرافي
              </p>
              <div className="flex items-center flex-wrap gap-1.5">
                {Object.entries(byGov)
                  .sort((a, b) => b[1] - a[1])
                  .map(([g, n]) => (
                    <button
                      key={g}
                      onClick={() => setGov(gov === g ? "all" : g)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold border transition ${
                        gov === g
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100"
                      }`}
                    >
                      <MapPin size={10} />
                      {g}
                      <span className="bg-white/30 rounded-full px-1.5 tabular-nums">{n}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Students list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700">
                <Users size={22} />
              </span>
              <p className="mt-3 text-sm font-extrabold text-ink-900">لا يوجد طلاب مطابقين</p>
              <p className="text-[12px] text-ink-500 mt-1">
                {enrolled.length === 0 ? "ابدأ بإضافة طالب جديد عبر الكود." : "جرّب تغيير الفلاتر."}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(({ student, enrollment }) => (
                <li key={student.id} className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft transition p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {student.photo ? (
                        <Image src={student.photo} alt={student.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-brand-700 font-black">
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-extrabold text-ink-900 truncate">{student.name}</p>
                      <p className="text-[10px] text-ink-500 mt-0.5 inline-flex items-center gap-1">
                        <Hash size={10} /> {student.code}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
                    <Chip icon={MapPin}>{student.governorate}</Chip>
                    <Chip icon={Phone}>{student.phone}</Chip>
                    <Chip icon={DollarSign}>دفع {enrollment.paidAmount} ج</Chip>
                    <Chip icon={BookOpen}>{new Date(enrollment.enrolledAt).toLocaleDateString("ar-EG")}</Chip>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setPaymentOpen({ student, enrollment })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-extrabold transition border border-emerald-100"
                    >
                      <DollarSign size={11} />
                      تسجيل دفعة
                    </button>
                    <button
                      onClick={() => handleRemove(student.id)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition border border-slate-100 hover:border-rose-200"
                      aria-label="إلغاء"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <AddStudentModal
        open={addOpen}
        courseId={courseId}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setAddOpen(false);
          setRefresh((n) => n + 1);
        }}
      />

      <PaymentModal
        data={paymentOpen}
        onClose={() => setPaymentOpen(null)}
        onSaved={() => {
          setPaymentOpen(null);
          setRefresh((n) => n + 1);
        }}
      />
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-50 text-ink-700 rounded-lg px-2 py-1 border border-slate-100 truncate">
      <Icon size={10} className="text-brand-600 shrink-0" />
      <span className="font-bold truncate">{children}</span>
    </span>
  );
}

/* ====================== Add Student Modal ====================== */
function AddStudentModal({
  open,
  courseId,
  onClose,
  onAdded,
}: {
  open: boolean;
  courseId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [code, setCode] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setCode("");
      setPaidAmount("");
      setFoundStudent(null);
      setErr({});
    }
  }, [open]);

  const lookup = () => {
    const s = getStudentByCode(code);
    if (!s) {
      setErr({ code: "لم يتم العثور على طالب بهذا الكود." });
      setFoundStudent(null);
      return;
    }
    if (isEnrolled(courseId, s.id)) {
      setErr({ code: "الطالب مسجّل بالفعل في هذا الكورس." });
      setFoundStudent(null);
      return;
    }
    setErr({});
    setFoundStudent(s);
  };

  const submit = () => {
    if (!foundStudent) {
      setErr({ code: "ابحث عن الطالب أولاً بالكود." });
      return;
    }
    if (paidAmount === "" || Number(paidAmount) < 0) {
      setErr({ paid: "أدخل مبلغ الدفع (يمكن أن يكون 0)." });
      return;
    }
    enroll(courseId, foundStudent.id, Number(paidAmount));
    onAdded();
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
            className="bg-white w-full sm:max-w-md max-h-[92vh] sm:rounded-2xl rounded-t-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-brand-50/80 to-white">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                  <UserPlus size={16} />
                </span>
                <p className="text-sm font-black text-ink-900">إضافة طالب للكورس</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-xl text-ink-500 hover:bg-slate-100 hover:text-ink-900 transition" aria-label="إغلاق">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">كود الطالب</p>
                <div className="flex gap-2">
                  <div className={`flex items-center gap-2 flex-1 bg-slate-50/70 border rounded-xl px-3 py-2.5 ${err.code ? "border-rose-300" : "border-slate-200"}`}>
                    <Hash size={14} className="text-ink-400" />
                    <input
                      dir="ltr"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="A-1001"
                      className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                    />
                  </div>
                  <button
                    onClick={lookup}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-[12px] font-extrabold transition"
                  >
                    <Search size={12} /> بحث
                  </button>
                </div>
                {err.code && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                    <AlertTriangle size={11} /> {err.code}
                  </p>
                )}
              </div>

              {foundStudent && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white shrink-0">
                    {foundStudent.photo ? (
                      <Image src={foundStudent.photo} alt={foundStudent.name} fill sizes="44px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-emerald-700 font-black">{foundStudent.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-extrabold text-emerald-800 truncate">{foundStudent.name}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      {foundStudent.grade} • {foundStudent.governorate}
                    </p>
                  </div>
                  <Check size={16} className="text-emerald-700 shrink-0" />
                </div>
              )}

              <div>
                <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">المبلغ المدفوع (ج)</p>
                <div className={`flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 ${err.paid ? "border-rose-300" : "border-slate-200"}`}>
                  <DollarSign size={14} className="text-ink-400" />
                  <input
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </div>
                {err.paid && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                    <AlertTriangle size={11} /> {err.paid}
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
              <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
                إلغاء
              </button>
              <button
                onClick={submit}
                disabled={!foundStudent}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-extrabold shadow-soft transition ${
                  !foundStudent
                    ? "bg-slate-100 text-ink-400 cursor-not-allowed"
                    : "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
                }`}
              >
                <Plus size={12} /> تسجيل
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ====================== Payment Modal ====================== */
function PaymentModal({
  data,
  onClose,
  onSaved,
}: {
  data: { student: Student; enrollment: Enrollment } | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState<number | "">("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (data) {
      setAmount("");
      setErr("");
    }
  }, [data]);

  const submit = () => {
    if (!data) return;
    if (amount === "" || Number(amount) <= 0) {
      setErr("أدخل مبلغاً أكبر من صفر.");
      return;
    }
    addPayment(data.enrollment.courseId, data.student.id, Number(amount));
    onSaved();
  };

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-ink-900/60 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-card border border-slate-100 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-emerald-50 to-white">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center">
                  <DollarSign size={16} />
                </span>
                <div>
                  <p className="text-sm font-black text-ink-900">تسجيل دفعة</p>
                  <p className="text-[10px] text-ink-500">{data.student.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-xl text-ink-500 hover:bg-slate-100 hover:text-ink-900 transition">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-3 text-[12px] text-ink-700">
                إجمالي المدفوع حتى الآن: <span className="font-extrabold text-ink-900">{data.enrollment.paidAmount} ج</span>
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">المبلغ الجديد (ج)</p>
                <div className={`flex items-center gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 ${err ? "border-rose-300" : "border-slate-200"}`}>
                  <DollarSign size={14} className="text-ink-400" />
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="500"
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300"
                  />
                </div>
                {err && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                    <AlertTriangle size={11} /> {err}
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
              <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
                إلغاء
              </button>
              <button
                onClick={submit}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-extrabold shadow-soft transition"
              >
                <Check size={12} /> تسجيل الدفعة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
