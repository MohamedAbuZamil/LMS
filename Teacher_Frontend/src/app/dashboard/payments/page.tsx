"use client";
import { useEffect, useMemo, useState } from "react";
import { DollarSign, Hash, MapPin, Wallet } from "lucide-react";
import { PageHeader } from "@/components/teacher/PageHeader";
import { listCourses, type Course } from "@/lib/data/courses";
import { listEnrollmentsByCourse, listStudents } from "@/lib/data/students";
import { getSession } from "@/lib/session";

export default function PaymentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    const s = getSession();
    const list = listCourses(s?.teacherId);
    setCourses(list);
    if (list.length > 0 && !courseId) setCourseId(list[0].id);
  }, [courseId]);

  const rows = useMemo(() => {
    if (!courseId) return [];
    const enrollments = listEnrollmentsByCourse(courseId).filter((e) => e.active);
    const all = listStudents();
    return enrollments
      .map((e) => {
        const s = all.find((x) => x.id === e.studentId);
        return s ? { student: s, paid: e.paidAmount, enrolledAt: e.enrolledAt } : null;
      })
      .filter(Boolean) as { student: ReturnType<typeof listStudents>[number]; paid: number; enrolledAt: string }[];
  }, [courseId]);

  const total = rows.reduce((a, r) => a + r.paid, 0);
  const course = courses.find((c) => c.id === courseId);
  const expected = course ? course.priceTotal * rows.length : 0;
  const remaining = Math.max(0, expected - total);

  return (
    <div className="space-y-5">
      <PageHeader
        title="المدفوعات"
        subtitle="عرض الدفعات المسجّلة للطلاب في كل كورس."
        icon={Wallet}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "المدفوعات" }]}
      />

      {courses.length === 0 ? (
        <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          لا توجد كورسات بعد.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
            <p className="text-[11px] font-extrabold text-ink-700 mb-1.5">الكورس</p>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card label="إجمالي المحصّل" value={`${total.toLocaleString("ar-EG")} ج`} bg="bg-emerald-50" fg="text-emerald-700" />
            <Card label="السعر المستهدف" value={`${expected.toLocaleString("ar-EG")} ج`} bg="bg-accent-50" fg="text-accent-700" />
            <Card label="المتبقي" value={`${remaining.toLocaleString("ar-EG")} ج`} bg="bg-amber-50" fg="text-amber-700" />
          </div>

          {rows.length === 0 ? (
            <p className="text-center text-[12px] text-ink-500 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              لا توجد دفعات مسجّلة.
            </p>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/70 text-[11px] font-extrabold text-ink-700">
                  <tr>
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">الكود</th>
                    <th className="px-4 py-3">المحافظة</th>
                    <th className="px-4 py-3">المدفوع</th>
                    <th className="px-4 py-3">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {rows.map((r) => (
                    <tr key={r.student.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-extrabold text-ink-900">{r.student.name}</td>
                      <td className="px-4 py-3 text-ink-700"><Hash size={11} className="inline text-brand-600 mr-1" />{r.student.code}</td>
                      <td className="px-4 py-3 text-ink-700"><MapPin size={11} className="inline text-brand-600 mr-1" />{r.student.governorate}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700"><DollarSign size={11} className="inline mr-0.5" />{r.paid} ج</td>
                      <td className="px-4 py-3 text-ink-500">{new Date(r.enrolledAt).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Card({ label, value, bg, fg }: { label: string; value: string; bg: string; fg: string }) {
  return (
    <div className={`rounded-2xl border border-slate-100 p-4 ${bg}`}>
      <p className={`text-xl font-black ${fg} tabular-nums`}>{value}</p>
      <p className="text-[11px] text-ink-500 mt-1.5">{label}</p>
    </div>
  );
}
