import {
  BookOpen,
  DollarSign,
  FileVideo,
  GraduationCap,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type PermissionKey =
  | "courses.manage"
  | "lessons.manage"
  | "videos.upload"
  | "students.view"
  | "students.manage"
  | "payments.view"
  | "payments.manage"
  | "messages.reply"
  | "reports.view"
  | "settings.manage";

export type PermissionDef = {
  key: PermissionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "المحتوى" | "الطلاب" | "المدفوعات" | "التواصل" | "الإعدادات";
};

export const PERMISSIONS: PermissionDef[] = [
  { key: "courses.manage", label: "إدارة الكورسات", description: "إضافة وتعديل وحذف الكورسات", icon: BookOpen, group: "المحتوى" },
  { key: "lessons.manage", label: "إدارة الحصص", description: "إضافة وتعديل حصص الكورسات", icon: GraduationCap, group: "المحتوى" },
  { key: "videos.upload", label: "رفع الفيديوهات", description: "رفع وإدارة فيديوهات الحصص", icon: FileVideo, group: "المحتوى" },
  { key: "students.view", label: "عرض الطلاب", description: "تصفّح قائمة الطلاب وبياناتهم", icon: Users, group: "الطلاب" },
  { key: "students.manage", label: "إدارة الطلاب", description: "قبول/حظر/حذف الطلاب", icon: UserPlus, group: "الطلاب" },
  { key: "payments.view", label: "عرض المدفوعات", description: "عرض عمليات الشراء والإيرادات", icon: DollarSign, group: "المدفوعات" },
  { key: "payments.manage", label: "إدارة المدفوعات", description: "استرداد/تعديل المعاملات", icon: DollarSign, group: "المدفوعات" },
  { key: "messages.reply", label: "الرد على الرسائل", description: "الرد على استفسارات الطلاب", icon: MessageSquare, group: "التواصل" },
  { key: "reports.view", label: "عرض التقارير", description: "الاطلاع على تقارير الأداء", icon: ShieldCheck, group: "الإعدادات" },
  { key: "settings.manage", label: "إدارة الإعدادات", description: "تعديل إعدادات حساب المدرس", icon: Settings, group: "الإعدادات" },
];

/** Default permissions for a new secretary (safe, read-only-leaning). */
export const DEFAULT_PERMISSIONS: PermissionKey[] = [
  "students.view",
  "payments.view",
  "messages.reply",
];
