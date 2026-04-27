// Mock session layer for the Teacher Frontend.
// Two roles are supported:
//  - "teacher"  → full access to everything under the teacher's scope
//  - "secretary"→ partial access filtered by permissions

import type { PermissionKey } from "@/lib/data/permissions";

const KEY = "lms.teacher.session";

export type TeacherSessionRole = "teacher" | "secretary";

export interface TeacherSession {
  role: TeacherSessionRole;
  /** The teacher this session belongs to (the scope). */
  teacherId: string;
  /** Display name shown in the topbar. */
  name: string;
  username: string;
  /** For secretaries only. Teachers have all permissions implicitly. */
  permissions?: PermissionKey[];
  loggedAt: string;
}

export const TEACHER_DEMO = {
  username: "ahmed",
  password: "123456",
};

export const SECRETARY_DEMO = {
  username: "mona",
  password: "123456",
};

export function login(username: string, password: string): TeacherSession | null {
  const u = username.trim().toLowerCase();
  if (u === TEACHER_DEMO.username && password === TEACHER_DEMO.password) {
    const s: TeacherSession = {
      role: "teacher",
      teacherId: "t-ahmed",
      name: "أ. أحمد السيد",
      username: TEACHER_DEMO.username,
      loggedAt: new Date().toISOString(),
    };
    saveSession(s);
    return s;
  }
  if (u === SECRETARY_DEMO.username && password === SECRETARY_DEMO.password) {
    const s: TeacherSession = {
      role: "secretary",
      teacherId: "t-ahmed",
      name: "منى السيد",
      username: SECRETARY_DEMO.username,
      permissions: [
        "students.read",
        "students.write",
        "attendance.manage",
        "messages.send",
      ],
      loggedAt: new Date().toISOString(),
    };
    saveSession(s);
    return s;
  }
  return null;
}

export function saveSession(s: TeacherSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function getSession(): TeacherSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TeacherSession) : null;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

export function can(s: TeacherSession | null, perm: PermissionKey): boolean {
  if (!s) return false;
  if (s.role === "teacher") return true;
  return s.permissions?.includes(perm) ?? false;
}
