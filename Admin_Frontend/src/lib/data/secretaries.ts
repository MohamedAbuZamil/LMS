import type { PermissionKey } from "./permissions";

export type Secretary = {
  id: string;
  teacherId: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  status: "active" | "suspended";
  createdAt: string;
  permissions: PermissionKey[];
};

export const secretaries: Secretary[] = [
  {
    id: "s1",
    teacherId: "t1",
    name: "منى السيد",
    username: "mona.sayed",
    phone: "+20 109 111 2233",
    email: "mona.sayed@lms.eg",
    status: "active",
    createdAt: "2025-03-12",
    permissions: ["students.view", "students.manage", "messages.reply", "payments.view"],
  },
  {
    id: "s2",
    teacherId: "t1",
    name: "علي حسن",
    username: "ali.hassan",
    phone: "+20 109 444 5566",
    email: "ali.hassan@lms.eg",
    status: "active",
    createdAt: "2025-04-01",
    permissions: ["courses.manage", "lessons.manage", "videos.upload"],
  },
  {
    id: "s3",
    teacherId: "t2",
    name: "ياسمين عمر",
    username: "yasmeen.omar",
    phone: "+20 110 222 7788",
    email: "yasmeen.omar@lms.eg",
    status: "active",
    createdAt: "2025-04-10",
    permissions: ["students.view", "messages.reply"],
  },
  {
    id: "s4",
    teacherId: "t3",
    name: "محمود فاروق",
    username: "mahmoud.farouk",
    phone: "+20 111 555 9900",
    email: "mahmoud.farouk@lms.eg",
    status: "suspended",
    createdAt: "2025-02-18",
    permissions: ["students.view"],
  },
];

export function getSecretariesByTeacher(teacherId: string): Secretary[] {
  return secretaries.filter((s) => s.teacherId === teacherId);
}
