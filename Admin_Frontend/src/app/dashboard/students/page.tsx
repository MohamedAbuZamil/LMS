"use client";
import { ShieldCheck } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { PageHeader } from "@/components/admin/PageHeader";

export default function StudentsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="الطلاب"
        subtitle="عرض وإدارة جميع طلاب المنصة"
        icon={ShieldCheck}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الطلاب" }]}
      />
      <ComingSoon
        icon={ShieldCheck}
        title="إدارة الطلاب قريباً"
        description="ستتمكن من تصفح حسابات الطلاب ومتابعة نشاطهم وإدارة الاشتراكات."
        hints={[
          "عرض قائمة كاملة لكل الطلاب على المنصة.",
          "متابعة الكورسات المشتركين فيها وأرصدة محفظاتهم.",
          "تجميد/تنشيط الحسابات وإعادة ضبط كلمات المرور.",
          "تصدير تقارير عن نشاط الطلاب وعمليات الشراء.",
        ]}
      />
    </div>
  );
}
