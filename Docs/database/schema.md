# LMS Schema — مرجع الجداول

كل جدول موثّق بـ: الغرض، الأعمدة، العلاقات، الفهارس، وملاحظات التصميم.

> الصيغة: `اسم_العمود TYPE — شرح`. العمود اللي مكتوب جنبه `PK` مفتاح أساسي، `FK → table.column` مفتاح أجنبي، `UQ` فريد، `NN` not-null.

---

## ENUMS (الأنواع المخصّصة)

```sql
CREATE TYPE user_role        AS ENUM ('admin', 'teacher', 'secretary');
CREATE TYPE video_server     AS ENUM ('youtube', 'streamable', 'drive', 'lms');
CREATE TYPE exam_visibility  AS ENUM ('visible', 'hidden', 'visible_no_entry');
CREATE TYPE exam_select_mode AS ENUM ('manual', 'random');
CREATE TYPE question_type    AS ENUM ('mcq', 'true_false', 'essay');
CREATE TYPE attendance_state AS ENUM ('present', 'absent', 'late');
CREATE TYPE attempt_status   AS ENUM ('in_progress', 'submitted', 'under_review', 'graded');
CREATE TYPE payment_method   AS ENUM ('cash', 'vodafone', 'instapay', 'fawry', 'wallet', 'other');
CREATE TYPE wallet_tx_type   AS ENUM ('topup', 'purchase', 'refund', 'adjustment');
CREATE TYPE message_channel  AS ENUM ('in_app', 'sms', 'whatsapp', 'email');
CREATE TYPE message_audience AS ENUM ('student', 'parent');
```

---

## 1) Identity & Access

### `users` — الطاقم (Admin / Teacher / Secretary)

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL` | **PK** |
| `role` | `user_role` | **NN** — admin/teacher/secretary |
| `username` | `VARCHAR(60)` | **NN, UQ** |
| `password_hash` | `VARCHAR(255)` | **NN** — bcrypt |
| `name` | `VARCHAR(120)` | **NN** |
| `email` | `VARCHAR(160)` | UQ (nullable) |
| `phone` | `VARCHAR(20)` | nullable |
| `avatar_url` | `TEXT` | nullable |
| `manager_teacher_id` | `BIGINT` | **FK → users.id** — السكرتارية بتتبع أيّ مدرس؟ `NULL` للمدرس/الأدمن |
| `is_active` | `BOOLEAN` | default `true` |
| `last_login_at` | `TIMESTAMPTZ` | nullable |
| `created_at` / `updated_at` / `deleted_at` | `TIMESTAMPTZ` | قياسي |

**قيود:**
- `CHECK`: لو `role = 'secretary'` فـ `manager_teacher_id IS NOT NULL`.
- `CHECK`: لو `role <> 'secretary'` فـ `manager_teacher_id IS NULL`.

**فهارس:** `(role)`, `(manager_teacher_id)`, `(username)`.

---

### `user_permissions` — صلاحيات السكرتارية

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL` | **PK** |
| `user_id` | `BIGINT` | **FK → users.id** `ON DELETE CASCADE` |
| `permission_key` | `VARCHAR(80)` | **NN** — مثال: `courses.create`, `students.remove` |
| `granted_by` | `BIGINT` | **FK → users.id** — المدرس اللي منح الصلاحية |
| `granted_at` | `TIMESTAMPTZ` | default `NOW()` |

**قيود:** `UNIQUE(user_id, permission_key)`.

**ملاحظة:** قائمة المفاتيح كلها في `Teacher_Frontend/src/lib/data/permissions.ts`. ممكن نعمل جدول `permission_catalog` لاحقاً لو بقت كتيرة.

---

### `students` — الطلاب

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL` | **PK** |
| `code` | `VARCHAR(20)` | **NN, UQ** — كود الطالب اللي بيسجّل بيه |
| `password_hash` | `VARCHAR(255)` | **NN** |
| `name` | `VARCHAR(120)` | **NN** |
| `phone` | `VARCHAR(20)` | nullable |
| `parent_phone` | `VARCHAR(20)` | nullable — للإشعار |
| `grade_id` | `SMALLINT` | **FK → grades.id** |
| `governorate_id` | `SMALLINT` | **FK → governorates.id** |
| `birth_date` | `DATE` | nullable |
| `avatar_url` | `TEXT` | nullable |
| `balance` | `NUMERIC(12,2)` | **NN** default `0` — رصيد المحفظة، مُحدَّث تلقائياً عبر trigger من `wallet_transactions` |
| `is_active` | `BOOLEAN` | default `true` |
| `last_login_at` | `TIMESTAMPTZ` | nullable |
| `created_at` / `updated_at` / `deleted_at` | `TIMESTAMPTZ` | قياسي |

**فهارس:** `(code)`, `(grade_id)`, `(governorate_id)`, `(name)` للبحث.

---

### `refresh_tokens` — توكنات الـ JWT

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL` | **PK** |
| `user_id` | `BIGINT` | nullable, **FK → users.id** |
| `student_id` | `BIGINT` | nullable, **FK → students.id** |
| `token_hash` | `VARCHAR(255)` | **NN, UQ** |
| `expires_at` | `TIMESTAMPTZ` | **NN** |
| `revoked_at` | `TIMESTAMPTZ` | nullable |
| `user_agent` / `ip_address` | `TEXT` | للتتبع |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` |

**قيود:** `CHECK(user_id IS NOT NULL OR student_id IS NOT NULL)`.

---

## 2) Lookups

### `governorates`

| العمود | النوع |
| --- | --- |
| `id` | `SMALLSERIAL PK` |
| `name` | `VARCHAR(60) NN UQ` |
| `name_en` | `VARCHAR(60)` |

### `grades`

| العمود | النوع |
| --- | --- |
| `id` | `SMALLSERIAL PK` |
| `name` | `VARCHAR(60) NN UQ` |
| `order_index` | `SMALLINT` |

---

## 3) Academic Content

### `courses`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL` | **PK** |
| `teacher_id` | `BIGINT` | **FK → users.id** `ON DELETE RESTRICT` |
| `title` | `VARCHAR(200)` | **NN** |
| `description` | `TEXT` | |
| `grade_id` | `SMALLINT` | **FK → grades.id** |
| `image_url` | `TEXT` | |
| `price_total` | `NUMERIC(10,2)` | **NN** — سعر الكورس كامل |
| `price_per_lesson` | `NUMERIC(10,2)` | — سعر الحصة المنفصلة |
| `total_lessons` | `INTEGER` | default 0 |
| `start_date` | `DATE` | |
| `is_published` | `BOOLEAN` | default `false` |
| `created_at` / `updated_at` / `deleted_at` | `TIMESTAMPTZ` | قياسي |

**فهارس:** `(teacher_id, is_published)`, `(grade_id)`.

---

### `lessons`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `course_id` | `BIGINT` | **FK → courses.id** `ON DELETE CASCADE` |
| `title` | `VARCHAR(200) NN` | |
| `description` | `TEXT` | |
| `order_index` | `INTEGER NN` | ترتيب الحصة |
| `scheduled_at` | `TIMESTAMPTZ` | |
| `is_published` | `BOOLEAN` | default `false` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

**فهارس:** `(course_id, order_index)`.

---

### `videos`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `lesson_id` | `BIGINT` | **FK → lessons.id** `CASCADE` |
| `title` | `VARCHAR(200) NN` | |
| `description` | `TEXT` | |
| `server` | `video_server NN` | youtube/streamable/drive/lms |
| `url` | `TEXT NN` | |
| `thumbnail_url` | `TEXT` | |
| `duration_sec` | `INTEGER` | |
| `max_views` | `INTEGER` | `NULL` = غير محدود |
| `order_index` | `INTEGER NN` | |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

---

### `files` — مرفقات الحصة

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `lesson_id` | `BIGINT` | **FK → lessons.id** `CASCADE` |
| `title` | `VARCHAR(200) NN` | |
| `url` | `TEXT NN` | |
| `size_bytes` | `BIGINT` | |
| `mime_type` | `VARCHAR(120)` | |
| `created_at` | `TIMESTAMPTZ` | |

---

## 4) Question Banks

### `question_banks`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `teacher_id` | `BIGINT` | **FK → users.id** `RESTRICT` |
| `title` | `VARCHAR(200) NN` | |
| `description` | `TEXT` | |
| `grade_id` | `SMALLINT` | **FK → grades.id** — `NULL` = كل الصفوف |
| `created_at` / `updated_at` / `deleted_at` | `TIMESTAMPTZ` | |

---

### `questions`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `bank_id` | `BIGINT` | **FK → question_banks.id** `CASCADE` |
| `type` | `question_type NN` | mcq / true_false / essay |
| `text` | `TEXT NN` | |
| `explanation` | `TEXT` | الشرح بعد الإجابة |
| `score` | `NUMERIC(5,2) NN` | default `1.00` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

---

### `question_choices` — خيارات MCQ و True/False

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `question_id` | `BIGINT` | **FK → questions.id** `CASCADE` |
| `text` | `TEXT NN` | |
| `is_correct` | `BOOLEAN NN` | |
| `order_index` | `SMALLINT NN` | |

**قيود:** لسؤال MCQ لازم ≥ 2 خيارات وخيار واحد على الأقل `is_correct = true`. للـ True/False بالظبط خياران. (تُفرَض في التطبيق أو عبر trigger).

---

## 5) Exams

### `exams`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `lesson_id` | `BIGINT` | **FK → lessons.id** `CASCADE` |
| `title` | `VARCHAR(200) NN` | |
| `description` | `TEXT` | |
| `starts_at` | `TIMESTAMPTZ NN` | |
| `ends_at` | `TIMESTAMPTZ NN` | |
| `duration_min` | `SMALLINT NN` | 15..150 |
| `visibility` | `exam_visibility NN` | default `visible` |
| `selection_mode` | `exam_select_mode NN` | manual / random |
| `total_score` | `NUMERIC(6,2)` | مُحسوب من الأسئلة |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

**قيود:** `CHECK (ends_at > starts_at)`, `CHECK (duration_min BETWEEN 5 AND 300)`.

---

### `exam_questions` — ربط أسئلة البنك بالامتحان (manual)

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `exam_id` | `BIGINT` | **FK → exams.id** `CASCADE` |
| `question_id` | `BIGINT` | **FK → questions.id** `RESTRICT` |
| `order_index` | `INTEGER NN` | |
| `score_override` | `NUMERIC(5,2)` | لو المدرس عايز درجة مختلفة |

**قيود:** `UNIQUE(exam_id, question_id)`.

---

### `exam_random_rules` — قواعد الاختيار العشوائي

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `exam_id` | `BIGINT` | **FK → exams.id** `CASCADE` |
| `bank_id` | `BIGINT` | **FK → question_banks.id** `RESTRICT` |
| `count` | `SMALLINT NN` | عدد الأسئلة المراد سحبها من البنك |
| `question_type` | `question_type` | nullable — لو عايز نوع معيّن فقط |

---

### `exam_attempts` — محاولات الطالب

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `exam_id` | `BIGINT` | **FK → exams.id** `RESTRICT` |
| `student_id` | `BIGINT` | **FK → students.id** `RESTRICT` |
| `started_at` | `TIMESTAMPTZ NN` | default `NOW()` |
| `submitted_at` | `TIMESTAMPTZ` | |
| `score` | `NUMERIC(6,2)` | |
| `status` | `attempt_status NN` | default `in_progress` |
| `snapshot` | `JSONB` | الأسئلة اللي ظهرت للطالب (عشان random) |

**فهارس:** `(exam_id, student_id)`, `(student_id, status)`.

---

### `exam_answers` — إجابات الطالب

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `attempt_id` | `BIGINT` | **FK → exam_attempts.id** `CASCADE` |
| `question_id` | `BIGINT` | **FK → questions.id** `RESTRICT` |
| `choice_id` | `BIGINT` | **FK → question_choices.id** — للـ mcq/true_false |
| `answer_text` | `TEXT` | للـ essay |
| `is_correct` | `BOOLEAN` | nullable — `NULL` للمقالي قبل التصحيح |
| `score_awarded` | `NUMERIC(5,2)` | nullable — `NULL` للمقالي قبل التصحيح |
| `graded_by` | `BIGINT` | **FK → users.id** — مين صحّح هذه الإجابة |
| `graded_at` | `TIMESTAMPTZ` | nullable — وقت التصحيح. `NULL` = **قيد التصحيح** |
| `feedback` | `TEXT` | ملاحظة المدرس على إجابة المقالي |

---

## 6) Enrollment & Payment

### `enrollments`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `student_id` | `BIGINT` | **FK → students.id** `RESTRICT` |
| `course_id` | `BIGINT` | **FK → courses.id** `RESTRICT` |
| `enrolled_at` | `TIMESTAMPTZ` | default `NOW()` |
| `unenrolled_at` | `TIMESTAMPTZ` | |
| `is_active` | `BOOLEAN NN` | default `true` |
| `total_due` | `NUMERIC(10,2) NN` | سعر الكورس وقت التسجيل |
| `paid_total` | `NUMERIC(10,2) NN` | default `0` — مُحدّث عبر trigger من `payments` |
| `created_by` | `BIGINT` | **FK → users.id** (المدرس أو السكرتارية) |

**قيود:** `UNIQUE(student_id, course_id)` — طالب واحد = تسجيل واحد في الكورس.

**فهارس:** `(student_id, is_active)`, `(course_id, is_active)`.

---

### `payments` — append-only

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `enrollment_id` | `BIGINT` | **FK → enrollments.id** `RESTRICT` |
| `amount` | `NUMERIC(10,2) NN` | يمكن تكون سالبة (استرجاع) |
| `method` | `payment_method NN` | |
| `reference` | `VARCHAR(120)` | رقم العملية للفودافون/الفوري |
| `note` | `TEXT` | |
| `recorded_by` | `BIGINT` | **FK → users.id** |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` |

**Trigger:** بعد `INSERT` نُحدّث `enrollments.paid_total`.

---

## 7) Tracking

### `video_views` — سجلّ المشاهدات (⭐ جوهر الحضور التلقائي)

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `student_id` | `BIGINT` | **FK → students.id** `CASCADE` |
| `video_id` | `BIGINT` | **FK → videos.id** `CASCADE` |
| `lesson_id` | `BIGINT` | **FK → lessons.id** `CASCADE` (denormalized للسرعة) |
| `course_id` | `BIGINT` | **FK → courses.id** `CASCADE` (denormalized) |
| `started_at` | `TIMESTAMPTZ NN` | default `NOW()` |
| `last_watched_at` | `TIMESTAMPTZ NN` | |
| `watched_seconds` | `INTEGER NN` | default 0 |
| `completed` | `BOOLEAN NN` | default `false` (≥ 90%) |
| `ip_address` | `INET` | |
| `user_agent` | `TEXT` | |

**فهارس:**
- `(student_id, video_id)` — كم مرة شاهد الطالب؟
- `(video_id, student_id)` — مين شاف الفيديو ده؟
- `(lesson_id, student_id)` — هل الطالب حضر الحصة؟
- `(started_at)` — تقارير زمنية.

**استعلامات نموذجية:** انظر `views.sql` → `v_video_view_counts`, `v_lesson_watch_progress`.

---

### `attendance` — الحضور اليدوي (offline / live)

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `lesson_id` | `BIGINT` | **FK → lessons.id** `CASCADE` |
| `student_id` | `BIGINT` | **FK → students.id** `CASCADE` |
| `status` | `attendance_state NN` | present / absent / late |
| `note` | `TEXT` | |
| `marked_by` | `BIGINT` | **FK → users.id** |
| `marked_at` | `TIMESTAMPTZ` | default `NOW()` |

**قيود:** `UNIQUE(lesson_id, student_id)` — سجل واحد يُحدَّث (upsert).

---

## 8) Communication

### `messages` — تقارير الامتحانات والرسائل المباشرة

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `sender_user_id` | `BIGINT` | **FK → users.id** |
| `recipient_student_id` | `BIGINT` | **FK → students.id** `CASCADE` |
| `audience` | `message_audience NN` | student / parent |
| `channel` | `message_channel NN` | default `in_app` |
| `related_exam_id` | `BIGINT` | **FK → exams.id** nullable |
| `subject` | `VARCHAR(200)` | |
| `body` | `TEXT NN` | |
| `sent_at` | `TIMESTAMPTZ` | default `NOW()` |
| `delivered_at` / `read_at` | `TIMESTAMPTZ` | nullable |

---

### `notifications` — إشعارات داخل التطبيق

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `user_id` | `BIGINT` | **FK → users.id** nullable |
| `student_id` | `BIGINT` | **FK → students.id** nullable |
| `type` | `VARCHAR(60) NN` | مثال: `exam.new`, `payment.received` |
| `title` | `VARCHAR(200) NN` | |
| `body` | `TEXT` | |
| `data` | `JSONB` | معلومات إضافية (IDs للـ deep-link) |
| `read_at` | `TIMESTAMPTZ` | |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` |

**قيود:** `CHECK(user_id IS NOT NULL OR student_id IS NOT NULL)`.

---

## 9) Audit

### `activity_logs`

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `actor_user_id` | `BIGINT` | **FK → users.id** nullable |
| `actor_student_id` | `BIGINT` | **FK → students.id** nullable |
| `action` | `VARCHAR(80) NN` | `course.create`, `student.unenroll` ... |
| `entity_type` | `VARCHAR(60)` | |
| `entity_id` | `BIGINT` | |
| `metadata` | `JSONB` | |
| `ip_address` | `INET` | |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` |

**فهارس:** `(actor_user_id, created_at DESC)`, `(entity_type, entity_id)`.

---

## محفظة الطالب (Wallet)

### `wallet_transactions` — حركات المحفظة (append-only)

| العمود | النوع | ملاحظات |
| --- | --- | --- |
| `id` | `BIGSERIAL PK` | |
| `student_id` | `BIGINT` | **FK → students.id** `RESTRICT` |
| `type` | `wallet_tx_type NN` | `topup` / `purchase` / `refund` / `adjustment` |
| `amount` | `NUMERIC(12,2) NN` | موجبة للشحن/الاسترداد، سالبة للشراء |
| `balance_after` | `NUMERIC(12,2) NN` | الرصيد بعد الحركة (snapshot للتدقيق) — يُملأ تلقائياً |
| `reference_type` | `VARCHAR(40)` | مثال: `enrollment` |
| `reference_id` | `BIGINT` | id الكيان المرتبط (مثلاً enrollment_id لو شراء) |
| `method` | `payment_method` | طريقة الشحن (للـ topup): vodafone/fawry/... |
| `reference` | `VARCHAR(120)` | رقم العملية الخارجي |
| `note` | `TEXT` | |
| `performed_by` | `BIGINT` | **FK → users.id** — مين عمل الحركة (أدمن/سكرتارية)؛ `NULL` لو شحن ذاتي |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` |

**Trigger:** `BEFORE INSERT` يُحدّث `students.balance` ويرفض الحركة لو الرصيد هيبقى سالب.

**سيناريو شراء كورس بالرصيد:**
```sql
BEGIN;
  INSERT INTO enrollments (student_id, course_id, total_due, created_by)
    VALUES (10, 5, 500.00, NULL) RETURNING id;  -- سجّل بنفسه
  INSERT INTO wallet_transactions (student_id, type, amount, reference_type, reference_id)
    VALUES (10, 'purchase', -500.00, 'enrollment', :new_enrollment_id);
  INSERT INTO payments (enrollment_id, amount, method, recorded_by)
    VALUES (:new_enrollment_id, 500.00, 'wallet', NULL);
COMMIT;
```

**شحن المحفظة من السكرتارية:**
```sql
INSERT INTO wallet_transactions (student_id, type, amount, method, reference, performed_by, note)
VALUES (10, 'topup', 500.00, 'vodafone', 'TXN-12345', :secretary_id, 'شحن محفظة');
```

---

## مين عمل إيه؟ (Audit Trail)

الـ schema يربط كل حركة بالشخص اللي عملها، عشان تعرف "مين أضاف الطالب للكورس؟" و"مين صحّح الامتحان؟":

| الحركة | الجدول | عمود التتبّع | المرجع |
| --- | --- | --- | --- |
| **إضافة طالب لكورس** | `enrollments` | `created_by` | `users.id` (مدرس/سكرتارية) |
| **تسجيل دفعة نقدية** | `payments` | `recorded_by` | `users.id` |
| **شحن/تعديل محفظة** | `wallet_transactions` | `performed_by` | `users.id` (NULL = شحن ذاتي) |
| **تصحيح إجابة امتحان** | `exam_answers` | `graded_by` + `graded_at` | `users.id` + timestamp |
| **حضور يدوي** | `attendance` | `marked_by` | `users.id` |
| **إرسال رسالة** | `messages` | `sender_user_id` | `users.id` |
| **منح صلاحية لسكرتارية** | `user_permissions` | `granted_by` | `users.id` |
| **أيّ حركة أخرى** | `activity_logs` | `actor_user_id` / `actor_student_id` | فريمورك عام |

---

## تصحيح المقالي — Workflow

```
[طالب يبدأ الامتحان]   → exam_attempts.status = 'in_progress'
[طالب يسلّم]            → exam_attempts.status = 'submitted'
                          • MCQ + True/False يُصحَّحون تلقائياً
                            (is_correct + score_awarded + graded_at = NOW())
                          • Essay: is_correct=NULL, graded_at=NULL
[التطبيق يرفع الحالة لـ] → 'under_review' لو فيه إجابات مقالي بدون graded_at
[المدرس يصحّح المقالي]  → كل إجابة:
                            graded_by = teacher_id
                            graded_at = NOW()
                            score_awarded = X
                            feedback = 'ملاحظة'
[آخر مقالي اتصحح]      → exam_attempts.status = 'graded'
                          + score = SUM(score_awarded)
```

**المدرس بيشوف المعلّق:**
```sql
SELECT * FROM v_essay_pending_grading WHERE teacher_id = 5;
```

**حالة كل محاولة (مُصحَّح / قيد التصحيح / لم يُسلَّم):**
```sql
SELECT attempt_id, status_label, essay_pending, essay_graded
FROM v_attempt_grading_status
WHERE student_id = 10;
```

---

## تعليقات المدرس على الأسئلة (نموذج الإجابة + ملاحظات شخصية)

في الـ schema **مكانان** للتعليق وكلاهما موجود — اختر حسب الجمهور:

### 1) تعليق عام على السؤال (نموذج الإجابة) — يظهر لكل من حلّ الامتحان

```@c:\zamil\lms\db\schema.sql:217-227
CREATE TABLE questions (
  ...
  type        question_type NOT NULL,
  text        TEXT NOT NULL,
  explanation TEXT,                          -- ⭐ التعليق العام / نموذج الإجابة
  score       NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  ...
);
```

- **يُكتب مرّة واحدة** عند إنشاء السؤال في بنك الأسئلة.
- **يُعاد استخدامه** في كل امتحان يستعمل هذا السؤال.
- **يظهر للطلاب** بعد تسليم الامتحان (في صفحة المراجعة).

```sql
-- المدرس يضيف/يحدّث الشرح
UPDATE questions SET explanation = 'الإجابة الصحيحة لأن... ' WHERE id = 42;
```

### 2) تعليق شخصي للطالب على إجابته — يظهر لهذا الطالب فقط

```@c:\zamil\lms\db\schema.sql:295-309
CREATE TABLE exam_answers (
  ...
  is_correct     BOOLEAN,            -- NULL = not graded yet (essay)
  score_awarded  NUMERIC(5,2),       -- NULL = not graded yet (essay)
  graded_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  graded_at      TIMESTAMPTZ,        -- NULL while pending review
  feedback       TEXT,               -- ⭐ ملاحظة المدرس على إجابة هذا الطالب
  ...
);
```

- **يُكتب أثناء التصحيح** لكل إجابة على حدة.
- **خاص بإجابة الطالب فقط** ولا يراه غيره.
- مفيد جداً للأسئلة المقالية: "إجابتك ناقصة لأنّك لم تذكر القانون الثاني..."

```sql
-- المدرس يصحّح إجابة مقالي ويترك ملاحظة شخصية
UPDATE exam_answers
   SET score_awarded = 4.5,
       is_correct    = NULL,            -- المقالي ليس صح/خطأ مطلق
       feedback      = 'الفكرة سليمة لكن الشرح ينقصه مثال.',
       graded_by     = :teacher_id,
       graded_at     = NOW()
 WHERE id = :answer_id;
```

### 3) المراجعة الكاملة للطالب — `v_student_answer_review` (⭐)

View واحد يجمع كل ما يحتاجه الطالب لرؤية مراجعة امتحانه:

| العمود | المصدر |
| --- | --- |
| `question_text` | `questions.text` |
| `student_choice_text` / `student_answer_text` | إجابة الطالب |
| `correct_choice_text` | الإجابة الصحيحة (للـ MCQ/TF) |
| `is_correct`, `score_awarded` | نتيجة التصحيح |
| `general_explanation` | `questions.explanation` (الشرح العام) |
| `teacher_feedback` | `exam_answers.feedback` (الملاحظة الشخصية) |

```sql
-- صفحة "مراجعة الامتحان" للطالب
SELECT * FROM v_student_answer_review
WHERE attempt_id = 99
ORDER BY question_id;
```

> **سياسة الإظهار:** الواجهة تُظهر `general_explanation` و`correct_choice_text` فقط بعد `graded_at IS NOT NULL` للمحاولة، لمنع تسريب الإجابات قبل اكتمال التصحيح.

---

## VIEWS المهمّة (تفاصيلها في `db/views.sql`)

| View | الغرض |
| --- | --- |
| `teacher_students` | كل طالب مشترك في كورس واحد على الأقل مع المدرس (⭐) |
| `v_course_enrollment_stats` | عدد الطلاب، المدفوع، المتبقي لكل كورس |
| `v_video_view_counts` | عدد المشاهدات لكل (طالب، فيديو) |
| `v_lesson_watch_progress` | هل الطالب أكمل فيديوهات الحصة؟ (للحضور التلقائي) |
| `v_student_courses` | الكورسات النشطة للطالب مع بيانات الدفع |
| `v_essay_pending_grading` | إجابات المقالي اللي تنتظر تصحيح المدرس (⭐) |
| `v_student_answer_review` | مراجعة الطالب لإجابته + الإجابة الصحيحة + الشرح + ملاحظة المدرس (⭐) |
| `v_attempt_grading_status` | هل المحاولة مُصحَّحة كاملة؟ ولا قيد التصحيح؟ (⭐) |
| `v_student_wallet` | رصيد الطالب + مجموع الشحن/الإنفاق/الاسترداد (⭐) |
| `v_enrollment_audit` | مين سجّل كل طالب في كل كورس + عدد دفعاته (⭐) |

---

## سيناريوهات تصميمية مهمّة

### أ) طلابي و"مدرسيني" (⭐ سؤالك الأصلي)

```sql
-- طلاب المدرس رقم 5
SELECT s.* FROM teacher_students ts
JOIN students s ON s.id = ts.student_id
WHERE ts.teacher_id = 5;

-- مدرسيني (للطالب رقم 10)
SELECT u.id, u.name, u.avatar_url FROM teacher_students ts
JOIN users u ON u.id = ts.teacher_id
WHERE ts.student_id = 10;
```

### ب) هل الطالب شاف الفيديو؟ كام مرة؟

```sql
SELECT video_id, COUNT(*) AS views, MAX(last_watched_at) AS last_view,
       SUM(watched_seconds) AS total_watched, BOOL_OR(completed) AS ever_completed
FROM video_views
WHERE student_id = 10 AND lesson_id = 44
GROUP BY video_id;
```

### ج) حضور الحصة تلقائياً (اعتبر حاضر لو شاف ≥ 80% من فيديوهاتها)

موجود جاهز في `v_lesson_watch_progress`.

### د) منع مشاركة الحساب

من `video_views` نقدر نكتشف IPs مختلفة كتير لنفس الطالب في وقت قصير → نطلق alert أو نقفل الحساب.
