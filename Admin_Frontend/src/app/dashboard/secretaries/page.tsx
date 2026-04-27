import { Users } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { PageHeader } from "@/components/admin/PageHeader";

export default function SecretariesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="السكرتارية"
        subtitle="عرض وإدارة كل سكرتارية المدرسين"
        icon={Users}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "السكرتارية" }]}
      />
      <ComingSoon
        icon={Users}
        title="قائمة السكرتارية الموحّدة قريباً"
        description="حالياً يمكنك إدارة سكرتارية كل مدرس من صفحة المدرس → تبويب «السكرتارية»."
        hints={[
          "عرض كل السكرتارية على المنصة في مكان واحد.",
          "فلترة حسب المدرس المُتبع له والصلاحيات.",
          "إدارة الصلاحيات الجماعية وقوالب جاهزة.",
          "تتبّع نشاط السكرتارية والوصول الأخير.",
        ]}
      />
    </div>
  );
}
