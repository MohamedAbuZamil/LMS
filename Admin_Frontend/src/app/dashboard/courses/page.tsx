import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { PageHeader } from "@/components/admin/PageHeader";

export default function CoursesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="الكورسات"
        subtitle="عرض وإدارة جميع الكورسات على المنصة"
        icon={BookOpen}
        crumbs={[{ label: "اللوحة", href: "/dashboard" }, { label: "الكورسات" }]}
      />
      <ComingSoon
        icon={BookOpen}
        title="إدارة الكورسات قريباً"
        description="ستتمكن من تصفح كل كورسات المنصة وفلترتها وتعديلها من مكان واحد."
        hints={[
          "عرض كل الكورسات لكل مدرس مع البحث والفلترة.",
          "إضافة وتعديل الكورسات والحصص والفيديوهات.",
          "إدارة أسعار الكورسات والخصومات.",
          "ربط كل كورس بمدرسه ومتابعة عدد الطلاب المسجلين.",
        ]}
      />
    </div>
  );
}
