"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Bell, Check, Clock, MapPin, UserCheck, X } from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses, type Course } from "@/lib/data/courses";
import {
  getAttendance,
  listEnrollmentsByCourse,
  listStudents,
  markAttendance,
  notifyParent,
  type AttendanceStatus,
  type Student,
} from "@/lib/data/students";
import { getSession } from "@/lib/session";

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const s = getSession();
    const list = listCourses(s?.teacherId);
    setCourses(list);
    if (list.length > 0 && !courseId) {
      setCourseId(list[0].id);
      if (list[0].lessons[0]) setLessonId(list[0].lessons[0].id);
    }
  }, [courseId]);

  const course = courses.find((c) => c.id === courseId);
  const lessons = course?.lessons ?? [];

  const students = useMemo(() => {
    if (!courseId) return [] as Student[];
    const enrollments = listEnrollmentsByCourse(courseId).filter((e) => e.active);
    const all = listStudents();
    return enrollments
      .map((e) => all.find((s) => s.id === e.studentId))
      .filter(Boolean) as Student[];
  }, [courseId]);

  const attendance = useMemo(() => {
    if (!courseId || !lessonId) return new Map<string, { status: AttendanceStatus; notifiedParent: boolean }>();
    const records = getAttendance(courseId, lessonId);
    return new Map(records.map((r) => [r.studentId, { status: r.status, notifiedParent: r.notifiedParent }]));
  }, [courseId, lessonId, refresh]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    if (!courseId || !lessonId) return;
    markAttendance(courseId, lessonId, studentId, status);
    setRefresh((n) => n + 1);
  };

  const onNotify = (studentId: string) => {
    if (!courseId || !lessonId) return;
    notifyParent(courseId, lessonId, studentId);
    setRefresh((n) => n + 1);
    alert("تم إرسال إشعار لولي الأمر (نموذج توضيحي).");
  };

  const stats = useMemo(() => {
    let p = 0, a = 0, l = 0;
    students.forEach((s) => {
      const r = attendance.get(s.id);
      if (r?.status === "present") p++;
      else if (r?.status === "absent") a++;
      else if (r?.status === "late") l++;
    });
    return { present: p, absent: a, late: l, untracked: students.length - p - a - l };
  }, [students, attendance]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="الحضور والغياب"
        subtitle="اختر الكورس ثم الحصة وسجّل حضور كل طالب — مع إمكانية تبليغ ولي الأمر."
        icon={UserCheck}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الحضور" }]}
      />

      {courses.length === 0 ? (
        <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          لا توجد كورسات بعد.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">الكورس</p>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  const c = courses.find((x) => x.id === e.target.value);
                  setLessonId(c?.lessons[0]?.id ?? "");
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">الحصة</p>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                disabled={lessons.length === 0}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="حاضر" value={stats.present} bg="bg-emerald-50" fg="text-emerald-700" />
            <Stat label="غائب" value={stats.absent} bg="bg-rose-50" fg="text-rose-700" />
            <Stat label="متأخر" value={stats.late} bg="bg-amber-50" fg="text-amber-700" />
            <Stat label="لم يُسجّل" value={stats.untracked} bg="bg-slate-100" fg="text-ink-700" />
          </div>

          {students.length === 0 ? (
            <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              لا يوجد طلاب مسجّلون في هذا الكورس بعد.
            </p>
          ) : (
            <ul className="space-y-2">
              {students.map((s) => {
                const r = attendance.get(s.id);
                const status = r?.status;
                const notified = r?.notifiedParent ?? false;
                return (
                  <li key={s.id} className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {s.photo ? (
                          <Image src={s.photo} alt={s.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center text-brand-700 font-black">{s.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-extrabold text-ink-900 truncate">{s.name}</p>
                        <p className="text-[10px] text-ink-500 mt-0.5 inline-flex items-center gap-1">
                          <MapPin size={10} /> {s.governorate} • {s.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusBtn label="حاضر" icon={Check} active={status === "present"} color="emerald" onClick={() => setStatus(s.id, "present")} />
                      <StatusBtn label="متأخر" icon={Clock} active={status === "late"} color="amber" onClick={() => setStatus(s.id, "late")} />
                      <StatusBtn label="غائب" icon={X} active={status === "absent"} color="rose" onClick={() => setStatus(s.id, "absent")} />
                      <button
                        onClick={() => onNotify(s.id)}
                        disabled={status !== "absent" && status !== "late"}
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition border ${
                          notified
                            ? "bg-accent-50 text-accent-700 border-accent-200"
                            : status === "absent" || status === "late"
                            ? "bg-white border-accent-200 text-accent-700 hover:bg-accent-50"
                            : "bg-slate-50 text-ink-400 border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        <Bell size={11} />
                        {notified ? "تم التبليغ" : "تبليغ"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, bg, fg }: { label: string; value: number; bg: string; fg: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 p-3 ${bg}`}>
      <p className={`text-xl font-black tabular-nums ${fg}`}>{value}</p>
      <p className="text-[11px] text-ink-500 mt-1.5">{label}</p>
    </div>
  );
}

function StatusBtn({
  label,
  icon: Icon,
  active,
  color,
  onClick,
}: {
  label: string;
  icon: typeof Check;
  active: boolean;
  color: "emerald" | "amber" | "rose";
  onClick: () => void;
}) {
  const map = {
    emerald: active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    amber: active ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50",
    rose: active ? "bg-rose-600 text-white border-rose-600" : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold border transition ${map[color]}`}>
      <Icon size={11} />
      {label}
    </button>
  );
}
