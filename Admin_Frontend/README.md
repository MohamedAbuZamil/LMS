# LMS – Admin Frontend

لوحة تحكم إدارية لمنصة LMS. مبنية بنفس تقنيات `Student_Frontend`:
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Framer Motion** للحركات
- **Lucide React** للأيقونات
- **Tajawal** كخط افتراضي
- **RTL** عربي

## التشغيل

```powershell
cd Admin_Frontend
npm install
npm run dev
```

يفتح على `http://localhost:3001` (منفذ 3001 لتجنّب التعارض مع `Student_Frontend` على 3000).

## حسابات تجريبية للدخول

| Username | Password |
| -------- | -------- |
| `admin`  | `admin`  |

(الحساب مخزَّن مؤقتاً في `sessionStorage` تحت مفتاح `lms.admin.session`.)

## هيكل الصفحات

```
/                                    → redirect → /login
/login                               صفحة تسجيل الدخول
/dashboard                           نظرة عامة (إحصائيات + آخر المدرسين)
/dashboard/teachers                  قائمة المدرسين
/dashboard/teachers/new              إضافة مدرس جديد
/dashboard/teachers/[id]             تفاصيل مدرس (كورسات/سكرتارية/إعدادات)
/dashboard/courses                   إدارة جميع الكورسات (placeholder)
/dashboard/secretaries               إدارة جميع السكرتارية (placeholder)
/dashboard/settings                  إعدادات عامة (placeholder)
```

## بيانات مؤقتة
`src/lib/data/*.ts` — نفس شكل `Teacher` المستخدم في `Student_Frontend` لسهولة الدمج لاحقاً مع الـ backend.
