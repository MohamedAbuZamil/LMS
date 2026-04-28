/**
 * Canonical catalog of permission keys granted to secretary users.
 * Mirrors the frontend list in `Teacher_Frontend/src/lib/data/permissions.ts`
 * (without the icons). The single source of truth for the API.
 */

export type PermissionKey =
  | "courses.read"
  | "courses.write"
  | "lessons.manage"
  | "videos.manage"
  | "files.manage"
  | "banks.manage"
  | "exams.manage"
  | "students.read"
  | "students.write"
  | "attendance.manage"
  | "payments.manage"
  | "messages.send"
  | "settings.manage";

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  description: string;
  group: string;
}

export const PERMISSIONS: PermissionDef[] = [
  { key: "courses.read",     label: "عرض الكورسات",       description: "تصفح قائمة الكورسات والتفاصيل.",                    group: "الكورسات والمحتوى" },
  { key: "courses.write",    label: "إنشاء/تعديل كورس",   description: "إضافة كورس جديد أو تعديل بياناته.",                  group: "الكورسات والمحتوى" },
  { key: "lessons.manage",   label: "إدارة الحصص",         description: "إضافة وتعديل الحصص داخل الكورسات.",                 group: "الكورسات والمحتوى" },
  { key: "videos.manage",    label: "إدارة الفيديوهات",   description: "رفع وتعديل الفيديوهات داخل الحصص.",                  group: "الكورسات والمحتوى" },
  { key: "files.manage",     label: "إدارة الملفات",       description: "رفع ومشاركة الملفات داخل الحصص.",                    group: "الكورسات والمحتوى" },
  { key: "banks.manage",     label: "بنوك الأسئلة",        description: "إنشاء بنوك الأسئلة وإضافة الأسئلة.",                 group: "الامتحانات" },
  { key: "exams.manage",     label: "إدارة الامتحانات",    description: "إنشاء الامتحانات وإضافة الأسئلة إليها.",             group: "الامتحانات" },
  { key: "students.read",    label: "عرض الطلاب",          description: "عرض بيانات الطلاب المسجلين.",                        group: "الطلاب" },
  { key: "students.write",   label: "إضافة/حذف طالب",      description: "تسجيل طالب في كورس أو إزالته.",                       group: "الطلاب" },
  { key: "attendance.manage",label: "الحضور والغياب",      description: "متابعة الحضور وإشعار ولي الأمر.",                    group: "الطلاب" },
  { key: "payments.manage",  label: "المدفوعات",            description: "تسجيل مبالغ الدفع للطلاب.",                          group: "الطلاب" },
  { key: "messages.send",    label: "إرسال الرسائل",       description: "إرسال إشعارات وتقارير للطلاب وأولياء الأمور.",       group: "التواصل" },
  { key: "settings.manage",  label: "الإعدادات",            description: "تعديل إعدادات حساب المدرس.",                         group: "الإعدادات" },
];

export const PERMISSION_KEYS: ReadonlyArray<PermissionKey> = PERMISSIONS.map(
  (p) => p.key,
);

export const isValidPermission = (key: string): key is PermissionKey =>
  (PERMISSION_KEYS as ReadonlyArray<string>).includes(key);
