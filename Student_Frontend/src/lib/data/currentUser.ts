// Mock current student. In a real app this would come from auth/session.
export type CurrentUser = {
  id: string;
  name: string;
  grade: string;
  phone: string;
  email: string;
  balance: number; // wallet balance in EGP
};

export const currentUser: CurrentUser = {
  id: "STD-2026-08431",
  name: "أحمد محمد",
  grade: "الصف الثالث الثانوي",
  phone: "+20 100 555 8431",
  email: "ahmed.mohamed@lms.eg",
  balance: 850, // EGP
};

export const CURRENCY = "ج.م";

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ar-EG")} ${CURRENCY}`;
}

/** Compact watermark string overlaid on protected media. */
export function watermarkFor(u: CurrentUser = currentUser): string {
  const last4 = u.phone.replace(/\D/g, "").slice(-4);
  return `${u.name} · ${u.id} · ${last4}`;
}
