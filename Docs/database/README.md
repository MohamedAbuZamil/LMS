# LMS Database — نظرة عامة

هذا المجلد يحتوي على **المصدر الموثوق** لتصميم قاعدة بيانات منصّة الـ LMS.

## المحتوى

| الملف | الوصف |
| --- | --- |
| `README.md` | هذا الملف — فكرة عامة، اتفاقيات التسمية، الأدوار. |
| `schema.md` | مرجع مُفصّل لكل جدول، أعمدته، علاقاته، فهارسه. |
| `story.md` | قصة كاملة من البداية للنهاية (سيناريوهات SQL لكل مرحلة). |
| `erd.md` | مخطط علاقات الكيانات (ER Diagram) بـ Mermaid. |
| `../../db/lms.sql` | الملف الواحد الكامل: Schema + Views + Seed (PostgreSQL). |

## الـ Stack

- **DBMS:** PostgreSQL 15+
- **Encoding:** UTF-8
- **Timezone:** UTC (التحويل للـ `Africa/Cairo` في طبقة التطبيق)
- **ORM المتوقّع:** Prisma (Next.js API routes)
- **Auth:** JWT + refresh tokens مخزّنة في جدول `refresh_tokens`

## الأدوار (Actors)

| الدور | الجدول | طريقة الدخول | مثال صلاحيات |
| --- | --- | --- | --- |
| **Admin** | `users` | username + password | إدارة كل شيء، إنشاء مدرسين |
| **Teacher** | `users` | username + password | إنشاء كورسات/حصص/بنوك أسئلة/امتحانات |
| **Secretary** | `users` (+ `user_permissions`) | username + password | صلاحيات محدودة يحدّدها المدرس |
| **Student** | `students` | `code` + password | دخول الكورسات، مشاهدة الفيديوهات، أداء الامتحانات |

> **ملاحظة:** الطلاب في جدول منفصل لأن طريقة دخولهم (بالكود) وحقولهم (ولي الأمر، المحافظة، الصف) مختلفة عن طاقم العمل.

## اتفاقيات التسمية

- **Table names:** جمع، `snake_case` (مثال: `question_banks`, `exam_attempts`).
- **Column names:** `snake_case`. المفاتيح الأجنبية `<table_singular>_id` (مثال: `teacher_id`, `course_id`).
- **Primary keys:** دائماً `id BIGSERIAL PRIMARY KEY` (أو `UUID` لو حبّينا لاحقاً).
- **Timestamps:** `created_at`, `updated_at` من نوع `TIMESTAMPTZ DEFAULT NOW()`.
- **Soft delete:** عمود `deleted_at TIMESTAMPTZ NULL` لما يكون الحذف يحتاج استرجاع (طالب، كورس، حصة). الحذف النهائي فقط لكيانات ثانوية.
- **Booleans:** `is_<something>` أو `has_<something>` (مثال: `is_active`, `is_published`).
- **Enums:** نستخدم PostgreSQL `CREATE TYPE ... AS ENUM` (مُوثّقة في `schema.md`).
- **Indexes:** على كل FK + كل عمود يُستخدم في فلترة/ترتيب متكرّر.

## مجموعات الجداول (Domains)

1. **Identity & Access** — `users`, `user_permissions`, `students`, `refresh_tokens`
2. **Lookups** — `governorates`, `grades`
3. **Academic Content** — `courses`, `lessons`, `videos`, `files`
4. **Question Banks** — `question_banks`, `questions`, `question_choices`
5. **Exams** — `exams`, `exam_questions`, `exam_random_rules`, `exam_attempts`, `exam_answers`
6. **Enrollment & Payment** — `enrollments`, `payments`
7. **Wallet** — `wallet_transactions` (+ `students.balance`)
8. **Tracking** — `video_views`, `attendance`
9. **Communication** — `messages`, `notifications`
10. **Audit** — `activity_logs` + audit columns (`created_by`, `recorded_by`, `graded_by`, `marked_by`, `granted_by`, `performed_by`, `sender_user_id`)

## قواعد ذهبية

1. **لا تخزّن معلومة مُستنتَجة:** استخدم `VIEW` بدل جدول مكرّر (مثال: `teacher_students`).
2. **لا تحذف دفعة نقدية أبداً:** `payments` هو append-only — التصحيح يتم بدفعة سالبة (reversal).
3. **كل FK عليه `ON DELETE` صريح:** إمّا `CASCADE` (للأبناء) أو `RESTRICT` (للكيانات الرئيسية) أو `SET NULL` (للمراجع الاختيارية).
4. **كل مبلغ مالي `NUMERIC(12,2)`** — ما بنستخدمش `FLOAT` للفلوس أبداً.
5. **التشفير:** `password_hash` = bcrypt (cost ≥ 10). ما نخزّنش كلمات مرور عادية أبداً.

## كيف أُشغّلها محلياً؟

```bash
# 1) أنشئ قاعدة البيانات
createdb lms_dev

# 2) طبّق الملف الواحد الكامل (Schema + Views + Seed)
psql -d lms_dev -f db/lms.sql
```

## النسخ والترحيل (Migrations)

حالياً نحتفظ بـ `lms.sql` كملف واحد للمصدر الموثوق. بعد ربط Prisma سننتقل إلى migrations مُرقّمة في `prisma/migrations/`.
