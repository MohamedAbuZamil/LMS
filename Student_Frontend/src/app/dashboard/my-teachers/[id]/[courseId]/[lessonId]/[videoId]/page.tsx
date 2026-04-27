"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  getLessonAndVideo,
  isVideoLocked,
  isLessonLocked,
  type CourseLesson,
  type CourseVideo,
} from "@/lib/data/courseContent";
import { currentUser, watermarkFor } from "@/lib/data/currentUser";

export default function VideoPlayerPage() {
  const params = useParams<{ id: string; courseId: string; lessonId: string; videoId: string }>();
  const router = useRouter();
  const { teacher, course, lesson, video, videoIndex } = useMemo(
    () => getLessonAndVideo(params.id, params.courseId, params.lessonId, params.videoId),
    [params.id, params.courseId, params.lessonId, params.videoId]
  );

  // compute lock status defensively (no early returns before hooks)
  const lessonLocked = lesson ? isLessonLocked(lesson) : false;
  const seqLocked = lesson ? isVideoLocked(lesson, videoIndex) : false;
  const locked = lessonLocked || seqLocked;

  useEffect(() => {
    if (locked && teacher && course) {
      router.replace(`/dashboard/my-teachers/${teacher.id}/${course.id}`);
    }
  }, [locked, router, teacher, course]);

  if (!teacher || !course || !lesson || !video) return notFound();
  if (locked) return null;

  return (
    <div className="max-w-[1400px] mx-auto relative">
      <span className="pointer-events-none absolute -top-10 right-0 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl animate-blob -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/dashboard/my-teachers/${teacher.id}/${course.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-ink-700 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/40 rounded-xl px-3 py-2 transition mb-3"
          >
            <ArrowRight size={14} />
            الرجوع إلى الفيديوهات
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-black text-ink-900"
          >
            {videoIndex + 1}. {video.title}
          </motion.h1>
          <nav className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
            <Link href="/dashboard" className="hover:text-brand-700">الرئيسية</Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <Link href="/dashboard/my-teachers" className="hover:text-brand-700">كورساتي</Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <Link href={`/dashboard/my-teachers/${teacher.id}`} className="hover:text-brand-700 truncate max-w-[160px]">
              {teacher.subject} - {course.grade.replace("الصف ", "")}
            </Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <Link href={`/dashboard/my-teachers/${teacher.id}/${course.id}`} className="hover:text-brand-700 truncate max-w-[140px]">
              {course.title}
            </Link>
            <ChevronDown size={11} className="-rotate-90 text-ink-300" />
            <span className="font-extrabold text-ink-700 truncate max-w-[200px]">فيديوهات {lesson.title.split(" - ")[0]}</span>
          </nav>
        </div>
      </div>

      {/* Two-column layout: player + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Player + meta */}
        <div className="space-y-4 min-w-0">
          <Player video={video} lesson={lesson} />

          {/* Meta below player */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5"
          >
            <p className="font-extrabold text-ink-900 text-sm sm:text-base">
              {videoIndex + 1}. {video.title}
            </p>
            <p className="text-[12px] text-ink-600 mt-1.5 leading-relaxed">{video.description}</p>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-500 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Eye size={12} /> مشاهدة {video.viewsUsed * 25 + 100}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} /> تاريخ النشر: {lesson.date}
              </span>
              <span className="inline-flex items-center gap-1 text-brand-700 font-extrabold">
                <Eye size={12} /> {video.viewsUsed}/{video.maxViews} مشاهدة
              </span>
            </div>
          </motion.div>

          {/* Warning panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
            className="relative bg-rose-50/70 border border-rose-200 rounded-2xl p-4 sm:p-5 overflow-hidden"
          >
            <span className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-rose-200/40 blur-3xl" />
            <div className="relative flex flex-col items-center text-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-rose-700 text-sm">
                <ShieldAlert size={16} /> تنبيه هام
              </span>
              <p className="text-[12px] text-rose-900 leading-relaxed max-w-2xl">
                يُحظر منعاً باتاً تسجيل أو تصوير أو إعادة نشر هذا الفيديو أو جزء منه.
                <br />
                أي مخالفة تعرض صاحبها للمساءلة القانونية وفقاً لقوانين حماية الملكية الفكرية.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <Sidebar
          lesson={lesson}
          currentVideoId={video.id}
          baseHref={`/dashboard/my-teachers/${teacher.id}/${course.id}/${lesson.id}`}
        />
      </div>
    </div>
  );
}

/* ─────────── Custom video player (mock controls over CourseCover SVG) ─────────── */

/**
 * Anti-capture hook: best-effort frontend deterrents against screenshots /
 * screen recording / DevTools. Returns the active violation reason (or null).
 * NOTE: cannot fully prevent OS-level capture — see DRM for real protection.
 */
function useAntiCapture(onViolation: () => void) {
  const [violation, setViolation] = useState<
    | null
    | "hidden"
    | "blur"
    | "printscreen"
    | "devtools"
    | "capture"
  >(null);

  useEffect(() => {
    const trigger = (kind: typeof violation) => {
      setViolation(kind);
      onViolation();
    };

    // 1) Tab visibility (switching tabs / minimising)
    const onVisibility = () => {
      if (document.visibilityState === "hidden") trigger("hidden");
      else setViolation((v) => (v === "hidden" ? null : v));
    };
    document.addEventListener("visibilitychange", onVisibility);

    // 2) Window blur (focus moved to another window/recording app)
    const onBlur = () => trigger("blur");
    const onFocus = () => setViolation((v) => (v === "blur" ? null : v));
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    // 3) PrintScreen / Snipping shortcuts. Browsers don't actually let JS
    //    cancel PrintScreen (it goes to OS), but we still pause and warn.
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "PrintScreen" || (e.shiftKey && (e.metaKey || e.ctrlKey) && (k === "S" || k === "s" || k === "4" || k === "3"))) {
        // best effort: try to wipe clipboard so the screenshot isn't auto-copied
        try {
          navigator.clipboard?.writeText("تم حظر اللقطة لحماية حقوق المحتوى");
        } catch { /* ignore */ }
        trigger("printscreen");
      }
      // Block common DevTools shortcuts (best effort)
      if (k === "F12" || (e.ctrlKey && e.shiftKey && (k === "I" || k === "i" || k === "J" || k === "j" || k === "C" || k === "c"))) {
        e.preventDefault();
        trigger("devtools");
      }
      // Ctrl/Cmd+S (save page), Ctrl/Cmd+P (print)
      if ((e.ctrlKey || e.metaKey) && (k === "s" || k === "S" || k === "p" || k === "P")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey, true);

    // 4) DevTools heuristic: large gap between outer/inner dimensions
    const checkDevtools = () => {
      const wGap = Math.abs((window.outerWidth || 0) - (window.innerWidth || 0));
      const hGap = Math.abs((window.outerHeight || 0) - (window.innerHeight || 0));
      if (wGap > 200 || hGap > 200) trigger("devtools");
      else setViolation((v) => (v === "devtools" ? null : v));
    };
    const devtoolsId = window.setInterval(checkDevtools, 1500);

    // 5) Detect attempts to call getDisplayMedia (best-effort hint)
    const md = navigator.mediaDevices as MediaDevices & { getDisplayMedia?: (...a: unknown[]) => unknown };
    let originalGDM: typeof md.getDisplayMedia | undefined;
    if (md && typeof md.getDisplayMedia === "function") {
      originalGDM = md.getDisplayMedia.bind(md);
      md.getDisplayMedia = (() => {
        trigger("capture");
        return Promise.reject(new DOMException("Capture blocked", "NotAllowedError"));
      }) as typeof md.getDisplayMedia;
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keydown", onKey, true);
      window.clearInterval(devtoolsId);
      if (md && originalGDM) md.getDisplayMedia = originalGDM;
    };
  }, [onViolation]);

  return violation;
}

const VIOLATION_MAP: Record<string, { title: string; hint: string }> = {
  hidden: { title: "تم إيقاف الفيديو مؤقتاً", hint: "الفيديو متوقف لأن الصفحة غير فعّالة حالياً." },
  blur: { title: "تم إيقاف الفيديو مؤقتاً", hint: "الفيديو لا يعمل إلا أثناء التركيز على هذه النافذة." },
  printscreen: { title: "تم رصد محاولة التقاط لقطة شاشة", hint: "التقاط محتوى الفيديو محظور وسيتم تسجيل المحاولة." },
  devtools: { title: "تم رصد أدوات المطوّر مفتوحة", hint: "يرجى إغلاق أدوات المطوّر لمتابعة المشاهدة." },
  capture: { title: "تم حظر تسجيل الشاشة", hint: "محاولة تسجيل محتوى الصفحة غير مسموح بها." },
};

function Player({ video, lesson }: { video: CourseVideo; lesson: CourseLesson }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(video.progress);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // mock duration parse from "mm:ss"
  const totalSeconds = useMemo(() => {
    const [m, s] = video.duration.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  }, [video.duration]);
  const watchedSeconds = Math.round((progress / 100) * totalSeconds);

  // pretend to play: when playing, advance progress
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + speed * (100 / totalSeconds);
        return Math.min(100, next);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, speed, totalSeconds]);

  const fullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen?.();
  };

  // anti-capture: pause when a violation is detected
  const violation = useAntiCapture(() => setPlaying(false));

  // moving identity watermark position (refreshes every 4s)
  const [wmPos, setWmPos] = useState({ top: 12, left: 12 });
  useEffect(() => {
    const id = window.setInterval(() => {
      setWmPos({
        top: Math.round(8 + Math.random() * 70),
        left: Math.round(6 + Math.random() * 68),
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const wmText = watermarkFor(currentUser);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
      className="relative bg-ink-900 rounded-2xl overflow-hidden shadow-card/40 aspect-video select-none"
    >
      {/* "video" content: dark gradient + math illustration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81]">
        <MathIllustration />
      </div>

      {/* lesson watermark (top-right) */}
      <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-white/80 bg-black/40 backdrop-blur rounded-full px-2 py-1 z-30 pointer-events-none">
        {lesson.title}
      </span>

      {/* tiled diagonal identity watermark (always visible, very subtle) */}
      <div
        aria-hidden
        className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-60"
        style={{
          backgroundImage: `repeating-linear-gradient(-30deg, transparent 0 80px, rgba(255,255,255,0.08) 80px 81px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'><text x='10' y='90' font-family='system-ui' font-size='14' fill='white' fill-opacity='0.18' transform='rotate(-22 160 80)'>${wmText}</text></svg>`
            )}")`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* moving identity watermark badge */}
      <motion.div
        aria-hidden
        animate={{ top: `${wmPos.top}%`, left: `${wmPos.left}%` }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        className="absolute z-30 pointer-events-none select-none"
      >
        <div className="text-[10px] font-extrabold text-white/85 bg-black/55 backdrop-blur rounded-md px-2 py-1 shadow-soft border border-white/10">
          {wmText}
        </div>
      </motion.div>

      {/* big center play button when paused (and not violated) */}
      <AnimatePresence>
        {!playing && !violation && (
          <motion.button
            key="big-play"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setPlaying(true)}
            className="absolute inset-0 z-10 grid place-items-center bg-black/20 hover:bg-black/30 transition"
            aria-label="تشغيل"
          >
            <span className="w-20 h-20 rounded-full bg-white/95 text-brand-700 grid place-items-center shadow-soft hover:scale-105 transition">
              <Play size={32} className="ms-1" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* violation overlay: hides content + shows reason */}
      <AnimatePresence>
        {violation && (
          <motion.div
            key="violation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 grid place-items-center bg-ink-900/95 backdrop-blur-xl text-white text-center px-6"
          >
            <div className="max-w-md">
              <motion.div
                initial={{ scale: 0.7, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240 }}
                className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-soft mb-4"
              >
                {violation === "devtools" ? <EyeOff size={28} /> : <AlertTriangle size={28} />}
              </motion.div>
              <p className="text-base sm:text-lg font-black">
                {VIOLATION_MAP[violation].title}
              </p>
              <p className="text-[12px] sm:text-sm text-white/80 mt-1.5 leading-relaxed">
                {VIOLATION_MAP[violation].hint}
              </p>
              <p className="text-[11px] text-white/60 mt-4">{wmText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* control bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 sm:px-4 pt-8 pb-3">
        {/* progress */}
        <div className="group/bar relative h-1 rounded-full bg-white/20 cursor-pointer" onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          // RTL: clicking right end ⇒ 0%, left end ⇒ 100%
          const ratio = 1 - (e.clientX - rect.left) / rect.width;
          setProgress(Math.max(0, Math.min(100, ratio * 100)));
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-0 h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-300"
          />
          <motion.span
            animate={{ right: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="absolute -translate-y-1/2 top-1/2 -mr-1.5 w-3 h-3 rounded-full bg-white shadow scale-0 group-hover/bar:scale-100 transition"
          />
        </div>

        {/* buttons */}
        <div className="mt-2.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-9 h-9 rounded-full hover:bg-white/15 grid place-items-center transition"
              aria-label={playing ? "إيقاف" : "تشغيل"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ms-0.5" />}
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="w-9 h-9 rounded-full hover:bg-white/15 grid place-items-center transition"
              aria-label="الصوت"
            >
              <Volume2 size={18} className={muted ? "opacity-40" : ""} />
            </button>
            <span className="text-xs font-mono tabular-nums text-white/90 select-none">
              {fmtTime(watchedSeconds)} / {fmtTime(totalSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((s) => !s)}
                className="text-xs font-extrabold px-2.5 py-1 rounded-md hover:bg-white/15 transition"
              >
                {speed}x
              </button>
              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-ink-900/95 border border-white/10 rounded-lg shadow-soft py-1 min-w-[80px]"
                  >
                    {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSpeed(s);
                          setShowSpeedMenu(false);
                        }}
                        className={`w-full text-center px-3 py-1.5 text-xs font-bold transition ${
                          s === speed ? "text-brand-300" : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="w-9 h-9 rounded-full hover:bg-white/15 grid place-items-center transition" aria-label="إعدادات">
              <Settings size={17} />
            </button>
            <button onClick={fullscreen} className="w-9 h-9 rounded-full hover:bg-white/15 grid place-items-center transition" aria-label="ملء الشاشة">
              <Maximize2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function fmtTime(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* Math-themed SVG illustration to fill the player area like the screenshot */
function MathIllustration() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* number line */}
      <g stroke="#fff" strokeWidth="2" opacity="0.85">
        <line x1="120" y1="200" x2="380" y2="200" />
        {[-3, -2, -1, 0, 1, 2, 3].map((n, i) => (
          <line key={n} x1={130 + i * 38} y1="195" x2={130 + i * 38} y2="205" />
        ))}
      </g>
      <g fill="#fff" fontFamily="system-ui" fontSize="16" textAnchor="middle">
        {[-3, -2, -1, 0, 1, 2, 3].map((n, i) => (
          <text key={n} x={130 + i * 38} y={222}>{n}</text>
        ))}
      </g>

      {/* arrows showing absolute distances */}
      <g stroke="#fbbf24" strokeWidth="2.5" fill="none">
        <path d="M 244 250 L 130 250" markerEnd="url(#ah)" />
        <path d="M 244 280 L 206 280" markerEnd="url(#ah)" />
        <path d="M 244 310 L 320 310" markerEnd="url(#ah2)" />
        <path d="M 244 340 L 358 340" markerEnd="url(#ah2)" />
      </g>
      <defs>
        <marker id="ah" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24" />
        </marker>
        <marker id="ah2" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24" />
        </marker>
      </defs>
      <g fill="#fff" fontFamily="system-ui" fontSize="20" fontWeight="bold">
        <text x="100" y="256">|-3| = 3</text>
        <text x="160" y="286">|-1| = 1</text>
        <text x="328" y="316">|2| = 2</text>
        <text x="370" y="346">|3| = 3</text>
      </g>

      {/* RTL Arabic side (right) */}
      <g fill="#fde047" fontFamily="system-ui" fontSize="28" fontWeight="bold" textAnchor="end">
        <text x="720" y="170">القيمة المطلقة</text>
      </g>
      <g fill="#fff" fontFamily="system-ui" fontSize="18" textAnchor="end">
        <text x="720" y="220">هي البعد بين أي عدد والصفر</text>
        <text x="720" y="248">على خط الأعداد .</text>
        <text x="720" y="296">ونرمز لها بالرمز |x|</text>
      </g>
    </svg>
  );
}

/* ─────────── Sidebar: list of lesson videos with sequential lock ─────────── */
function Sidebar({
  lesson,
  currentVideoId,
  baseHref,
}: {
  lesson: CourseLesson;
  currentVideoId: string;
  baseHref: string;
}) {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-extrabold text-ink-900">فيديوهات الحصة</p>
          <p className="text-[11px] text-ink-500">({lesson.videos.length})</p>
        </div>
        <div className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto">
          {lesson.videos.map((v, i) => (
            <SidebarRow
              key={v.id}
              v={v}
              index={i}
              locked={isVideoLocked(lesson, i)}
              active={v.id === currentVideoId}
              href={`${baseHref}/${v.id}`}
            />
          ))}
        </div>
      </div>

      {/* sequential unlock notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2"
      >
        <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">
          <Lock size={14} />
        </span>
        <div className="text-[12px] text-amber-900 leading-relaxed">
          <p className="font-extrabold inline-flex items-center gap-1">
            <Info size={12} /> يتم فتح الفيديوهات بالترتيب
          </p>
          <p className="mt-0.5 text-amber-800/90">يجب إكمال الفيديو الحالي لفتح الفيديو التالي.</p>
        </div>
      </motion.div>
    </div>
  );
}

function SidebarRow({
  v,
  index,
  locked,
  active,
  href,
}: {
  v: CourseVideo;
  index: number;
  locked: boolean;
  active: boolean;
  href: string;
}) {
  const finished = v.viewsUsed >= v.maxViews;
  const started = v.viewsUsed > 0 && !finished;

  const Wrapper = locked ? ("div" as const) : Link;
  const wrapperProps = locked ? { className: "block" } : { href };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.05 * index } }}
    >
      <Wrapper
        {...(wrapperProps as Record<string, unknown>)}
        aria-disabled={locked || undefined}
        className={`group flex items-center gap-2 p-2 rounded-xl border transition ${
          active
            ? "bg-brand-50 border-brand-200 ring-1 ring-brand-200"
            : locked
            ? "bg-slate-50/50 border-transparent cursor-not-allowed opacity-80"
            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
        }`}
      >
        {/* status icon */}
        <span className="w-6 h-6 grid place-items-center shrink-0">
          {finished ? (
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white grid place-items-center">
              <CheckCircle2 size={14} />
            </span>
          ) : started ? (
            <ProgressRing value={(v.viewsUsed / v.maxViews) * 100} label={`${v.viewsUsed}/${v.maxViews}`} />
          ) : locked ? (
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 grid place-items-center">
              <Lock size={12} />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full border-2 border-slate-300" />
          )}
        </span>

        {/* meta */}
        <div className="flex-1 min-w-0 text-right">
          <p className={`text-[12px] font-extrabold truncate ${active ? "text-brand-700" : locked ? "text-ink-500" : "text-ink-900"}`}>
            {index + 1}. {v.title}
          </p>
          <p className="text-[10px] text-ink-500 mt-0.5">{v.duration}</p>
          <p className={`text-[10px] mt-0.5 font-extrabold ${finished ? "text-emerald-700" : started ? "text-brand-700" : "text-ink-400"}`}>
            {v.viewsUsed}/{v.maxViews} مشاهدة
          </p>
        </div>

        {/* thumb / lock */}
        <div className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 ${active ? "ring-2 ring-brand-400" : ""}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81]" />
          <span className="absolute inset-0 grid place-items-center">
            {locked ? (
              <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur grid place-items-center text-white">
                <Lock size={14} />
              </span>
            ) : (
              <motion.span
                whileHover={{ scale: 1.1 }}
                className={`w-7 h-7 rounded-full grid place-items-center shadow ${active ? "bg-brand-600 text-white" : "bg-white/95 text-brand-700"}`}
              >
                {active ? <Pause size={12} /> : <Play size={12} className="ms-0.5" />}
              </motion.span>
            )}
          </span>
        </div>
      </Wrapper>
    </motion.div>
  );
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 10;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <span className="relative w-6 h-6 grid place-items-center">
      <svg viewBox="0 0 24 24" className="absolute inset-0">
        <circle cx="12" cy="12" r={r} stroke="#e2e8f0" strokeWidth="2.5" fill="none" />
        <motion.circle
          cx="12"
          cy="12"
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 12 12)"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[7px] font-extrabold text-brand-700 leading-none">{label}</span>
    </span>
  );
}
