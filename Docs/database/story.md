# LMS — قصة قاعدة البيانات الكاملة

سيناريو من البداية للنهاية يوضّح كيف تتفاعل كل الجداول مع بعضها في رحلة فعلية: **أدمن ينشئ مدرس → مدرس يبني كورس → طالب يشحن محفظته ويشتري → يتفرّج → يمتحن → المدرس يصحّح → الطالب يراجع → السكرتارية تتابع الحضور والمدفوعات.**

> الأرقام في الأمثلة افتراضية للتوضيح. كل سطر SQL قابل للتشغيل بعد `psql -d lms_dev -f db/lms.sql`.

---

## الفصل الأول — التأسيس (Bootstrap)

### المشهد 1: الأدمن ينشئ نفسه

```sql
INSERT INTO users (role, username, password_hash, name)
VALUES ('admin', 'superadmin', '$2b$10$...', 'محمد الأدمن')
RETURNING id;  -- مثلاً: 1
```

### المشهد 2: الأدمن ينشئ مدرس "أحمد الفيزيا"

```sql
INSERT INTO users (role, username, password_hash, name, phone)
VALUES ('teacher', 'ahmed_physics', '$2b$10$...', 'أحمد الفيزيا', '01012345678')
RETURNING id;  -- مثلاً: 2

-- يسجَّل في activity_logs
INSERT INTO activity_logs (actor_user_id, action, entity_type, entity_id, metadata)
VALUES (1, 'user.create', 'user', 2, '{"role":"teacher"}'::jsonb);
```

### المشهد 3: المدرس يضيف سكرتارية "منى" بصلاحيات محدودة

```sql
-- 1) إنشاء حساب السكرتارية تحت إشراف المدرس رقم 2
INSERT INTO users (role, username, password_hash, name, manager_teacher_id)
VALUES ('secretary', 'mona', '$2b$10$...', 'منى السكرتيرة', 2)
RETURNING id;  -- 3

-- 2) منحها صلاحيات معيّنة (المدرس يقرّر)
INSERT INTO user_permissions (user_id, permission_key, granted_by) VALUES
  (3, 'students.view',     2),
  (3, 'students.add',      2),
  (3, 'payments.record',   2),
  (3, 'attendance.mark',   2),
  (3, 'wallet.topup',      2);
-- ⛔ لاحظ: ما عندهاش 'courses.create' ولا 'banks.edit'
```

> **القاعدة:** `users.manager_teacher_id` يربط السكرتارية بمدرسها. الـ CHECK constraint بيمنع المدرس/الأدمن إنه يكون عنده مدير، وبيُلزم السكرتارية إن يكون ليها واحد.

---

## الفصل الثاني — بناء المحتوى الأكاديمي

### المشهد 4: المدرس ينشئ كورس "الفيزياء — الصف التالت"

```sql
INSERT INTO courses (
  teacher_id, title, description, grade_id, image_url,
  price_total, price_per_lesson, total_lessons, start_date, is_published
) VALUES (
  2, 'الفيزياء — الصف الثالث الثانوي', 'منهج كامل مع مراجعات',
  6,                                   -- grade_id من جدول grades
  'https://cdn.example/physics.jpg',
  2400.00, 200.00, 12,
  '2025-09-01', TRUE
) RETURNING id;  -- 50
```

### المشهد 5: المدرس يضيف 3 حصص

```sql
INSERT INTO lessons (course_id, title, order_index, scheduled_at, is_published) VALUES
  (50, 'الحصة 1: المتجهات',        1, '2025-09-02 18:00+02', TRUE),
  (50, 'الحصة 2: الحركة المستقيمة', 2, '2025-09-09 18:00+02', TRUE),
  (50, 'الحصة 3: قوانين نيوتن',     3, '2025-09-16 18:00+02', FALSE);
```

### المشهد 6: المدرس يضيف فيديو وملف PDF للحصة الأولى

```sql
-- فيديو على يوتيوب مع حد أقصى 3 مشاهدات
INSERT INTO videos (lesson_id, title, server, url, duration_sec, max_views, order_index)
VALUES (101, 'مقدمة المتجهات', 'youtube', 'https://youtu.be/abc', 1800, 3, 1);

-- ملف PDF
INSERT INTO files (lesson_id, title, url, size_bytes, mime_type)
VALUES (101, 'ملخص المتجهات.pdf', 'https://cdn/notes.pdf', 524288, 'application/pdf');
```

### المشهد 7: المدرس ينشئ بنك أسئلة ويملأه

```sql
-- بنك أسئلة
INSERT INTO question_banks (teacher_id, title, grade_id, description)
VALUES (2, 'بنك المتجهات', 6, 'أسئلة متنوعة على وحدة المتجهات')
RETURNING id;  -- 70

-- سؤال MCQ + خياراته + شرح عام
WITH q AS (
  INSERT INTO questions (bank_id, type, text, explanation, score)
  VALUES (70, 'mcq', 'حاصل ضرب متجهين متعامدين قياسياً يساوي؟',
          'الضرب القياسي = |a||b|cos(θ). عند 90° يكون cos=0.', 1.0)
  RETURNING id
)
INSERT INTO question_choices (question_id, text, is_correct, order_index)
SELECT q.id, t, c, o FROM q,
  (VALUES ('صفر', TRUE, 1), ('|a||b|', FALSE, 2),
          ('|a|+|b|', FALSE, 3), ('1', FALSE, 4)) AS x(t,c,o);

-- سؤال مقالي
INSERT INTO questions (bank_id, type, text, score)
VALUES (70, 'essay', 'اشرح بالخطوات كيف تجمع متجهين بطريقة المثلث.', 5.0);
```

> **ملاحظة:** `questions.explanation` يظهر للطلاب في صفحة مراجعة الامتحان (نموذج الإجابة).

---

## الفصل الثالث — تسجيل الطلاب وإدارة المحفظة

### المشهد 8: السكرتارية تنشئ حساب طالب جديد

```sql
INSERT INTO students (
  code, password_hash, name, phone, parent_phone,
  grade_id, governorate_id, birth_date
) VALUES (
  'STU-2025-0001', '$2b$10$...', 'يوسف أحمد', '01087654321', '01055555555',
  6,    -- ثالثة ثانوي
  1,    -- القاهرة
  '2008-05-12'
) RETURNING id;  -- 200

-- log
INSERT INTO activity_logs (actor_user_id, action, entity_type, entity_id)
VALUES (3, 'student.create', 'student', 200);
```

### المشهد 9: شحن محفظة الطالب 3000 جنيه (الأم دفعت فودافون كاش)

```sql
-- ملاحظة: balance_after يُملأ تلقائياً عبر trigger
INSERT INTO wallet_transactions (
  student_id, type, amount, method, reference, performed_by, note
) VALUES (
  200, 'topup', 3000.00, 'vodafone', 'VFC-918273', 3, 'شحن من ولي الأمر'
);

-- التحقق
SELECT balance FROM students WHERE id = 200;          -- 3000.00
SELECT * FROM v_student_wallet WHERE student_id = 200;
```

> **Trigger ذكي:** `sync_student_balance` يُحدّث `students.balance` ويرفع Exception لو جاتك حركة هتخلّي الرصيد بالسالب.

### المشهد 10: الطالب يشتري الكورس بالرصيد (Self-service)

```sql
BEGIN;
  -- 1) ينشئ تسجيلاً (created_by = NULL لأنه الطالب نفسه)
  INSERT INTO enrollments (student_id, course_id, total_due, paid_total, created_by)
  VALUES (200, 50, 2400.00, 0, NULL)
  RETURNING id;  -- 300

  -- 2) خصم من المحفظة
  INSERT INTO wallet_transactions (
    student_id, type, amount, reference_type, reference_id, note
  ) VALUES (
    200, 'purchase', -2400.00, 'enrollment', 300, 'شراء كورس الفيزياء'
  );
  -- balance بعدها = 600.00

  -- 3) تسجيل الدفعة بطريقة wallet (trigger يحدّث enrollments.paid_total)
  INSERT INTO payments (enrollment_id, amount, method, recorded_by)
  VALUES (300, 2400.00, 'wallet', NULL);
COMMIT;

-- النتيجة
SELECT student_id, course_id, paid_total, total_due FROM enrollments WHERE id = 300;
-- 200 | 50 | 2400.00 | 2400.00 ✓ مدفوع بالكامل
```

### المشهد 11: السكرتارية تضيف طالب آخر يدوياً وتسجّل دفعة كاش

```sql
-- طالب جديد
INSERT INTO students (code, password_hash, name, grade_id, governorate_id, parent_phone)
VALUES ('STU-2025-0002', '$2b$10$...', 'سلمى محمد', 6, 2, '01122223333')
RETURNING id;  -- 201

-- تسجيله في الكورس (السكرتارية = user 3)
INSERT INTO enrollments (student_id, course_id, total_due, created_by)
VALUES (201, 50, 2400.00, 3) RETURNING id;  -- 301

-- دفعة جزئية كاش
INSERT INTO payments (enrollment_id, amount, method, recorded_by, note)
VALUES (301, 1000.00, 'cash', 3, 'دفعة أولى');
-- enrollments.paid_total بقت 1000.00 تلقائياً
```

> **Audit:** أي حد يفتح ملف الطالب يقدر يعرف **مين سجّله** عبر `v_enrollment_audit`:

```sql
SELECT student_name, course_title, enrolled_by_name, enrolled_by_role,
       paid_total, total_due, payments_count
FROM v_enrollment_audit WHERE student_id = 201;
-- سلمى | الفيزياء... | منى السكرتيرة | secretary | 1000.00 | 2400.00 | 1
```

---

## الفصل الرابع — الطالب يدخل ويتعلّم

### المشهد 12: تسجيل دخول الطالب → JWT

```sql
-- بعد التحقق من الكود + كلمة السر، نحفظ refresh token
INSERT INTO refresh_tokens (student_id, token_hash, expires_at, ip_address, user_agent)
VALUES (200, '$argon2$...', NOW() + INTERVAL '30 days', '197.45.x.x', 'Chrome/122');

-- نُحدّث آخر دخول
UPDATE students SET last_login_at = NOW() WHERE id = 200;
```

### المشهد 13: "كورساتي" — يُسحَب من view

```sql
SELECT course_id, title, image_url, paid_total, remaining
FROM v_student_courses
WHERE student_id = 200 AND is_active = TRUE;
```

### المشهد 14: "مدرسيني" — مستنتج تلقائياً

```sql
SELECT u.id, u.name, u.avatar_url
FROM teacher_students ts
JOIN users u ON u.id = ts.teacher_id
WHERE ts.student_id = 200;
-- يرجّع المدرس "أحمد الفيزيا" لأن الطالب مسجّل في كورس واحد على الأقل عنده.
```

### المشهد 15: الطالب يفتح الفيديو ويبدأ المشاهدة

```sql
-- بداية الجلسة
INSERT INTO video_views (
  student_id, video_id, lesson_id, course_id,
  started_at, last_watched_at, watched_seconds, ip_address
) VALUES (200, 901, 101, 50, NOW(), NOW(), 0, '197.45.x.x')
RETURNING id;  -- 5000

-- كل 30 ثانية الفرونت يبعت heartbeat ويُحدّث:
UPDATE video_views
   SET watched_seconds = watched_seconds + 30,
       last_watched_at = NOW(),
       completed = (watched_seconds + 30) >= (
         SELECT FLOOR(duration_sec * 0.9) FROM videos WHERE id = 901
       )
 WHERE id = 5000;
```

### المشهد 16: المدرس يسأل "شاف الفيديو كام مرة؟"

```sql
SELECT views_count, total_watched_seconds, ever_completed, last_viewed_at
FROM v_video_view_counts
WHERE student_id = 200 AND video_id = 901;
-- 1 | 1620 | TRUE | 2025-09-03 19:24:00+02
```

### المشهد 17: حضور تلقائي للحصة (≥ 80% من فيديوهاتها)

```sql
SELECT lesson_id, completion_ratio, auto_attended
FROM v_lesson_watch_progress
WHERE student_id = 200 AND lesson_id = 101;
-- 101 | 1.00 | TRUE  ✓ يحتسب حاضراً تلقائياً
```

### المشهد 18: حماية ضد مشاركة الحساب

```sql
-- أكتر من IP مختلف لنفس الطالب في 10 دقايق؟ علامة تحذير.
SELECT student_id, COUNT(DISTINCT ip_address) AS unique_ips
FROM video_views
WHERE student_id = 200 AND started_at > NOW() - INTERVAL '10 minutes'
GROUP BY student_id
HAVING COUNT(DISTINCT ip_address) > 1;
```

---

## الفصل الخامس — الامتحان

### المشهد 19: المدرس ينشئ امتحان (اختيار عشوائي من البنك)

```sql
-- الامتحان نفسه
INSERT INTO exams (
  lesson_id, title, starts_at, ends_at, duration_min,
  visibility, selection_mode
) VALUES (
  101, 'كويز الحصة 1', '2025-09-10 18:00+02', '2025-09-10 22:00+02',
  30, 'visible', 'random'
) RETURNING id;  -- 400

-- قاعدة الاختيار: 5 أسئلة MCQ + 1 مقالي من بنك المتجهات
INSERT INTO exam_random_rules (exam_id, bank_id, count_value, question_type) VALUES
  (400, 70, 5, 'mcq'),
  (400, 70, 1, 'essay');
```

### المشهد 20: الطالب يبدأ الامتحان

```sql
-- التطبيق يسحب الأسئلة عشوائياً ويخزّنها في snapshot
INSERT INTO exam_attempts (exam_id, student_id, status, snapshot)
VALUES (400, 200, 'in_progress',
  '[{"qid":1001},{"qid":1002},{"qid":1003},{"qid":1004},{"qid":1005},{"qid":1010}]'::jsonb)
RETURNING id;  -- 7000
```

### المشهد 21: الطالب يجاوب ويسلّم

```sql
-- إجابات MCQ
INSERT INTO exam_answers (attempt_id, question_id, choice_id) VALUES
  (7000, 1001, 5001),  -- اختار خيار صحيح
  (7000, 1002, 5008),  -- خيار خطأ
  (7000, 1003, 5012),
  (7000, 1004, 5017),
  (7000, 1005, 5021);

-- إجابة مقالي
INSERT INTO exam_answers (attempt_id, question_id, answer_text)
VALUES (7000, 1010, 'لجمع متجهين بطريقة المثلث: نرسم الأول ثم نرسم الثاني...');

-- التطبيق يصحّح MCQ تلقائياً
UPDATE exam_answers ans
   SET is_correct    = qc.is_correct,
       score_awarded = CASE WHEN qc.is_correct THEN q.score ELSE 0 END,
       graded_at     = NOW()
  FROM question_choices qc
  JOIN questions q ON q.id = qc.question_id
 WHERE ans.choice_id = qc.id AND ans.attempt_id = 7000;

-- المقالي لسه: is_correct = NULL, graded_at = NULL
-- نرفع حالة المحاولة
UPDATE exam_attempts SET status = 'under_review', submitted_at = NOW()
WHERE id = 7000;
```

### المشهد 22: المدرس يفتح "المقالي عندي للتصحيح"

```sql
SELECT answer_id, student_name, question_text, answer_text, submitted_at
FROM v_essay_pending_grading
WHERE teacher_id = 2
ORDER BY submitted_at;
```

### المشهد 23: المدرس يصحّح المقالي ويترك ملاحظة شخصية

```sql
UPDATE exam_answers
   SET score_awarded = 4.0,
       feedback      = 'إجابة جيدة لكن نسيت ذكر مبدأ المثلث في الحالة الخاصة.',
       graded_by     = 2,
       graded_at     = NOW()
 WHERE id = :essay_answer_id;

-- آخر إجابة مقالي تم تصحيحها → نرفع حالة المحاولة
UPDATE exam_attempts ea
   SET status = 'graded',
       score  = (SELECT COALESCE(SUM(score_awarded),0)
                 FROM exam_answers WHERE attempt_id = ea.id)
 WHERE ea.id = 7000
   AND NOT EXISTS (
     SELECT 1 FROM exam_answers
     WHERE attempt_id = ea.id AND graded_at IS NULL
   );
```

### المشهد 24: الطالب يفتح "نتيجة الامتحان والمراجعة"

```sql
-- درجته الإجمالية
SELECT score, max_score, percent FROM v_exam_results
WHERE student_id = 200 AND exam_id = 400;
-- 7.00 | 10.00 | 70.00

-- مراجعة كل سؤال + الشرح + ملاحظة المدرس
SELECT question_text, student_choice_text, correct_choice_text,
       is_correct, score_awarded,
       general_explanation, teacher_feedback
FROM v_student_answer_review
WHERE attempt_id = 7000
ORDER BY question_id;
```

> **سياسة عرض:** الواجهة تخفي `correct_choice_text` و `general_explanation` لو `graded_at IS NULL` أو الامتحان لسه شغّال — منعاً لتسريب الإجابات.

---

## الفصل السادس — الحضور وتبليغ ولي الأمر

### المشهد 25: المدرس يأخذ الحضور يدوياً للحصة Live

```sql
INSERT INTO attendance (lesson_id, student_id, status, marked_by) VALUES
  (101, 200, 'present', 2),
  (101, 201, 'absent',  2),
  (101, 202, 'late',    2)
ON CONFLICT (lesson_id, student_id)
DO UPDATE SET status = EXCLUDED.status, marked_at = NOW();
```

### المشهد 26: تبليغ ولي أمر الطالب الغايب

```sql
-- نسحب رقم ولي الأمر
SELECT parent_phone FROM students WHERE id = 201;
-- 01122223333

-- نسجّل الرسالة
INSERT INTO messages (
  sender_user_id, recipient_student_id, audience, channel, body
) VALUES (
  2, 201, 'parent', 'whatsapp',
  'ابنتك سلمى تغيّبت عن حصة "المتجهات" يوم الثلاثاء.'
);
-- لما الـ Gateway يأكّد التسليم نُحدّث delivered_at
```

### المشهد 27: تقرير امتحان لولي الأمر

```sql
INSERT INTO messages (
  sender_user_id, recipient_student_id, audience, channel,
  related_exam_id, subject, body
) VALUES (
  2, 200, 'parent', 'sms', 400,
  'نتيجة كويز الفيزياء',
  'حصل ابنك يوسف على 7/10 في كويز "الحصة 1: المتجهات".'
);
```

---

## الفصل السابع — الرقابة والتقارير

### المشهد 28: لوحة المدرس الرئيسية (4 أرقام)

```sql
SELECT courses_count, banks_count, students_count, secretaries_count
FROM v_teacher_dashboard_counts WHERE teacher_id = 2;
-- 1 | 1 | 2 | 1
```

### المشهد 29: ملخّص مالي لكورس

```sql
SELECT title, active_students, collected, expected, outstanding
FROM v_course_enrollment_stats WHERE course_id = 50;
-- الفيزياء... | 2 | 3400.00 | 4800.00 | 1400.00
```

### المشهد 30: استرداد دفعة بالغلط (reversal)

```sql
-- المدرس قرر يسترجع 500 جنيه لطالب
INSERT INTO payments (enrollment_id, amount, method, recorded_by, note)
VALUES (301, -500.00, 'cash', 2, 'استرداد دفعة بالغلط');
-- enrollments.paid_total تنزل تلقائياً
```

> **مبدأ:** `payments` **append-only** — ما بنحذفش دفعة، نضيف عكسها.

### المشهد 31: سجلّ كامل لمحفظة الطالب

```sql
SELECT created_at, type, amount, balance_after, note, performed_by
FROM wallet_transactions
WHERE student_id = 200
ORDER BY created_at DESC;
```

النتيجة:

| created_at | type | amount | balance_after | note |
|---|---|---|---|---|
| 2025-09-01 11:15 | topup | +3000.00 | 3000.00 | شحن من ولي الأمر |
| 2025-09-01 11:20 | purchase | −2400.00 | 600.00 | شراء كورس الفيزياء |

---

## ملخّص الرحلة (One-page recap)

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. أدمن  → users(role=admin)                                         │
│  2. مدرس → users(role=teacher)                                        │
│  3. سكرتارية → users(role=secretary, manager_teacher_id=teacher.id)   │
│              + user_permissions (مفاتيح محدّدة)                        │
│  4. كورس → courses → lessons → (videos | files | exams)               │
│  5. بنوك → question_banks → questions → question_choices              │
│  6. طالب → students                                                   │
│      └─ wallet_transactions(topup) → balance↑                         │
│      └─ enrollments + payments(method=wallet) + tx(purchase)          │
│  7. مشاهدة → video_views (heartbeat كل 30 ثانية)                       │
│      └─ v_lesson_watch_progress (حضور تلقائي ≥ 80%)                    │
│  8. امتحان:                                                           │
│      exam_attempts(in_progress)                                       │
│        → exam_answers (MCQ تلقائي + essay يدوي)                        │
│        → exam_attempts(under_review)                                  │
│        → exam_attempts(graded)                                        │
│  9. مراجعة الطالب: v_student_answer_review                             │
│      (السؤال + الإجابة + الصحيح + الشرح العام + ملاحظة المدرس)          │
│ 10. حضور يدوي: attendance + messages (تبليغ ولي الأمر)                  │
│ 11. تقارير:                                                            │
│      v_course_enrollment_stats, v_enrollment_audit,                   │
│      v_essay_pending_grading, v_attempt_grading_status,               │
│      v_student_wallet, v_teacher_dashboard_counts                     │
│ 12. كل حركة مكتوب فيها مين عملها (created_by/recorded_by/             │
│      graded_by/marked_by/granted_by/performed_by/sender_user_id)      │
└──────────────────────────────────────────────────────────────────────┘
```

## خريطة الـ Triggers

| Trigger | على | يعمل ماذا |
| --- | --- | --- |
| `set_updated_at()` | كل جدول له `updated_at` | يحدّث الـ timestamp قبل الحفظ |
| `sync_enrollment_paid_total()` | بعد INSERT/UPDATE/DELETE على `payments` | يجمع كل الدفعات ويُحدّث `enrollments.paid_total` |
| `sync_student_balance()` | قبل INSERT على `wallet_transactions` | يُحدّث `students.balance` ويرفض حركة لو الرصيد سيبقى سالب |

## القواعد الذهبية المستخلصة

1. **معلومة مُستنتَجة → VIEW** (مثل `teacher_students`).
2. **سجل تاريخي → append-only** (`payments`, `wallet_transactions`, `activity_logs`).
3. **مين فعل → عمود تتبّع صريح** (`*_by`) على كل جدول حركة.
4. **حذف آمن → soft delete** (`deleted_at`) للكيانات الرئيسية، CASCADE للأبناء.
5. **مال → `NUMERIC(12,2)` دائماً**، لا `FLOAT`.
6. **حالة معقّدة → enum + CHECK constraint** (`attempt_status`, `wallet_tx_type`).
7. **استعلام متكرّر → VIEW + فهارس** على أعمدة الفلترة.
