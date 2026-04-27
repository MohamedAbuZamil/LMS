import {
  BookOpen,
  ClipboardList,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

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
  icon: LucideIcon;
  group: string;
}

export const PERMISSIONS: PermissionDef[] = [
  { key: "courses.read", label: "عرض الكورسات", description: "تصفح قائمة الكورسات والتفاصيل.", icon: BookOpen, group: "الكورسات والمحتوى" },
  { key: "courses.write", label: "إنشاء/تعديل كورس", description: "إضافة كورس جديد أو تعديل بياناته.", icon: BookOpen, group: "الكورسات والمحتوى" },
  { key: "lessons.manage", label: "إدارة الحصص", description: "إضافة وتعديل الحصص داخل الكورسات.", icon: ClipboardList, group: "الكورسات والمحتوى" },
  { key: "videos.manage", label: "إدارة الفيديوهات", description: "رفع وتعديل الفيديوهات داخل الحصص.", icon: Video, group: "الكورسات والمحتوى" },
  { key: "files.manage", label: "إدارة الملفات", description: "رفع ومشاركة الملفات داخل الحصص.", icon: FileText, group: "الكورسات والمحتوى" },

  { key: "banks.manage", label: "بنوك الأسئلة", description: "إنشاء بنوك الأسئلة وإضافة الأسئلة.", icon: ClipboardList, group: "الامتحانات" },
  { key: "exams.manage", label: "إدارة الامتحانات", description: "إنشاء الامتحانات وإضافة الأسئلة إليها.", icon: ClipboardList, group: "الامتحانات" },

  { key: "students.read", label: "عرض الطلاب", description: "عرض بيانات الطلاب المسجلين.", icon: Users, group: "الطلاب" },
  { key: "students.write", label: "إضافة/حذف طالب", description: "تسجيل طالب في كورس أو إزالته.", icon: Users, group: "الطلاب" },
  { key: "attendance.manage", label: "الحضور والغياب", description: "متابعة الحضور وإشعار ولي الأمر.", icon: UserCheck, group: "الطلاب" },
  { key: "payments.manage", label: "المدفوعات", description: "تسجيل مبالغ الدفع للطلاب.", icon: DollarSign, group: "الطلاب" },
  { key: "messages.send", label: "إرسال الرسائل", description: "إرسال إشعارات وتقارير للطلاب وأولياء الأمور.", icon: MessageSquare, group: "التواصل" },

  { key: "settings.manage", label: "الإعدادات", description: "تعديل إعدادات حساب المدرس.", icon: Settings, group: "الإعدادات" },
];

export const DEFAULT_PERMISSIONS: PermissionKey[] = [
  "courses.read",
  "students.read",
  "students.write",
  "attendance.manage",
  "payments.manage",
  "messages.send",
];

export const SHIELD_ICON = ShieldCheck;
