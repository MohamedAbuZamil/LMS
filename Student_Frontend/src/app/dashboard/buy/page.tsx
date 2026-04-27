"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Library,
  PiggyBank,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { CourseCover } from "@/components/dashboard/CourseCover";
import {
  getCourseOriginalPrice,
  getCoursePrice,
  getCoursesByTeacher,
  teacherCatalogStats,
  teachers,
  type Course,
  type Teacher,
} from "@/lib/data/teachers";
import { currentUser, formatCurrency } from "@/lib/data/currentUser";

type SortKey = "popular" | "price-asc" | "price-desc" | "lessons";

const STORAGE_OWNED = "lms.buy.owned";
const STORAGE_BALANCE = "lms.buy.balance";

export default function BuyCoursesPage() {
  /* ───────── Query params (?teacher=tX&course=cY) ───────── */
  const search = useSearchParams();
  const initialTeacher = useMemo(() => {
    const t = search.get("teacher");
    return t && teachers.some((x) => x.id === t) ? t : teachers[0]?.id ?? "";
  }, [search]);
  const queryCourseId = search.get("course");

  /* ───────── State ───────── */
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacher);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [balance, setBalance] = useState<number>(currentUser.balance);
  const [owned, setOwned] = useState<Record<string, true>>({});
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [purchased, setPurchased] = useState<Course | null>(null);

  /* ───────── Persistence (sessionStorage so clearing tab resets) ───────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const b = window.sessionStorage.getItem(STORAGE_BALANCE);
      const o = window.sessionStorage.getItem(STORAGE_OWNED);
      if (b !== null) setBalance(Number(b));
      if (o) setOwned(JSON.parse(o));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(STORAGE_BALANCE, String(balance));
      window.sessionStorage.setItem(STORAGE_OWNED, JSON.stringify(owned));
    } catch { /* ignore */ }
  }, [balance, owned]);

  /* ───────── Derived ───────── */
  const teacher = teachers.find((t) => t.id === selectedTeacherId) ?? teachers[0];
  const allCourses = teacher ? getCoursesByTeacher(teacher.id) : [];

  /* ───────── Auto-open purchase from ?course=cY ───────── */
  useEffect(() => {
    if (!queryCourseId || !teacher) return;
    const target = allCourses.find((c) => c.id === queryCourseId);
    if (target) setPendingCourse(target);
    // run once when teacher resolves to the requested catalog
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryCourseId, teacher?.id]);
  const stats = useMemo(() => (teacher ? teacherCatalogStats(teacher.id) : null), [teacher]);

  const courses = useMemo(() => {
    let list = allCourses.slice();
    const q = query.trim();
    if (q) list = list.filter((c) => c.title.includes(q) || c.grade.includes(q));
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => getCoursePrice(a) - getCoursePrice(b));
        break;
      case "price-desc":
        list.sort((a, b) => getCoursePrice(b) - getCoursePrice(a));
        break;
      case "lessons":
        list.sort((a, b) => b.lessons - a.lessons);
        break;
      default:
        // popular = original order
        break;
    }
    return list;
  }, [allCourses, query, sort]);

  /* ───────── Handlers ───────── */
  const tryBuy = (c: Course) => setPendingCourse(c);
  const confirmBuy = () => {
    if (!pendingCourse) return;
    const price = getCoursePrice(pendingCourse);
    if (balance < price) return;
    setBalance((b) => b - price);
    setOwned((o) => ({ ...o, [pendingCourse.id]: true }));
    setPurchased(pendingCourse);
    setPendingCourse(null);
  };

  return (
    <div className="space-y-6">
      <Hero balance={balance} ownedCount={Object.keys(owned).length} />

      <TeacherPicker
        selectedId={teacher?.id}
        onSelect={(id) => {
          setSelectedTeacherId(id);
          setQuery("");
        }}
      />

      {teacher && (
        <>
          <TeacherSummary teacher={teacher} stats={stats!} />

          <Toolbar
            query={query}
            setQuery={setQuery}
            sort={sort}
            setSort={setSort}
            count={courses.length}
          />

          {courses.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((c, i) => (
                <BuyCourseCard
                  key={c.id}
                  c={c}
                  index={i}
                  isOwned={!!owned[c.id]}
                  balance={balance}
                  onBuy={() => tryBuy(c)}
                  teacherId={teacher.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ConfirmPurchaseModal
        course={pendingCourse}
        teacher={teacher}
        balance={balance}
        onClose={() => setPendingCourse(null)}
        onConfirm={confirmBuy}
      />
      <PurchaseSuccessModal
        course={purchased}
        teacher={teacher}
        onClose={() => setPurchased(null)}
      />
    </div>
  );
}

/* ============================================================ *
 *                         HERO + WALLET                        *
 * ============================================================ */
function Hero({ balance, ownedCount }: { balance: number; ownedCount: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 rounded-3xl text-white p-5 sm:p-7"
    >
      {/* decorative shapes */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-5">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 border border-white/20 rounded-full px-2.5 py-1 backdrop-blur">
            <ShoppingCart size={12} />
            متجر الكورسات
          </span>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            اشترِ كورساتك بضغطة واحدة
            <span className="block text-white/70 text-base sm:text-lg font-bold mt-1">
              اختر مدرسك المفضل واستعرض كورساته ثم اشترِها مباشرة من رصيدك.
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <Pill icon={ShieldCheck} text="دفع آمن من المحفظة" />
            <Pill icon={BadgeCheck} text="وصول فوري بعد الشراء" />
            <Pill icon={PiggyBank} text="عروض وخصومات" />
          </div>
        </div>

        <WalletCard balance={balance} ownedCount={ownedCount} />
      </div>
    </motion.section>
  );
}

function Pill({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-2.5 py-1 backdrop-blur">
      <Icon size={11} />
      {text}
    </span>
  );
}

function WalletCard({ balance, ownedCount }: { balance: number; ownedCount: number }) {
  return (
    <div className="bg-white/95 text-ink-900 rounded-2xl shadow-soft p-4 sm:p-5 min-w-[240px] backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white grid place-items-center shrink-0 shadow-soft">
          <Wallet size={20} />
        </span>
        <div className="flex-1">
          <p className="text-[10px] text-ink-500 font-bold">رصيد محفظتي</p>
          <p className="text-2xl font-black tabular-nums">{formatCurrency(balance)}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="bg-slate-50 rounded-xl p-2">
          <p className="text-[10px] text-ink-500">كورسات مُمتلكة</p>
          <p className="text-lg font-black text-brand-700 tabular-nums">{ownedCount}</p>
        </div>
        <Link
          href="/dashboard/recharge"
          className="bg-gradient-to-l from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition rounded-xl text-white inline-flex items-center justify-center gap-1.5 text-[11px] font-extrabold shadow-soft"
        >
          <Plus size={12} />
          شحن رصيد
        </Link>
      </div>
    </div>
  );
}

/* ============================================================ *
 *                       TEACHER PICKER                         *
 * ============================================================ */
function TeacherPicker({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 grid place-items-center">
            <GraduationCap size={16} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-ink-900">اختر المدرس</p>
            <p className="text-[11px] text-ink-500">اضغط على بطاقة المدرس لعرض كورساته</p>
          </div>
        </div>
        <span className="text-[11px] text-ink-500">{teachers.length} مدرس</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {teachers.map((t, i) => {
          const active = t.id === selectedId;
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              whileHover={{ y: -4 }}
              className={`relative shrink-0 w-[200px] snap-start text-right rounded-2xl border-2 bg-white p-3 transition ${
                active
                  ? "border-brand-500 shadow-soft ring-2 ring-brand-100"
                  : "border-slate-100 hover:border-brand-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`relative w-12 h-12 rounded-xl overflow-hidden ring-2 ${t.ring} shrink-0`}>
                  <Image
                    src={t.photo}
                    alt={t.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                  {t.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-extrabold text-ink-900 truncate">{t.name}</p>
                  <p className={`text-[10px] font-bold ${t.text} truncate`}>{t.subject}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Library size={10} />
                  {t.courses} كورس
                </span>
                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={10} fill="currentColor" />
                  {t.rating}
                </span>
              </div>
              {active && (
                <motion.span
                  layoutId="teacher-pick"
                  className="absolute -top-2 -left-2 inline-grid place-items-center w-6 h-6 rounded-full bg-brand-600 text-white shadow-soft"
                  transition={{ type: "spring", stiffness: 360, damping: 26 }}
                >
                  <Check size={12} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================ *
 *                     TEACHER SUMMARY STRIP                    *
 * ============================================================ */
function TeacherSummary({
  teacher,
  stats,
}: {
  teacher: Teacher;
  stats: ReturnType<typeof teacherCatalogStats>;
}) {
  return (
    <motion.div
      key={teacher.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ${teacher.ring} shrink-0`}>
          <Image src={teacher.photo} alt={teacher.name} fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-black text-ink-900 truncate">{teacher.name}</p>
          <p className={`text-[12px] font-bold ${teacher.text}`}>{teacher.subject}</p>
          {teacher.bio && <p className="text-[11px] text-ink-500 mt-0.5 truncate">{teacher.bio}</p>}
        </div>
      </div>
      <div className="md:ms-auto grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
        <SummaryStat icon={Library} label="عدد الكورسات" value={`${stats.count}`} />
        <SummaryStat icon={Users} label="عدد الطلاب" value={teacher.students.toLocaleString("ar-EG")} />
        <SummaryStat icon={Tag} label="الأقل سعراً" value={formatCurrency(stats.min)} />
        <SummaryStat icon={Sparkles} label="متوسط السعر" value={formatCurrency(stats.avg)} />
      </div>
    </motion.div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Library;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50/70 rounded-xl border border-slate-100 px-3 py-2 flex items-center gap-2">
      <span className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-brand-600 grid place-items-center shrink-0">
        <Icon size={14} />
      </span>
      <div className="leading-tight">
        <p className="text-[10px] text-ink-500">{label}</p>
        <p className="text-[13px] font-black text-ink-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================ *
 *                          TOOLBAR                             *
 * ============================================================ */
function Toolbar({
  query,
  setQuery,
  sort,
  setSort,
  count,
}: {
  query: string;
  setQuery: (s: string) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  count: number;
}) {
  const sortItems: { k: SortKey; label: string }[] = [
    { k: "popular", label: "الأكثر شعبية" },
    { k: "price-asc", label: "السعر: تصاعدي" },
    { k: "price-desc", label: "السعر: تنازلي" },
    { k: "lessons", label: "الأكثر دروساً" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1 min-w-0">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن كورس..."
          className="w-full bg-slate-50/70 border border-slate-100 rounded-xl pe-9 ps-3 py-2.5 text-sm focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-500 shrink-0">
          <Filter size={12} /> ترتيب:
        </span>
        {sortItems.map((s) => {
          const active = sort === s.k;
          return (
            <button
              key={s.k}
              onClick={() => setSort(s.k)}
              className={`shrink-0 text-[11px] font-extrabold rounded-xl border-2 px-2.5 py-1.5 transition ${
                active
                  ? "border-brand-500 bg-brand-50/60 text-brand-800"
                  : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"
              }`}
            >
              {s.label}
            </button>
          );
        })}
        <span className="shrink-0 text-[11px] text-ink-500 ms-auto whitespace-nowrap">{count} كورس</span>
      </div>
    </div>
  );
}

/* ============================================================ *
 *                       BUY COURSE CARD                        *
 * ============================================================ */
function BuyCourseCard({
  c,
  index,
  isOwned,
  balance,
  teacherId: _teacherId,
  onBuy,
}: {
  c: Course;
  index: number;
  isOwned: boolean;
  balance: number;
  teacherId: string;
  onBuy: () => void;
}) {
  const price = getCoursePrice(c);
  const original = getCourseOriginalPrice(c);
  const off = original ? Math.round(((original - price) / original) * 100) : 0;
  const canAfford = balance >= price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft overflow-hidden flex flex-col transition"
    >
      <div className="relative h-36 overflow-hidden">
        <CourseCover theme={c.theme} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/40 backdrop-blur text-white text-[10px] font-bold rounded-full px-2 py-0.5">
          <Clock size={10} />
          {c.duration}
        </span>
        {off > 0 && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
            <Tag size={10} />
            خصم {off}%
          </span>
        )}
        {isOwned && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-soft">
            <CheckCircle2 size={10} />
            تم الشراء
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="font-extrabold text-sm text-ink-900 line-clamp-1">{c.title}</p>
        <p className="text-[11px] text-ink-500 mt-1 line-clamp-1">{c.grade}</p>

        <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Library size={11} />
            {c.lessons} درس
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} />
            {c.duration}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div className="leading-tight">
            <p className="text-[10px] text-ink-500 font-bold">السعر</p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-black text-ink-900 tabular-nums">{formatCurrency(price)}</p>
              {original && (
                <p className="text-[11px] text-ink-400 line-through tabular-nums">
                  {formatCurrency(original)}
                </p>
              )}
            </div>
          </div>
        </div>

        {isOwned ? (
          <Link
            href="/dashboard/my-teachers"
            className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 text-xs font-extrabold transition"
          >
            <CheckCircle2 size={14} />
            مُمتلك بالفعل
          </Link>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className={`mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold shadow-soft transition ${
              canAfford
                ? "bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white"
                : "bg-slate-100 text-ink-400 cursor-not-allowed"
            }`}
          >
            {canAfford ? (
              <>
                <ShoppingCart size={13} />
                شراء الآن
                <ArrowLeft size={12} />
              </>
            ) : (
              <>
                <AlertTriangle size={13} />
                الرصيد غير كافٍ
              </>
            )}
          </button>
        )}
      </div>
    </motion.article>
  );
}

/* ============================================================ *
 *                         EMPTY STATE                          *
 * ============================================================ */
function EmptyState({ query }: { query: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
      <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-slate-100 text-ink-400">
        <Search size={22} />
      </span>
      <p className="mt-3 text-sm font-extrabold text-ink-900">
        {query ? "لا توجد نتائج تطابق بحثك" : "لا توجد كورسات لهذا المدرس"}
      </p>
      <p className="text-[12px] text-ink-500 mt-1">
        {query ? "جرّب كلمة مختلفة أو امسح حقل البحث." : "اختر مدرساً آخر للاستعراض."}
      </p>
    </div>
  );
}

/* ============================================================ *
 *                     MODALS: CONFIRM / SUCCESS                *
 * ============================================================ */
function ModalShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-card border border-slate-100 w-full max-w-md overflow-hidden"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmPurchaseModal({
  course,
  teacher,
  balance,
  onClose,
  onConfirm,
}: {
  course: Course | null;
  teacher?: Teacher;
  balance: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!course) return <ModalShell open={false} onClose={onClose}>{null}</ModalShell>;
  const price = getCoursePrice(course);
  const original = getCourseOriginalPrice(course);
  const remaining = balance - price;
  const canAfford = remaining >= 0;
  return (
    <ModalShell open={!!course} onClose={onClose}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">تأكيد عملية الشراء</p>
        <button onClick={onClose} className="text-ink-400 hover:text-ink-900 transition">
          <X size={18} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex gap-3">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 shrink-0">
            <CourseCover theme={course.theme} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-ink-900 line-clamp-2">{course.title}</p>
            {teacher && <p className={`text-[11px] font-bold ${teacher.text} mt-0.5`}>{teacher.name}</p>}
            <p className="text-[11px] text-ink-500 mt-0.5">{course.lessons} درس · {course.duration}</p>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-2 text-[12px]">
          <Row label="سعر الكورس" value={formatCurrency(price)} />
          {original && (
            <Row label="السعر الأصلي" value={<span className="line-through text-ink-400">{formatCurrency(original)}</span>} />
          )}
          <div className="border-t border-slate-100 pt-2">
            <Row label="رصيدك الحالي" value={formatCurrency(balance)} />
            <Row
              label="الرصيد بعد الشراء"
              value={
                <span className={canAfford ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}>
                  {formatCurrency(Math.max(0, remaining))}
                </span>
              }
            />
          </div>
        </div>

        {!canAfford && (
          <div className="flex items-start gap-2 text-[12px] bg-rose-50 border border-rose-200 text-rose-900 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-rose-600 mt-0.5 shrink-0" />
            <p>
              رصيدك الحالي غير كافٍ لإتمام الشراء. تحتاج إلى شحن
              <span className="font-extrabold"> {formatCurrency(price - balance)} </span>
              إضافية على الأقل.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
          >
            إلغاء
          </button>
          {canAfford ? (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition inline-flex items-center gap-1.5"
            >
              <ShoppingCart size={13} />
              تأكيد الشراء
            </button>
          ) : (
            <Link
              href="/dashboard/recharge"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-soft transition inline-flex items-center gap-1.5"
            >
              <Wallet size={13} />
              شحن رصيد
            </Link>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-extrabold text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}

function PurchaseSuccessModal({
  course,
  teacher,
  onClose,
}: {
  course: Course | null;
  teacher?: Teacher;
  onClose: () => void;
}) {
  return (
    <ModalShell open={!!course} onClose={onClose}>
      {course && (
        <div className="p-6 text-center">
          <motion.span
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240 }}
            className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft mb-3"
          >
            <Check size={30} />
          </motion.span>
          <p className="text-lg font-black text-ink-900">تم الشراء بنجاح</p>
          <p className="text-[12px] text-ink-600 mt-1">
            تمت إضافة <span className="font-extrabold text-ink-900">{course.title}</span> إلى كورساتك.
          </p>
          {teacher && <p className={`mt-1 text-[11px] font-bold ${teacher.text}`}>{teacher.name}</p>}

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href={`/dashboard/my-teachers/${teacher?.id ?? ""}/${course.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-xs font-extrabold shadow-soft transition"
            >
              <Sparkles size={13} />
              ابدأ الكورس الآن
            </Link>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-ink-700 text-xs font-extrabold hover:border-brand-300 hover:text-brand-700 transition"
            >
              متابعة التسوّق
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
