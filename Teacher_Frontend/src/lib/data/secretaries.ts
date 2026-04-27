import type { PermissionKey } from "./permissions";

export interface Secretary {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: "active" | "suspended";
  createdAt: string;
  permissions: PermissionKey[];
}

const STORE = "lms.teacher.secretaries";

const DEFAULTS: Secretary[] = [
  {
    id: "sec-1",
    name: "منى السيد",
    username: "mona",
    email: "mona@lms.eg",
    phone: "+20 100 111 2222",
    status: "active",
    createdAt: "2024-08-01",
    permissions: [
      "students.read",
      "students.write",
      "attendance.manage",
      "messages.send",
      "payments.manage",
    ],
  },
  {
    id: "sec-2",
    name: "سارة محمد",
    username: "sara",
    email: "sara@lms.eg",
    phone: "+20 100 333 4444",
    status: "active",
    createdAt: "2024-11-12",
    permissions: ["students.read", "attendance.manage"],
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function listSecretaries(): Secretary[] {
  if (!isBrowser()) return DEFAULTS;
  const raw = sessionStorage.getItem(STORE);
  if (!raw) {
    sessionStorage.setItem(STORE, JSON.stringify(DEFAULTS));
    return DEFAULTS;
  }
  try {
    return JSON.parse(raw) as Secretary[];
  } catch {
    return DEFAULTS;
  }
}

export function saveSecretaries(list: Secretary[]) {
  if (!isBrowser()) return;
  sessionStorage.setItem(STORE, JSON.stringify(list));
}

export function upsertSecretary(s: Secretary) {
  const list = listSecretaries();
  const idx = list.findIndex((x) => x.id === s.id);
  if (idx >= 0) list[idx] = s;
  else list.unshift(s);
  saveSecretaries(list);
}

export function removeSecretary(id: string) {
  const list = listSecretaries().filter((x) => x.id !== id);
  saveSecretaries(list);
}
