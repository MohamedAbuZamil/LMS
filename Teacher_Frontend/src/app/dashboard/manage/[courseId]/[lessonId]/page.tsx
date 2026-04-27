"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  Database,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Lock,
  Plus,
  Server,
  Shuffle,
  Trash2,
  Type,
  Video,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import {
  EXAM_VISIBILITY_OPTIONS,
  VIDEO_SERVERS,
  getCourse,
  upsertLesson,
  type ExamVisibility,
  type Lesson,
  type LessonExam,
  type LessonFile,
  type LessonVideo,
  type RandomFromBank,
  type VideoServer,
} from "@/lib/data/courses";
import { listBanks, type QuestionBank } from "@/lib/data/questionBanks";
import { EXAM_DURATIONS_MIN } from "@/lib/data/governorates";
import { getSession } from "@/lib/session";

type Tab = "videos" | "exams" | "files";

export default function LessonManagePage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [tab, setTab] = useState<Tab>("videos");

  const [videoModal, setVideoModal] = useState<{ open: boolean; existing: LessonVideo | null }>({ open: false, existing: null });
  const [fileModal, setFileModal] = useState<{ open: boolean; existing: LessonFile | null }>({ open: false, existing: null });
  const [examModal, setExamModal] = useState<{ open: boolean; existing: LessonExam | null }>({ open: false, existing: null });

  useEffect(() => {
    const c = getCourse(params?.courseId ?? "");
    const l = c?.lessons.find((x) => x.id === params?.lessonId);
    if (!c || !l) {
      router.replace(`/dashboard/manage/${params?.courseId ?? ""}`);
      return;
    }
    setCourseTitle(c.title);
    setLesson(l);
  }, [params?.courseId, params?.lessonId, router]);

  if (!lesson) return null;

  const persist = (next: Lesson) => {
    upsertLesson(params.courseId, next);
    setLesson(next);
  };

  /* Videos */
  const saveVideo = (v: LessonVideo) => {
    const idx = lesson.videos.findIndex((x) => x.id === v.id);
    const videos = idx >= 0 ? lesson.videos.map((x) => (x.id === v.id ? v : x)) : [...lesson.videos, v];
    persist({ ...lesson, videos });
    setVideoModal({ open: false, existing: null });
  };
  const deleteVideo = (id: string) => {
    if (!confirm("حذف هذا الفيديو؟")) return;
    persist({ ...lesson, videos: lesson.videos.filter((x) => x.id !== id) });
  };

  /* Files */
  const saveFile = (f: LessonFile) => {
    const idx = lesson.files.findIndex((x) => x.id === f.id);
    const files = idx >= 0 ? lesson.files.map((x) => (x.id === f.id ? f : x)) : [...lesson.files, f];
    persist({ ...lesson, files });
    setFileModal({ open: false, existing: null });
  };
  const deleteFile = (id: string) => {
    if (!confirm("حذف هذا الملف؟")) return;
    persist({ ...lesson, files: lesson.files.filter((x) => x.id !== id) });
  };

  /* Exams */
  const saveExam = (e: LessonExam) => {
    const idx = lesson.exams.findIndex((x) => x.id === e.id);
    const exams = idx >= 0 ? lesson.exams.map((x) => (x.id === e.id ? e : x)) : [...lesson.exams, e];
    persist({ ...lesson, exams });
    setExamModal({ open: false, existing: null });
  };
  const deleteExam = (id: string) => {
    if (!confirm("حذف هذا الامتحان؟")) return;
    persist({ ...lesson, exams: lesson.exams.filter((x) => x.id !== id) });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={lesson.title}
        subtitle={`${courseTitle} • إدارة محتوى الحصة`}
        icon={ClipboardList}
        crumbs={[
          { label: "اللوحة", href: "/dashboard" },
          { label: "إدارة الحصص", href: "/dashboard/manage" },
          { label: courseTitle, href: `/dashboard/manage/${params.courseId}` },
          { label: lesson.title },
        ]}
      />

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1.5 inline-flex w-full sm:w-auto">
        {([
          { key: "videos", label: "الفيديوهات", icon: Video, count: lesson.videos.length },
          { key: "exams", label: "الامتحانات", icon: ClipboardList, count: lesson.exams.length },
          { key: "files", label: "الملفات", icon: FileText, count: lesson.files.length },
        ] as { key: Tab; label: string; icon: typeof Video; count: number }[]).map((t) => {
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
                  layoutId="lesson-tab-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 shadow-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={13} className="relative z-10" />
              <span className="relative z-10">{t.label}</span>
              <span className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-extrabold ${active ? "bg-white/25 text-white" : "bg-brand-50 text-brand-700"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "videos" && (
          <motion.div key="v" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <VideosTab
              videos={lesson.videos}
              onAdd={() => setVideoModal({ open: true, existing: null })}
              onEdit={(v) => setVideoModal({ open: true, existing: v })}
              onDelete={deleteVideo}
            />
          </motion.div>
        )}
        {tab === "exams" && (
          <motion.div key="e" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <ExamsTab
              exams={lesson.exams}
              onAdd={() => setExamModal({ open: true, existing: null })}
              onEdit={(e) => setExamModal({ open: true, existing: e })}
              onDelete={deleteExam}
            />
          </motion.div>
        )}
        {tab === "files" && (
          <motion.div key="f" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <FilesTab
              files={lesson.files}
              onAdd={() => setFileModal({ open: true, existing: null })}
              onEdit={(f) => setFileModal({ open: true, existing: f })}
              onDelete={deleteFile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <VideoModal
        open={videoModal.open}
        existing={videoModal.existing}
        onClose={() => setVideoModal({ open: false, existing: null })}
        onSave={saveVideo}
      />
      <FileModal
        open={fileModal.open}
        existing={fileModal.existing}
        onClose={() => setFileModal({ open: false, existing: null })}
        onSave={saveFile}
      />
      <ExamModal
        open={examModal.open}
        existing={examModal.existing}
        onClose={() => setExamModal({ open: false, existing: null })}
        onSave={saveExam}
      />
    </div>
  );
}

/* ============================================================
 *                    VIDEOS TAB
 * ============================================================ */
function VideosTab({
  videos,
  onAdd,
  onEdit,
  onDelete,
}: {
  videos: LessonVideo[];
  onAdd: () => void;
  onEdit: (v: LessonVideo) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">فيديوهات الحصة</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[11px] font-extrabold shadow-soft transition"
        >
          <Plus size={12} /> إضافة فيديو
        </button>
      </div>

      {videos.length === 0 ? (
        <Empty icon={Video} title="لا توجد فيديوهات" />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {videos.map((v) => {
            const serverMeta = VIDEO_SERVERS.find((s) => s.key === v.server);
            return (
              <li key={v.id} className="bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-soft transition overflow-hidden flex flex-col">
                <div className="h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-700 relative">
                  <Video size={64} className="absolute -bottom-2 -left-2 text-white/20 -rotate-12" strokeWidth={1.5} />
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 text-brand-700 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-soft">
                    <Server size={10} />
                    {serverMeta?.label}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-[12px] font-extrabold text-ink-900 line-clamp-1">{v.title}</p>
                  {v.description && <p className="text-[10px] text-ink-500 line-clamp-2 mt-0.5">{v.description}</p>}
                  <div className="mt-2 flex items-center flex-wrap gap-1.5 text-[10px]">
                    <Tag icon={Clock}>{v.durationMin} د</Tag>
                    <Tag icon={Eye}>{v.maxViews} مشاهدات</Tag>
                  </div>
                  <div className="mt-auto pt-2 flex items-center gap-1.5">
                    <button onClick={() => onEdit(v)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 text-[10px] font-extrabold transition border border-slate-100 hover:border-brand-200">
                      <Edit3 size={10} /> تعديل
                    </button>
                    <button onClick={() => onDelete(v.id)} className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition" aria-label="حذف">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
 *                    FILES TAB
 * ============================================================ */
function FilesTab({
  files,
  onAdd,
  onEdit,
  onDelete,
}: {
  files: LessonFile[];
  onAdd: () => void;
  onEdit: (f: LessonFile) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">ملفات الحصة</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[11px] font-extrabold shadow-soft transition"
        >
          <Plus size={12} /> إضافة ملف
        </button>
      </div>

      {files.length === 0 ? (
        <Empty icon={FileText} title="لا توجد ملفات" />
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center shrink-0 uppercase text-[10px] font-black">
                {f.kind}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-extrabold text-ink-900 truncate">{f.title}</p>
                {f.description && <p className="text-[10px] text-ink-500 truncate">{f.description}</p>}
                {f.sizeKb && <p className="text-[10px] text-ink-500 mt-0.5">{f.sizeKb} كيلوبايت</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => onEdit(f)} className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 transition" aria-label="تعديل">
                  <Edit3 size={11} />
                </button>
                <button onClick={() => onDelete(f.id)} className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition" aria-label="حذف">
                  <Trash2 size={11} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
 *                    EXAMS TAB
 * ============================================================ */
function ExamsTab({
  exams,
  onAdd,
  onEdit,
  onDelete,
}: {
  exams: LessonExam[];
  onAdd: () => void;
  onEdit: (e: LessonExam) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink-900">امتحانات الحصة</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[11px] font-extrabold shadow-soft transition"
        >
          <Plus size={12} /> إضافة امتحان
        </button>
      </div>

      {exams.length === 0 ? (
        <Empty icon={ClipboardList} title="لا توجد امتحانات" />
      ) : (
        <ul className="space-y-2">
          {exams.map((e) => {
            const v = EXAM_VISIBILITY_OPTIONS.find((x) => x.key === e.visibility)!;
            const VIcon = e.visibility === "visible" ? Eye : e.visibility === "hidden" ? EyeOff : Lock;
            const total = e.manualQuestions.length + e.randomFromBanks.reduce((a, x) => a + x.count, 0);
            return (
              <li key={e.id} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white grid place-items-center shrink-0">
                    <ClipboardList size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="text-[13px] font-extrabold text-ink-900">{e.title}</p>
                      <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
                        <VIcon size={10} />
                        {v.label}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center flex-wrap gap-1.5 text-[10px] text-ink-500">
                      <Tag icon={Calendar}>{new Date(e.startAt).toLocaleString("ar-EG")}</Tag>
                      <Tag icon={Clock}>{e.durationMin} د</Tag>
                      <Tag icon={Hash}>{total} سؤال</Tag>
                      {e.randomFromBanks.length > 0 && <Tag icon={Shuffle}>عشوائي</Tag>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => onEdit(e)} className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-ink-700 hover:text-brand-700 transition" aria-label="تعديل">
                      <Edit3 size={11} />
                    </button>
                    <button onClick={() => onDelete(e.id)} className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-ink-500 hover:text-rose-700 transition" aria-label="حذف">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
 *                    Shared mini components
 * ============================================================ */
function Empty({ icon: Icon, title }: { icon: typeof Video; title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
      <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-700">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-[13px] font-extrabold text-ink-900">{title}</p>
    </div>
  );
}

function Tag({ icon: Icon, children }: { icon: typeof Video; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-50 text-ink-700 rounded-full px-2 py-0.5 border border-slate-100">
      <Icon size={10} className="text-brand-600" />
      <span className="font-bold">{children}</span>
    </span>
  );
}

function ModalShell({
  open,
  title,
  icon: Icon,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: {
  open: boolean;
  title: string;
  icon: typeof Video;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  children: React.ReactNode;
}) {
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
            onClick={(ev) => ev.stopPropagation()}
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-brand-50/80 to-white">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white grid place-items-center shadow-soft">
                  <Icon size={16} />
                </span>
                <p className="text-sm font-black text-ink-900">{title}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-xl text-ink-500 hover:bg-slate-100 hover:text-ink-900 transition" aria-label="إغلاق">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
              <button type="button" onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-ink-700 text-[12px] font-extrabold hover:border-brand-300 hover:text-brand-700 transition">
                إلغاء
              </button>
              <button type="button" onClick={onSubmit} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[12px] font-extrabold shadow-soft transition">
                <Check size={12} />
                {submitLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormField({ label, icon: Icon, children, error, required }: { label: string; icon: typeof Video; children: React.ReactNode; error?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-600 mr-1">*</span>}
      </label>
      <div className={`flex items-start gap-2 bg-slate-50/70 border rounded-xl px-3 py-2.5 transition ${error ? "border-rose-300" : "border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"}`}>
        <Icon size={14} className="text-ink-400 shrink-0 mt-0.5" />
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

/* ============================================================
 *                    VIDEO MODAL
 * ============================================================ */
function VideoModal({
  open,
  existing,
  onClose,
  onSave,
}: {
  open: boolean;
  existing: LessonVideo | null;
  onClose: () => void;
  onSave: (v: LessonVideo) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [server, setServer] = useState<VideoServer>("youtube");
  const [sourceUrl, setSourceUrl] = useState("");
  const [durationMin, setDurationMin] = useState(45);
  const [maxViews, setMaxViews] = useState(3);
  const [thumbnail, setThumbnail] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? "");
      setServer(existing.server);
      setSourceUrl(existing.sourceUrl);
      setDurationMin(existing.durationMin);
      setMaxViews(existing.maxViews);
      setThumbnail(existing.thumbnail ?? "");
    } else {
      setTitle("");
      setDescription("");
      setServer("youtube");
      setSourceUrl("");
      setDurationMin(45);
      setMaxViews(3);
      setThumbnail("");
    }
    setErr({});
  }, [open, existing]);

  const submit = () => {
    const er: Record<string, string> = {};
    if (title.trim().length < 3) er.title = "اكتب عنواناً للفيديو.";
    if (!sourceUrl.trim()) er.sourceUrl = "أدخل الرابط أو المعرف.";
    if (durationMin < 1) er.durationMin = "المدة 1 دقيقة على الأقل.";
    if (maxViews < 1) er.maxViews = "عدد المشاهدات 1 على الأقل.";
    setErr(er);
    if (Object.keys(er).length > 0) return;
    onSave({
      id: existing?.id ?? `v-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      server,
      sourceUrl: sourceUrl.trim(),
      durationMin: Number(durationMin),
      maxViews: Number(maxViews),
      thumbnail: thumbnail.trim() || undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <ModalShell open={open} title={existing ? "تعديل الفيديو" : "إضافة فيديو"} icon={Video} onClose={onClose} onSubmit={submit} submitLabel="حفظ">
      <div>
        <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">سيرفر الفيديو</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {VIDEO_SERVERS.map((s) => {
            const active = server === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setServer(s.key)}
                className={`text-right p-2.5 rounded-xl border-2 transition ${active ? "border-brand-500 bg-brand-50/60" : "border-slate-200 bg-white hover:border-brand-200"}`}
              >
                <p className={`text-[12px] font-extrabold ${active ? "text-brand-800" : "text-ink-900"}`}>{s.label}</p>
                <p className="text-[10px] text-ink-500 mt-0.5 line-clamp-1">{s.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <FormField label="عنوان الفيديو" icon={Type} error={err.title} required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="شرح التفاضل" className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300" />
      </FormField>
      <FormField label="رابط الفيديو / المعرف" icon={Server} error={err.sourceUrl} required>
        <input dir="ltr" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="المدة (دقائق)" icon={Clock} error={err.durationMin} required>
          <input type="number" min={1} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value) || 0)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
        </FormField>
        <FormField label="عدد المشاهدات المسموحة" icon={Eye} error={err.maxViews} required>
          <input type="number" min={1} value={maxViews} onChange={(e) => setMaxViews(Number(e.target.value) || 0)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
        </FormField>
      </div>
      <FormField label="رابط الصورة (اختياري)" icon={Hash}>
        <input dir="ltr" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300" />
      </FormField>
      <FormField label="الوصف (اختياري)" icon={FileText}>
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="نبذة..." className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300 resize-y" />
      </FormField>
    </ModalShell>
  );
}

/* ============================================================
 *                    FILE MODAL
 * ============================================================ */
function FileModal({
  open,
  existing,
  onClose,
  onSave,
}: {
  open: boolean;
  existing: LessonFile | null;
  onClose: () => void;
  onSave: (f: LessonFile) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<LessonFile["kind"]>("pdf");
  const [sizeKb, setSizeKb] = useState<number | "">("");
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description ?? "");
      setUrl(existing.url);
      setKind(existing.kind);
      setSizeKb(existing.sizeKb ?? "");
    } else {
      setTitle("");
      setDescription("");
      setUrl("");
      setKind("pdf");
      setSizeKb("");
    }
    setErr({});
  }, [open, existing]);

  const submit = () => {
    const er: Record<string, string> = {};
    if (title.trim().length < 3) er.title = "اكتب اسماً للملف.";
    if (!url.trim()) er.url = "أدخل رابط الملف.";
    setErr(er);
    if (Object.keys(er).length > 0) return;
    onSave({
      id: existing?.id ?? `f-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      url: url.trim(),
      kind,
      sizeKb: sizeKb === "" ? undefined : Number(sizeKb),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <ModalShell open={open} title={existing ? "تعديل الملف" : "إضافة ملف"} icon={FileText} onClose={onClose} onSubmit={submit} submitLabel="حفظ">
      <FormField label="اسم الملف" icon={Type} error={err.title} required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ملخص التفاضل.pdf" className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300" />
      </FormField>
      <FormField label="رابط الملف" icon={Server} error={err.url} required>
        <input dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="النوع" icon={FileText}>
          <select value={kind} onChange={(e) => setKind(e.target.value as LessonFile["kind"])} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900">
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="image">صورة</option>
            <option value="other">أخرى</option>
          </select>
        </FormField>
        <FormField label="الحجم (KB)" icon={Hash}>
          <input type="number" min={0} value={sizeKb} onChange={(e) => setSizeKb(e.target.value === "" ? "" : Number(e.target.value))} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
        </FormField>
      </div>
      <FormField label="الوصف" icon={FileText}>
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300 resize-y" />
      </FormField>
    </ModalShell>
  );
}

/* ============================================================
 *                    EXAM MODAL (with bank picker)
 * ============================================================ */
function ExamModal({
  open,
  existing,
  onClose,
  onSave,
}: {
  open: boolean;
  existing: LessonExam | null;
  onClose: () => void;
  onSave: (e: LessonExam) => void;
}) {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [visibility, setVisibility] = useState<ExamVisibility>("hidden");
  const [mode, setMode] = useState<"manual" | "random">("manual");
  const [manual, setManual] = useState<{ bankId: string; questionId: string }[]>([]);
  const [random, setRandom] = useState<RandomFromBank[]>([]);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const s = getSession();
    setBanks(listBanks(s?.teacherId));
    if (existing) {
      setTitle(existing.title);
      setStartAt(existing.startAt.slice(0, 16));
      setEndAt(existing.endAt.slice(0, 16));
      setDurationMin(existing.durationMin);
      setVisibility(existing.visibility);
      setManual(existing.manualQuestions);
      setRandom(existing.randomFromBanks);
      setMode(existing.randomFromBanks.length > 0 ? "random" : "manual");
    } else {
      setTitle("");
      setStartAt("");
      setEndAt("");
      setDurationMin(60);
      setVisibility("hidden");
      setManual([]);
      setRandom([]);
      setMode("manual");
    }
    setErr({});
  }, [open, existing]);

  const totalQuestions = useMemo(() => {
    if (mode === "manual") return manual.length;
    return random.reduce((a, x) => a + x.count, 0);
  }, [mode, manual, random]);

  const toggleManual = (bankId: string, questionId: string) => {
    setManual((arr) => {
      const exists = arr.find((x) => x.bankId === bankId && x.questionId === questionId);
      if (exists) return arr.filter((x) => !(x.bankId === bankId && x.questionId === questionId));
      return [...arr, { bankId, questionId }];
    });
  };

  const setRandomCount = (bankId: string, count: number) => {
    setRandom((arr) => {
      const exists = arr.find((x) => x.bankId === bankId);
      if (exists) {
        if (count <= 0) return arr.filter((x) => x.bankId !== bankId);
        return arr.map((x) => (x.bankId === bankId ? { ...x, count } : x));
      }
      if (count <= 0) return arr;
      return [...arr, { bankId, count }];
    });
  };

  const submit = () => {
    const er: Record<string, string> = {};
    if (title.trim().length < 3) er.title = "اكتب اسماً للامتحان.";
    if (!startAt) er.startAt = "اختر تاريخ البدء.";
    if (!endAt) er.endAt = "اختر تاريخ الانتهاء.";
    if (durationMin < 1) er.durationMin = "اختر مدة صحيحة.";
    if (totalQuestions === 0) er.questions = "اختر سؤالاً واحداً على الأقل.";
    setErr(er);
    if (Object.keys(er).length > 0) return;
    onSave({
      id: existing?.id ?? `ex-${Date.now()}`,
      title: title.trim(),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      durationMin: Number(durationMin),
      visibility,
      manualQuestions: mode === "manual" ? manual : [],
      randomFromBanks: mode === "random" ? random : [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <ModalShell open={open} title={existing ? "تعديل الامتحان" : "إضافة امتحان"} icon={ClipboardList} onClose={onClose} onSubmit={submit} submitLabel="حفظ الامتحان">
      <FormField label="عنوان الامتحان" icon={Type} error={err.title} required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="امتحان الحصة الأولى" className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900 placeholder:text-ink-300" />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="تاريخ ووقت البدء" icon={Calendar} error={err.startAt} required>
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
        </FormField>
        <FormField label="تاريخ ووقت الانتهاء" icon={Calendar} error={err.endAt} required>
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900" />
        </FormField>
        <FormField label="مدة الامتحان" icon={Clock} error={err.durationMin} required>
          <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900">
            {EXAM_DURATIONS_MIN.map((m) => (
              <option key={m} value={m}>{m >= 60 ? `${Math.floor(m / 60)} ساعة${m % 60 ? ` و${m % 60} دقيقة` : ""}` : `${m} دقيقة`}</option>
            ))}
          </select>
        </FormField>
        <FormField label="حالة الامتحان" icon={Eye}>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as ExamVisibility)} className="flex-1 bg-transparent outline-none text-sm font-bold text-ink-900">
            {EXAM_VISIBILITY_OPTIONS.map((v) => (
              <option key={v.key} value={v.key}>{v.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Mode picker */}
      <div>
        <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">طريقة اختيار الأسئلة</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`text-right p-3 rounded-xl border-2 transition ${mode === "manual" ? "border-brand-500 bg-brand-50/60" : "border-slate-200 bg-white hover:border-brand-200"}`}
          >
            <p className="text-[12px] font-extrabold text-ink-900 inline-flex items-center gap-1.5">
              <Database size={12} /> اختيار يدوي
            </p>
            <p className="text-[10px] text-ink-500 mt-0.5">اختر أسئلة محددة من بنوك مختلفة.</p>
          </button>
          <button
            type="button"
            onClick={() => setMode("random")}
            className={`text-right p-3 rounded-xl border-2 transition ${mode === "random" ? "border-brand-500 bg-brand-50/60" : "border-slate-200 bg-white hover:border-brand-200"}`}
          >
            <p className="text-[12px] font-extrabold text-ink-900 inline-flex items-center gap-1.5">
              <Shuffle size={12} /> عشوائي من بنوك
            </p>
            <p className="text-[10px] text-ink-500 mt-0.5">حدّد عدد أسئلة من كل بنك ليتم اختيارها عشوائياً.</p>
          </button>
        </div>
      </div>

      {banks.length === 0 ? (
        <p className="text-center text-[12px] text-ink-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
          لا توجد بنوك أسئلة. أنشئ بنكاً أولاً من قسم بنوك الأسئلة.
        </p>
      ) : mode === "manual" ? (
        <div className="space-y-3">
          {banks.map((b) => (
            <div key={b.id} className="bg-slate-50/70 rounded-xl border border-slate-200 p-3">
              <p className="text-[12px] font-extrabold text-ink-900 mb-2 inline-flex items-center gap-1.5">
                <Database size={12} className="text-brand-600" />
                {b.title}
                <span className="text-[10px] text-ink-500 font-bold">({b.questions.length} سؤال)</span>
              </p>
              {b.questions.length === 0 ? (
                <p className="text-[11px] text-ink-500">لا توجد أسئلة في هذا البنك.</p>
              ) : (
                <ul className="space-y-1.5">
                  {b.questions.map((q) => {
                    const checked = manual.some((m) => m.bankId === b.id && m.questionId === q.id);
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => toggleManual(b.id, q.id)}
                          className={`w-full text-right flex items-start gap-2 p-2 rounded-lg border-2 transition ${checked ? "border-brand-500 bg-white" : "border-slate-200 bg-white hover:border-brand-200"}`}
                        >
                          <span className={`w-5 h-5 rounded-md grid place-items-center shrink-0 mt-0.5 transition ${checked ? "bg-brand-600 text-white" : "bg-white border-2 border-slate-200"}`}>
                            {checked && <Check size={12} />}
                          </span>
                          <span className="flex-1 text-[12px] font-extrabold text-ink-900">{q.text}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {banks.map((b) => {
            const current = random.find((x) => x.bankId === b.id)?.count ?? 0;
            return (
              <div key={b.id} className="bg-slate-50/70 rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0">
                  <Database size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-extrabold text-ink-900 truncate">{b.title}</p>
                  <p className="text-[10px] text-ink-500">{b.questions.length} سؤال متاح</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={b.questions.length}
                  value={current}
                  onChange={(e) => setRandomCount(b.id, Math.min(b.questions.length, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-ink-900 text-center outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            );
          })}
        </div>
      )}

      {err.questions && (
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
          <AlertTriangle size={11} /> {err.questions}
        </p>
      )}
      <div className="flex items-center justify-between bg-brand-50/60 border border-brand-100 rounded-xl px-3 py-2">
        <p className="text-[11px] text-ink-700">
          <span className="font-extrabold text-brand-800 tabular-nums">{totalQuestions}</span> سؤال إجمالي في الامتحان
        </p>
      </div>
    </ModalShell>
  );
}
