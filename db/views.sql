-- =====================================================================
-- LMS — Derived VIEWS
-- Run AFTER schema.sql
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- teacher_students (⭐) — كل مدرس وطلابه المشتركين في كورس واحد على الأقل
-- هذا VIEW بدلاً من جدول لتجنّب مشاكل المزامنة.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW teacher_students AS
SELECT
  c.teacher_id,
  e.student_id,
  MIN(e.enrolled_at)                         AS first_enrolled_at,
  COUNT(*) FILTER (WHERE e.is_active)        AS active_courses,
  COUNT(*)                                   AS total_courses,
  SUM(e.paid_total)                          AS paid_total,
  SUM(e.total_due)                           AS total_due
FROM enrollments e
JOIN courses c ON c.id = e.course_id
GROUP BY c.teacher_id, e.student_id;

COMMENT ON VIEW teacher_students IS
  'مستنتج: مدرس ↔ طالب إذا كان الطالب مسجّلاً في كورس واحد على الأقل مع هذا المدرس.';


-- ---------------------------------------------------------------------
-- v_course_enrollment_stats — عدد الطلاب، المدفوع، المتبقي لكل كورس
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_course_enrollment_stats AS
SELECT
  c.id                                                    AS course_id,
  c.teacher_id,
  c.title,
  COUNT(e.id) FILTER (WHERE e.is_active)                  AS active_students,
  COUNT(e.id)                                             AS total_enrollments,
  COALESCE(SUM(e.paid_total), 0)                          AS collected,
  COALESCE(SUM(e.total_due),  0)                          AS expected,
  COALESCE(SUM(e.total_due - e.paid_total), 0)            AS outstanding
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id;


-- ---------------------------------------------------------------------
-- v_video_view_counts — عدد المشاهدات ومدّتها لكل (طالب، فيديو)
-- يعطي المدرس إجابة مباشرة: هل الطالب شاف الفيديو؟ كام مرة؟
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_video_view_counts AS
SELECT
  vv.student_id,
  vv.video_id,
  vv.lesson_id,
  vv.course_id,
  COUNT(*)                             AS views_count,
  MIN(vv.started_at)                   AS first_viewed_at,
  MAX(vv.last_watched_at)              AS last_viewed_at,
  SUM(vv.watched_seconds)              AS total_watched_seconds,
  BOOL_OR(vv.completed)                AS ever_completed
FROM video_views vv
GROUP BY vv.student_id, vv.video_id, vv.lesson_id, vv.course_id;


-- ---------------------------------------------------------------------
-- v_lesson_watch_progress — تقدّم الطالب في الحصة (حضور تلقائي)
-- completion_ratio = كم فيديو من فيديوهات الحصة أكمله الطالب ÷ الكل
-- auto_attended     = اعتبره حاضراً إذا completion_ratio >= 0.8
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_lesson_watch_progress AS
WITH lesson_videos AS (
  SELECT lesson_id, COUNT(*)::NUMERIC AS total_videos
  FROM videos
  GROUP BY lesson_id
),
student_completed AS (
  SELECT
    vv.student_id,
    vv.lesson_id,
    COUNT(DISTINCT vv.video_id) FILTER (WHERE vv.completed) AS completed_videos
  FROM video_views vv
  GROUP BY vv.student_id, vv.lesson_id
)
SELECT
  sc.student_id,
  sc.lesson_id,
  lv.total_videos,
  sc.completed_videos,
  CASE WHEN lv.total_videos > 0
       THEN ROUND(sc.completed_videos / lv.total_videos, 2)
       ELSE 0 END                                  AS completion_ratio,
  (lv.total_videos > 0 AND
   sc.completed_videos / lv.total_videos >= 0.8)   AS auto_attended
FROM student_completed sc
JOIN lesson_videos lv ON lv.lesson_id = sc.lesson_id;


-- ---------------------------------------------------------------------
-- v_student_courses — الكورسات النشطة لكل طالب مع المدفوع والمتبقي
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_student_courses AS
SELECT
  e.student_id,
  e.course_id,
  c.teacher_id,
  c.title,
  c.image_url,
  c.grade_id,
  e.enrolled_at,
  e.is_active,
  e.total_due,
  e.paid_total,
  (e.total_due - e.paid_total) AS remaining
FROM enrollments e
JOIN courses c ON c.id = e.course_id;


-- ---------------------------------------------------------------------
-- v_exam_results — ملخّص نتائج كل محاولة امتحان
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_exam_results AS
SELECT
  ea.id                       AS attempt_id,
  ea.exam_id,
  e.title                     AS exam_title,
  e.lesson_id,
  l.course_id,
  ea.student_id,
  s.name                      AS student_name,
  s.code                      AS student_code,
  ea.status,
  ea.started_at,
  ea.submitted_at,
  ea.score,
  e.total_score               AS max_score,
  CASE WHEN e.total_score > 0
       THEN ROUND((ea.score / e.total_score) * 100, 2)
       ELSE NULL END          AS percent
FROM exam_attempts ea
JOIN exams     e ON e.id = ea.exam_id
JOIN lessons   l ON l.id = e.lesson_id
JOIN students  s ON s.id = ea.student_id;


-- ---------------------------------------------------------------------
-- v_essay_pending_grading — إجابات المقالي اللي تنتظر تصحيح المدرس
-- يستخدمه المدرس لمعرفة "كم مقالي عليّ تصحيحه؟"
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_essay_pending_grading AS
SELECT
  ans.id              AS answer_id,
  ans.attempt_id,
  ea.exam_id,
  e.title             AS exam_title,
  e.lesson_id,
  l.course_id,
  c.teacher_id,
  ea.student_id,
  s.name              AS student_name,
  s.code              AS student_code,
  ans.question_id,
  q.text              AS question_text,
  ans.answer_text,
  ea.submitted_at
FROM exam_answers ans
JOIN exam_attempts ea ON ea.id = ans.attempt_id
JOIN exams         e  ON e.id  = ea.exam_id
JOIN lessons       l  ON l.id  = e.lesson_id
JOIN courses       c  ON c.id  = l.course_id
JOIN students      s  ON s.id  = ea.student_id
JOIN questions     q  ON q.id  = ans.question_id
WHERE q.type = 'essay'
  AND ans.graded_at IS NULL
  AND ea.status IN ('submitted', 'under_review');

COMMENT ON VIEW v_essay_pending_grading IS
  'كل إجابات المقالي اللي ما اتصححتش بعد، مع اسم الطالب والمدرس.';


-- ---------------------------------------------------------------------
-- v_attempt_grading_status — حالة التصحيح لكل محاولة
-- يبيّن: هل اتصححت كاملة؟ ولا فيها مقالي قيد التصحيح؟
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_attempt_grading_status AS
SELECT
  ea.id                                         AS attempt_id,
  ea.exam_id,
  ea.student_id,
  ea.status,
  COUNT(*) FILTER (WHERE q.type = 'essay')      AS essay_count,
  COUNT(*) FILTER (WHERE q.type = 'essay'
                    AND ans.graded_at IS NULL)  AS essay_pending,
  COUNT(*) FILTER (WHERE q.type = 'essay'
                    AND ans.graded_at IS NOT NULL) AS essay_graded,
  CASE
    WHEN ea.status = 'in_progress'                                THEN 'لم يُسلَّم'
    WHEN COUNT(*) FILTER (WHERE q.type='essay' AND ans.graded_at IS NULL) > 0
                                                                  THEN 'قيد التصحيح'
    ELSE                                                               'مُصحَّح'
  END                                           AS status_label
FROM exam_attempts ea
LEFT JOIN exam_answers ans ON ans.attempt_id = ea.id
LEFT JOIN questions    q   ON q.id = ans.question_id
GROUP BY ea.id;


-- ---------------------------------------------------------------------
-- v_student_wallet — ملخّص محفظة الطالب
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_student_wallet AS
SELECT
  s.id                                              AS student_id,
  s.code,
  s.name,
  s.balance                                         AS current_balance,
  COALESCE(SUM(wt.amount) FILTER (WHERE wt.type = 'topup'),       0) AS total_topups,
  COALESCE(SUM(-wt.amount) FILTER (WHERE wt.type = 'purchase'),   0) AS total_spent,
  COALESCE(SUM(wt.amount) FILTER (WHERE wt.type = 'refund'),      0) AS total_refunded,
  COUNT(*) FILTER (WHERE wt.type = 'purchase')                       AS purchases_count,
  MAX(wt.created_at)                                                  AS last_activity_at
FROM students s
LEFT JOIN wallet_transactions wt ON wt.student_id = s.id
GROUP BY s.id;


-- ---------------------------------------------------------------------
-- v_enrollment_audit — مين أضاف الطالب للكورس ومين سجّل المدفوعات
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_enrollment_audit AS
SELECT
  e.id                       AS enrollment_id,
  e.student_id,
  s.name                     AS student_name,
  e.course_id,
  c.title                    AS course_title,
  e.enrolled_at,
  e.is_active,
  e.total_due,
  e.paid_total,
  e.created_by               AS enrolled_by_user_id,
  enroller.name              AS enrolled_by_name,
  enroller.role              AS enrolled_by_role,
  (SELECT COUNT(*) FROM payments p WHERE p.enrollment_id = e.id) AS payments_count,
  (SELECT MAX(p.created_at)  FROM payments p WHERE p.enrollment_id = e.id) AS last_payment_at
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN courses  c ON c.id = e.course_id
LEFT JOIN users enroller ON enroller.id = e.created_by;


-- ---------------------------------------------------------------------
-- v_student_answer_review — مراجعة الطالب لامتحانه بعد التصحيح
-- يجمع: نص السؤال + إجابة الطالب + الإجابة الصحيحة (للـ MCQ/TF)
--       + تعليق المدرس العام (questions.explanation)
--       + تعليق المدرس الشخصي (exam_answers.feedback)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_student_answer_review AS
SELECT
  ans.id                          AS answer_id,
  ea.id                           AS attempt_id,
  ea.exam_id,
  ea.student_id,
  q.id                            AS question_id,
  q.type                          AS question_type,
  q.text                          AS question_text,
  q.score                         AS question_max_score,
  -- إجابة الطالب
  ans.choice_id                   AS student_choice_id,
  sc.text                         AS student_choice_text,
  ans.answer_text                 AS student_answer_text,
  -- الإجابة الصحيحة (MCQ / True-False فقط)
  cc.id                           AS correct_choice_id,
  cc.text                         AS correct_choice_text,
  -- التصحيح
  ans.is_correct,
  ans.score_awarded,
  ans.graded_at,
  ans.graded_by,
  -- التعليقات
  q.explanation                   AS general_explanation,  -- يظهر لكل الطلاب
  ans.feedback                    AS teacher_feedback      -- يظهر لهذا الطالب فقط
FROM exam_answers ans
JOIN exam_attempts ea ON ea.id = ans.attempt_id
JOIN questions     q  ON q.id  = ans.question_id
LEFT JOIN question_choices sc ON sc.id = ans.choice_id
LEFT JOIN LATERAL (
  SELECT id, text FROM question_choices
   WHERE question_id = q.id AND is_correct = TRUE
   ORDER BY order_index LIMIT 1
) cc ON TRUE;

COMMENT ON VIEW v_student_answer_review IS
  'الطالب يستعمله ليرى لكل سؤال: إجابته، الإجابة الصحيحة، الشرح العام، وتعليق المدرس عليه.';


-- ---------------------------------------------------------------------
-- v_teacher_dashboard_counts — إحصائيات اللوحة الرئيسية للمدرس
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_teacher_dashboard_counts AS
SELECT
  u.id AS teacher_id,
  (SELECT COUNT(*) FROM courses        c WHERE c.teacher_id = u.id AND c.deleted_at IS NULL) AS courses_count,
  (SELECT COUNT(*) FROM question_banks b WHERE b.teacher_id = u.id AND b.deleted_at IS NULL) AS banks_count,
  (SELECT COUNT(DISTINCT ts.student_id) FROM teacher_students ts WHERE ts.teacher_id = u.id) AS students_count,
  (SELECT COUNT(*) FROM users s WHERE s.manager_teacher_id = u.id AND s.role = 'secretary' AND s.is_active) AS secretaries_count
FROM users u
WHERE u.role = 'teacher';

COMMIT;
