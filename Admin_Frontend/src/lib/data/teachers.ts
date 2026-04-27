/* Mock teachers dataset — matches Student_Frontend shape for easy backend-wiring. */

export type Teacher = {
  id: string;
  name: string;
  username: string;
  subject: string;
  phone: string;
  email: string;
  courses: number;
  students: number;
  rating: number;
  status: "active" | "suspended";
  online: boolean;
  createdAt: string;
  photo: string;
  bg: string;
  ring: string;
  text: string;
  gradFrom: string;
  gradTo: string;
  bio?: string;
};

export const teachers: Teacher[] = [
  {
    id: "t1",
    name: "أ. محمد الثناوي",
    username: "m.thanawy",
    subject: "الرياضيات",
    phone: "+20 100 123 4567",
    email: "m.thanawy@lms.eg",
    courses: 12,
    students: 1240,
    rating: 4.9,
    status: "active",
    online: true,
    createdAt: "2024-11-02",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bg: "bg-violet-100",
    ring: "ring-violet-200",
    text: "text-violet-700",
    gradFrom: "from-violet-400",
    gradTo: "to-fuchsia-400",
    bio: "خبرة 15 سنة في تدريس الرياضيات للثانوية العامة",
  },
  {
    id: "t2",
    name: "أ. أحمد سعيد",
    username: "a.saeed",
    subject: "الفيزياء",
    phone: "+20 101 222 3344",
    email: "a.saeed@lms.eg",
    courses: 8,
    students: 980,
    rating: 4.8,
    status: "active",
    online: true,
    createdAt: "2025-01-15",
    photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80",
    bg: "bg-emerald-100",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
    gradFrom: "from-emerald-400",
    gradTo: "to-teal-400",
  },
  {
    id: "t3",
    name: "أ. سارة أحمد",
    username: "s.ahmed",
    subject: "اللغة الإنجليزية",
    phone: "+20 102 777 8899",
    email: "s.ahmed@lms.eg",
    courses: 10,
    students: 1100,
    rating: 4.9,
    status: "active",
    online: false,
    createdAt: "2025-02-10",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bg: "bg-amber-100",
    ring: "ring-amber-200",
    text: "text-amber-700",
    gradFrom: "from-amber-400",
    gradTo: "to-orange-400",
  },
  {
    id: "t4",
    name: "أ. خالد إبراهيم",
    username: "k.ibrahim",
    subject: "الكيمياء",
    phone: "+20 103 555 1122",
    email: "k.ibrahim@lms.eg",
    courses: 9,
    students: 870,
    rating: 4.7,
    status: "active",
    online: true,
    createdAt: "2025-03-01",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    bg: "bg-sky-100",
    ring: "ring-sky-200",
    text: "text-sky-700",
    gradFrom: "from-sky-400",
    gradTo: "to-blue-400",
  },
  {
    id: "t5",
    name: "أ. محمد هاني",
    username: "m.hany",
    subject: "اللغة العربية",
    phone: "+20 104 999 6655",
    email: "m.hany@lms.eg",
    courses: 7,
    students: 760,
    rating: 4.8,
    status: "suspended",
    online: false,
    createdAt: "2025-03-20",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bg: "bg-stone-100",
    ring: "ring-stone-200",
    text: "text-stone-700",
    gradFrom: "from-stone-400",
    gradTo: "to-amber-400",
  },
  {
    id: "t6",
    name: "أ. ندى محمود",
    username: "n.mahmoud",
    subject: "الأحياء",
    phone: "+20 106 333 4411",
    email: "n.mahmoud@lms.eg",
    courses: 6,
    students: 690,
    rating: 4.9,
    status: "active",
    online: true,
    createdAt: "2025-04-05",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    bg: "bg-pink-100",
    ring: "ring-pink-200",
    text: "text-pink-700",
    gradFrom: "from-pink-400",
    gradTo: "to-rose-400",
  },
];

export function getTeacher(id: string): Teacher | undefined {
  return teachers.find((t) => t.id === id);
}

export const TEACHER_PALETTES = [
  { bg: "bg-violet-100", ring: "ring-violet-200", text: "text-violet-700", gradFrom: "from-violet-400", gradTo: "to-fuchsia-400" },
  { bg: "bg-emerald-100", ring: "ring-emerald-200", text: "text-emerald-700", gradFrom: "from-emerald-400", gradTo: "to-teal-400" },
  { bg: "bg-amber-100", ring: "ring-amber-200", text: "text-amber-700", gradFrom: "from-amber-400", gradTo: "to-orange-400" },
  { bg: "bg-sky-100", ring: "ring-sky-200", text: "text-sky-700", gradFrom: "from-sky-400", gradTo: "to-blue-400" },
  { bg: "bg-pink-100", ring: "ring-pink-200", text: "text-pink-700", gradFrom: "from-pink-400", gradTo: "to-rose-400" },
  { bg: "bg-indigo-100", ring: "ring-indigo-200", text: "text-indigo-700", gradFrom: "from-indigo-400", gradTo: "to-violet-400" },
  { bg: "bg-teal-100", ring: "ring-teal-200", text: "text-teal-700", gradFrom: "from-teal-400", gradTo: "to-cyan-400" },
];

export const SUBJECTS = [
  "الرياضيات",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الجغرافيا",
  "التاريخ",
] as const;
