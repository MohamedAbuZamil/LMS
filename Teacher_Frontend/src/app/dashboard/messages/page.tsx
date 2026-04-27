"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  Send,
  User,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses, type Course, type LessonExam } from "@/lib/data/courses";
import {
  listEnrollmentsByCourse,
  listMessages,
  listStudents,
  sendExamReport,
  type ExamReportMessage,
  type Student,
} from "@/lib/data/students";
import { getSession } from "@/lib/session";

export default function MessagesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [to, setTo] = useState<"student" | "parent">("student");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [history, setHistory] = useState<ExamReportMessage[]>([]);

  useEffect(() => {
    const s = getSession();
    const list = listCourses(s?.teacherId);
    setCourses(list);
    if (list.length > 0 && !courseId) setCourseId(list[0].id);
    setHistory(listMessages());
  }, [courseId]);

  const course = courses.find((c) => c.id === courseId);
  const lessons = course?.lessons ?? [];
  const lesson = lessons.find((l) => l.id === lessonId);
  const exams: LessonExam[] = lesson?.exams ?? [];

  const students: Student[] = useMemo(() => {
    if (!courseId) return [];
    const enrollments = listEnrollmentsByCourse(courseId).filter((e) => e.active);
    const all = listStudents();
    return enrollments
      .map((e) => all.find((s) => s.id === e.studentId))
      .filter(Boolean) as Student[];
  }, [courseId]);

  const submit = () => {
    if (!examId) return setErr("اختر امتحاناً.");
    if (!studentId) return setErr("اختر طالباً.");
    if (text.trim().length < 5) return setErr("نص الرسالة قصير جداً.");
    setErr("");
    sendExamReport({ examId, studentId, to, text: text.trim() });
    setHistory(listMessages());
    setText("");
    alert("تم إرسال الرسالة (نموذج توضيحي).");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="الرسائل وتقارير الامتحانات"
        subtitle="أرسل تقرير امتحان للطالب أو ولي الأمر مع شرح الدرجة."
        icon={MessageSquare}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الرسائل" }]}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Pick label="الكورس" value={courseId} onChange={(v) => { setCourseId(v); setLessonId(""); setExamId(""); }}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Pick>
          <Pick label="الحصة" value={lessonId} onChange={(v) => { setLessonId(v); setExamId(""); }} disabled={lessons.length === 0}>
            <option value="">اختر</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </Pick>
          <Pick label="الامتحان" value={examId} onChange={setExamId} disabled={exams.length === 0}>
            <option value="">اختر</option>
            {exams.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </Pick>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Pick label="الطالب" value={studentId} onChange={setStudentId}>
            <option value="">اختر</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </Pick>
          <div>
            <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">المُستلم</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTo("student")} className={`p-2.5 rounded-xl border-2 text-[12px] font-extrabold inline-flex items-center justify-center gap-1.5 transition ${to === "student" ? "border-brand-500 bg-brand-50/60 text-brand-800" : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"}`}>
                <User size={12} /> الطالب
              </button>
              <button type="button" onClick={() => setTo("parent")} className={`p-2.5 rounded-xl border-2 text-[12px] font-extrabold inline-flex items-center justify-center gap-1.5 transition ${to === "parent" ? "border-brand-500 bg-brand-50/60 text-brand-800" : "border-slate-200 bg-white text-ink-700 hover:border-brand-200"}`}>
                <Users size={12} /> ولي الأمر
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">نص الرسالة</p>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="مثال: حصل ابنك على درجة 18 من 20 في امتحان الجبر..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 placeholder:text-ink-300 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-y"
          />
          {err && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
              <AlertTriangle size={11} /> {err}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white text-[12px] font-extrabold shadow-soft transition">
            <Send size={13} /> إرسال
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div>
          <p className="text-sm font-extrabold text-ink-900 mb-2 inline-flex items-center gap-1.5">
            <ClipboardList size={14} className="text-brand-600" />
            آخر الرسائل المرسلة
          </p>
          <ul className="space-y-2">
            {history.slice(0, 10).map((m) => {
              const stu = listStudents().find((s) => s.id === m.studentId);
              return (
                <li key={m.id} className="bg-white rounded-2xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5 font-extrabold">
                      {m.to === "student" ? <User size={10} /> : <Users size={10} />}
                      {m.to === "student" ? "طالب" : "ولي أمر"}
                    </span>
                    <span className="text-ink-700 font-extrabold">{stu?.name ?? "—"}</span>
                    <span className="text-ink-400">•</span>
                    <span className="text-ink-500">{new Date(m.sentAt).toLocaleString("ar-EG")}</span>
                  </div>
                  <p className="text-[12px] text-ink-700 leading-relaxed">{m.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Pick({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}
