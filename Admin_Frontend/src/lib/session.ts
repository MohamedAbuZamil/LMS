/* Mock auth session — replaces real backend until API is wired. */

export type AdminSession = {
  username: string;
  name: string;
  role: "super_admin";
  loggedAt: number;
};

const KEY = "lms.admin.session";

/** Hard-coded demo credentials. */
const CREDENTIALS: Record<string, { password: string; name: string }> = {
  admin: { password: "admin", name: "مدير النظام" },
};

export function login(username: string, password: string): AdminSession | null {
  const u = username.trim().toLowerCase();
  const found = CREDENTIALS[u];
  if (!found || found.password !== password) return null;
  const session: AdminSession = {
    username: u,
    name: found.name,
    role: "super_admin",
    loggedAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(session));
    } catch { /* ignore */ }
  }
  return session;
}

export function getSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch { /* ignore */ }
}
