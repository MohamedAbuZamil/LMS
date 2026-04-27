import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { PageHeader } from "@/components/admin/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="الإعدادات"
        subtitle="إعدادات عامة للمنصة"
        icon={Settings}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الإعدادات" }]}
      />
      <ComingSoon
        icon={Settings}
        title="الإعدادات قريباً"
        description="ضبط هوية المنصة، الفواتير، الإشعارات، وأدوار المسؤولين."
        hints={[
          "هوية المنصة (الاسم، الشعار، الألوان).",
          "إعدادات الدفع وبوابات الفيزا وكروت الشحن.",
          "قوالب الإشعارات للطلاب والمدرسين.",
          "إدارة المسؤولين وأدوارهم.",
        ]}
      />
    </div>
  );
}
