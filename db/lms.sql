-- =====================================================================
-- LMS — قاعدة البيانات الكاملة (ملف واحد)
-- =====================================================================
-- Target  : PostgreSQL 15+
-- Encoding: UTF-8
-- Order   : ENUMS → FUNCTIONS → TABLES → INDEXES → TRIGGERS → VIEWS → SEED
--
-- التشغيل:
--   createdb lms_dev
--   psql -d lms_dev -f db/lms.sql
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1) ENUMS
-- =====================================================================
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


-- =====================================================================
-- 2) HELPER FUNCTIONS
-- =====================================================================

-- يحدّث updated_at تلقائياً قبل أيّ UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================
-- 3) LOOKUPS (المحافظات والصفوف)
-- =====================================================================
CREATE TABLE governorates (
  id      SMALLSERIAL PRIMARY KEY,
  name    VARCHAR(60) NOT NULL UNIQUE,
  name_en VARCHAR(60)
);

CREATE TABLE grades (
  id          SMALLSERIAL PRIMARY KEY,
  name        VARCHAR(60) NOT NULL UNIQUE,
  order_index SMALLINT NOT NULL DEFAULT 0
);


-- =====================================================================
-- 4) IDENTITY & ACCESS
-- =====================================================================

-- الطاقم: admin / teacher / secretary
CREATE TABLE users (
  id                  BIGSERIAL PRIMARY KEY,
  role                user_role NOT NULL,
  username            VARCHAR(60) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  name                VARCHAR(120) NOT NULL,
  email               VARCHAR(160) UNIQUE,
  phone               VARCHAR(20),
  avatar_url          TEXT,
  manager_teacher_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  CONSTRAINT chk_users_manager CHECK (
    (role = 'secretary' AND manager_teacher_id IS NOT NULL) OR
    (role <> 'secretary' AND manager_teacher_id IS NULL)
  )
);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_manager ON users(manager_teacher_id);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- صلاحيات السكرتارية (مفاتيح زي 'students.add', 'payments.record', ...)
CREATE TABLE user_permissions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key  VARCHAR(80) NOT NULL,
  granted_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission_key)
);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

-- الطلاب (دخول بكود + كلمة سر)
CREATE TABLE students (
  id              BIGSERIAL PRIMARY KEY,
  code            VARCHAR(20) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(20),
  parent_phone    VARCHAR(20),
  grade_id        SMALLINT REFERENCES grades(id) ON DELETE SET NULL,
  governorate_id  SMALLINT REFERENCES governorates(id) ON DELETE SET NULL,
  birth_date      DATE,
  avatar_url      TEXT,
  balance         NUMERIC(12,2) NOT NULL DEFAULT 0,  -- رصيد المحفظة
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_students_grade       ON students(grade_id);
CREATE INDEX idx_students_governorate ON students(governorate_id);
CREATE INDEX idx_students_name        ON students(name);
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- توكنات الـ JWT (للـ users أو الـ students)
CREATE TABLE refresh_tokens (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  student_id  BIGINT REFERENCES students(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  user_agent  TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_refresh_subject CHECK (user_id IS NOT NULL OR student_id IS NOT NULL)
);
CREATE INDEX idx_refresh_user    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_student ON refresh_tokens(student_id);


-- =====================================================================
-- 5) ACADEMIC CONTENT (كورسات/حصص/فيديوهات/ملفات)
-- =====================================================================
CREATE TABLE courses (
  id                BIGSERIAL PRIMARY KEY,
  teacher_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title             VARCHAR(200) NOT NULL,
  description       TEXT,
  grade_id          SMALLINT REFERENCES grades(id) ON DELETE SET NULL,
  image_url         TEXT,
  price_total       NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_lesson  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_lessons     INTEGER NOT NULL DEFAULT 0,
  start_date        DATE,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);
CREATE INDEX idx_courses_teacher ON courses(teacher_id, is_published);
CREATE INDEX idx_courses_grade   ON courses(grade_id);
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE lessons (
  id            BIGSERIAL PRIMARY KEY,
  course_id     BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  scheduled_at  TIMESTAMPTZ,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lessons_course ON lessons(course_id, order_index);
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE videos (
  id            BIGSERIAL PRIMARY KEY,
  lesson_id     BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  server        video_server NOT NULL,
  url           TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_sec  INTEGER,
  max_views     INTEGER,                  -- NULL = غير محدود
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_videos_lesson ON videos(lesson_id, order_index);
CREATE TRIGGER trg_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE files (
  id         BIGSERIAL PRIMARY KEY,
  lesson_id  BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  url        TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type  VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_files_lesson ON files(lesson_id);


-- =====================================================================
-- 6) QUESTION BANKS
-- =====================================================================
CREATE TABLE question_banks (
  id          BIGSERIAL PRIMARY KEY,
  teacher_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  grade_id    SMALLINT REFERENCES grades(id) ON DELETE SET NULL,  -- NULL = كل الصفوف
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_banks_teacher ON question_banks(teacher_id);
CREATE TRIGGER trg_banks_updated_at BEFORE UPDATE ON question_banks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE questions (
  id          BIGSERIAL PRIMARY KEY,
  bank_id     BIGINT NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
  type        question_type NOT NULL,
  text        TEXT NOT NULL,
  explanation TEXT,                        -- التعليق العام / نموذج الإجابة
  score       NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_questions_bank_type ON questions(bank_id, type);
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE question_choices (
  id           BIGSERIAL PRIMARY KEY,
  question_id  BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_choices_question ON question_choices(question_id);


-- =====================================================================
-- 7) EXAMS
-- =====================================================================
CREATE TABLE exams (
  id              BIGSERIAL PRIMARY KEY,
  lesson_id       BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  duration_min    SMALLINT NOT NULL,
  visibility      exam_visibility NOT NULL DEFAULT 'visible',
  selection_mode  exam_select_mode NOT NULL DEFAULT 'manual',
  total_score     NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_exam_window   CHECK (ends_at > starts_at),
  CONSTRAINT chk_exam_duration CHECK (duration_min BETWEEN 5 AND 300)
);
CREATE INDEX idx_exams_lesson ON exams(lesson_id);
CREATE TRIGGER trg_exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ربط أسئلة البنك بالامتحان (manual mode)
CREATE TABLE exam_questions (
  id              BIGSERIAL PRIMARY KEY,
  exam_id         BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id     BIGINT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  score_override  NUMERIC(5,2),
  UNIQUE (exam_id, question_id)
);
CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);

-- قواعد الاختيار العشوائي (random mode): X سؤال من كل بنك
CREATE TABLE exam_random_rules (
  id             BIGSERIAL PRIMARY KEY,
  exam_id        BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  bank_id        BIGINT NOT NULL REFERENCES question_banks(id) ON DELETE RESTRICT,
  count_value    SMALLINT NOT NULL CHECK (count_value > 0),
  question_type  question_type,
  UNIQUE (exam_id, bank_id, question_type)
);
CREATE INDEX idx_exam_random_rules_exam ON exam_random_rules(exam_id);

-- محاولات الطلاب
CREATE TABLE exam_attempts (
  id           BIGSERIAL PRIMARY KEY,
  exam_id      BIGINT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  student_id   BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score        NUMERIC(6,2),
  status       attempt_status NOT NULL DEFAULT 'in_progress',
  snapshot     JSONB,                      -- الأسئلة اللي ظهرت للطالب (للـ random)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_attempts_exam_student   ON exam_attempts(exam_id, student_id);
CREATE INDEX idx_attempts_student_status ON exam_attempts(student_id, status);
CREATE TRIGGER trg_attempts_updated_at BEFORE UPDATE ON exam_attempts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- إجابات الطالب (MCQ يُصحَّح تلقائياً، Essay يحتاج المدرس)
CREATE TABLE exam_answers (
  id             BIGSERIAL PRIMARY KEY,
  attempt_id     BIGINT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id    BIGINT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  choice_id      BIGINT REFERENCES question_choices(id) ON DELETE SET NULL,
  answer_text    TEXT,
  is_correct     BOOLEAN,                  -- NULL = لم يُصحَّح بعد (مقالي)
  score_awarded  NUMERIC(5,2),             -- NULL = لم يُصحَّح بعد
  graded_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  graded_at      TIMESTAMPTZ,              -- NULL = قيد التصحيح
  feedback       TEXT,                     -- ملاحظة المدرس على الإجابة (للطالب فقط)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_answers_attempt        ON exam_answers(attempt_id);
CREATE INDEX idx_answers_pending_review ON exam_answers(question_id) WHERE graded_at IS NULL;


-- =====================================================================
-- 8) ENROLLMENT & PAYMENT
-- =====================================================================
CREATE TABLE enrollments (
  id              BIGSERIAL PRIMARY KEY,
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  course_id       BIGINT NOT NULL REFERENCES courses(id)  ON DELETE RESTRICT,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unenrolled_at   TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  total_due       NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_total      NUMERIC(10,2) NOT NULL DEFAULT 0,  -- مُحدَّث تلقائياً عبر trigger
  created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- مين أضاف الطالب
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);
CREATE INDEX idx_enroll_student ON enrollments(student_id, is_active);
CREATE INDEX idx_enroll_course  ON enrollments(course_id, is_active);
CREATE TRIGGER trg_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- المدفوعات (append-only — لا حذف، التصحيح بدفعة سالبة)
CREATE TABLE payments (
  id             BIGSERIAL PRIMARY KEY,
  enrollment_id  BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT,
  amount         NUMERIC(10,2) NOT NULL,
  method         payment_method NOT NULL,
  reference      VARCHAR(120),
  note           TEXT,
  recorded_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- مين سجّل الدفعة
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_enrollment ON payments(enrollment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Trigger: يُحدّث enrollments.paid_total تلقائياً عند أيّ دفعة
CREATE OR REPLACE FUNCTION sync_enrollment_paid_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE enrollments
     SET paid_total = COALESCE((
       SELECT SUM(amount) FROM payments WHERE enrollment_id = NEW.enrollment_id
     ), 0),
     updated_at = NOW()
   WHERE id = NEW.enrollment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_sync_total
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION sync_enrollment_paid_total();


-- =====================================================================
-- 9) WALLET — رصيد الطالب وحركاته
-- =====================================================================
-- amount موجبة (شحن/استرداد) أو سالبة (شراء كورس)
-- reference_type/id يربط الحركة بالكيان المتعلق (مثال: enrollment)
CREATE TABLE wallet_transactions (
  id              BIGSERIAL PRIMARY KEY,
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  type            wallet_tx_type NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  balance_after   NUMERIC(12,2) NOT NULL,  -- snapshot للتدقيق (يُملأ تلقائياً)
  reference_type  VARCHAR(40),
  reference_id    BIGINT,
  method          payment_method,
  reference       VARCHAR(120),
  note            TEXT,
  performed_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_wallet_amount_sign CHECK (
    (type IN ('topup','refund')   AND amount > 0) OR
    (type =  'purchase'           AND amount < 0) OR
    (type =  'adjustment')
  )
);
CREATE INDEX idx_wallet_student   ON wallet_transactions(student_id, created_at DESC);
CREATE INDEX idx_wallet_reference ON wallet_transactions(reference_type, reference_id);

-- Trigger: يحدّث students.balance ويرفض حركة لو الرصيد سيبقى سالب
CREATE OR REPLACE FUNCTION sync_student_balance()
RETURNS TRIGGER AS $$
DECLARE
  new_balance NUMERIC(12,2);
BEGIN
  UPDATE students
     SET balance = balance + NEW.amount,
         updated_at = NOW()
   WHERE id = NEW.student_id
   RETURNING balance INTO new_balance;

  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient wallet balance for student %', NEW.student_id;
  END IF;

  NEW.balance_after := new_balance;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallet_sync_balance
BEFORE INSERT ON wallet_transactions
FOR EACH ROW EXECUTE FUNCTION sync_student_balance();


-- =====================================================================
-- 10) TRACKING (مشاهدة الفيديو والحضور)
-- =====================================================================
-- سجلّ المشاهدات (heartbeat كل ~30 ثانية من الفرونت)
CREATE TABLE video_views (
  id                BIGSERIAL PRIMARY KEY,
  student_id        BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  video_id          BIGINT NOT NULL REFERENCES videos(id)   ON DELETE CASCADE,
  lesson_id         BIGINT NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  course_id         BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_watched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  watched_seconds   INTEGER NOT NULL DEFAULT 0,
  completed         BOOLEAN NOT NULL DEFAULT FALSE,    -- ≥ 90% من الفيديو
  ip_address        INET,
  user_agent        TEXT
);
CREATE INDEX idx_views_student_video  ON video_views(student_id, video_id);
CREATE INDEX idx_views_video_student  ON video_views(video_id, student_id);
CREATE INDEX idx_views_lesson_student ON video_views(lesson_id, student_id);
CREATE INDEX idx_views_started_at     ON video_views(started_at);

-- الحضور اليدوي (offline / live)
CREATE TABLE attendance (
  id          BIGSERIAL PRIMARY KEY,
  lesson_id   BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status      attendance_state NOT NULL,
  note        TEXT,
  marked_by   BIGINT REFERENCES users(id) ON DELETE SET NULL,
  marked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, student_id)
);
CREATE INDEX idx_attendance_student ON attendance(student_id);


-- =====================================================================
-- 11) COMMUNICATION
-- =====================================================================
CREATE TABLE messages (
  id                    BIGSERIAL PRIMARY KEY,
  sender_user_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  recipient_student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  audience              message_audience NOT NULL,    -- student / parent
  channel               message_channel NOT NULL DEFAULT 'in_app',
  related_exam_id       BIGINT REFERENCES exams(id) ON DELETE SET NULL,
  subject               VARCHAR(200),
  body                  TEXT NOT NULL,
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at          TIMESTAMPTZ,
  read_at               TIMESTAMPTZ
);
CREATE INDEX idx_messages_recipient ON messages(recipient_student_id, sent_at DESC);
CREATE INDEX idx_messages_sender    ON messages(sender_user_id, sent_at DESC);

CREATE TABLE notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  student_id  BIGINT REFERENCES students(id) ON DELETE CASCADE,
  type        VARCHAR(60) NOT NULL,        -- 'exam.new', 'payment.received', ...
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  data        JSONB,                       -- IDs للـ deep-link
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_notification_subject CHECK (user_id IS NOT NULL OR student_id IS NOT NULL)
);
CREATE INDEX idx_notifications_user    ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_notifications_student ON notifications(student_id, read_at, created_at DESC);


-- =====================================================================
-- 12) AUDIT
-- =====================================================================
CREATE TABLE activity_logs (
  id                 BIGSERIAL PRIMARY KEY,
  actor_user_id      BIGINT REFERENCES users(id)    ON DELETE SET NULL,
  actor_student_id   BIGINT REFERENCES students(id) ON DELETE SET NULL,
  action             VARCHAR(80) NOT NULL,           -- 'course.create', 'student.unenroll', ...
  entity_type        VARCHAR(60),
  entity_id          BIGINT,
  metadata           JSONB,
  ip_address         INET,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_actor_user    ON activity_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_activity_actor_student ON activity_logs(actor_student_id, created_at DESC);
CREATE INDEX idx_activity_entity        ON activity_logs(entity_type, entity_id);


-- =====================================================================
-- 13) VIEWS (المشتقّة)
-- =====================================================================

-- ⭐ teacher_students — كل مدرس وطلابه (مستنتج من enrollments)
CREATE OR REPLACE VIEW teacher_students AS
SELECT
  c.teacher_id,
  e.student_id,
  MIN(e.enrolled_at)                  AS first_enrolled_at,
  COUNT(*) FILTER (WHERE e.is_active) AS active_courses,
  COUNT(*)                            AS total_courses,
  SUM(e.paid_total)                   AS paid_total,
  SUM(e.total_due)                    AS total_due
FROM enrollments e
JOIN courses c ON c.id = e.course_id
GROUP BY c.teacher_id, e.student_id;

COMMENT ON VIEW teacher_students IS
  'مستنتج: مدرس ↔ طالب إذا كان الطالب مسجّلاً في كورس واحد على الأقل مع هذا المدرس.';

-- إحصائيات الكورس (طلاب/مدفوع/متبقي)
CREATE OR REPLACE VIEW v_course_enrollment_stats AS
SELECT
  c.id                                          AS course_id,
  c.teacher_id,
  c.title,
  COUNT(e.id) FILTER (WHERE e.is_active)        AS active_students,
  COUNT(e.id)                                   AS total_enrollments,
  COALESCE(SUM(e.paid_total), 0)                AS collected,
  COALESCE(SUM(e.total_due),  0)                AS expected,
  COALESCE(SUM(e.total_due - e.paid_total), 0)  AS outstanding
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id;

-- عدد المشاهدات لكل (طالب، فيديو)
CREATE OR REPLACE VIEW v_video_view_counts AS
SELECT
  vv.student_id,
  vv.video_id,
  vv.lesson_id,
  vv.course_id,
  COUNT(*)                AS views_count,
  MIN(vv.started_at)      AS first_viewed_at,
  MAX(vv.last_watched_at) AS last_viewed_at,
  SUM(vv.watched_seconds) AS total_watched_seconds,
  BOOL_OR(vv.completed)   AS ever_completed
FROM video_views vv
GROUP BY vv.student_id, vv.video_id, vv.lesson_id, vv.course_id;

-- حضور تلقائي للحصة (≥ 80% من فيديوهاتها)
CREATE OR REPLACE VIEW v_lesson_watch_progress AS
WITH lesson_videos AS (
  SELECT lesson_id, COUNT(*)::NUMERIC AS total_videos
  FROM videos GROUP BY lesson_id
),
student_completed AS (
  SELECT vv.student_id, vv.lesson_id,
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
       ELSE 0 END                                AS completion_ratio,
  (lv.total_videos > 0 AND
   sc.completed_videos / lv.total_videos >= 0.8) AS auto_attended
FROM student_completed sc
JOIN lesson_videos lv ON lv.lesson_id = sc.lesson_id;

-- كورسات الطالب النشطة + بيانات الدفع
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

-- نتائج الامتحانات بالنسبة المئوية
CREATE OR REPLACE VIEW v_exam_results AS
SELECT
  ea.id            AS attempt_id,
  ea.exam_id,
  e.title          AS exam_title,
  e.lesson_id,
  l.course_id,
  ea.student_id,
  s.name           AS student_name,
  s.code           AS student_code,
  ea.status,
  ea.started_at,
  ea.submitted_at,
  ea.score,
  e.total_score    AS max_score,
  CASE WHEN e.total_score > 0
       THEN ROUND((ea.score / e.total_score) * 100, 2)
       ELSE NULL END AS percent
FROM exam_attempts ea
JOIN exams    e ON e.id = ea.exam_id
JOIN lessons  l ON l.id = e.lesson_id
JOIN students s ON s.id = ea.student_id;

-- ⭐ المقالي اللي معلّق على المدرس
CREATE OR REPLACE VIEW v_essay_pending_grading AS
SELECT
  ans.id      AS answer_id,
  ans.attempt_id,
  ea.exam_id,
  e.title     AS exam_title,
  e.lesson_id,
  l.course_id,
  c.teacher_id,
  ea.student_id,
  s.name      AS student_name,
  s.code      AS student_code,
  ans.question_id,
  q.text      AS question_text,
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

-- ⭐ حالة كل محاولة (مُصحَّح / قيد التصحيح / لم يُسلَّم)
CREATE OR REPLACE VIEW v_attempt_grading_status AS
SELECT
  ea.id   AS attempt_id,
  ea.exam_id,
  ea.student_id,
  ea.status,
  COUNT(*) FILTER (WHERE q.type = 'essay')                            AS essay_count,
  COUNT(*) FILTER (WHERE q.type = 'essay' AND ans.graded_at IS NULL)  AS essay_pending,
  COUNT(*) FILTER (WHERE q.type = 'essay' AND ans.graded_at IS NOT NULL) AS essay_graded,
  CASE
    WHEN ea.status = 'in_progress'                                THEN 'لم يُسلَّم'
    WHEN COUNT(*) FILTER (WHERE q.type='essay' AND ans.graded_at IS NULL) > 0
                                                                  THEN 'قيد التصحيح'
    ELSE                                                               'مُصحَّح'
  END AS status_label
FROM exam_attempts ea
LEFT JOIN exam_answers ans ON ans.attempt_id = ea.id
LEFT JOIN questions    q   ON q.id = ans.question_id
GROUP BY ea.id;

-- ⭐ محفظة الطالب (الرصيد الحالي + إجماليات)
CREATE OR REPLACE VIEW v_student_wallet AS
SELECT
  s.id                                                                AS student_id,
  s.code,
  s.name,
  s.balance                                                           AS current_balance,
  COALESCE(SUM(wt.amount)  FILTER (WHERE wt.type = 'topup'),     0)   AS total_topups,
  COALESCE(SUM(-wt.amount) FILTER (WHERE wt.type = 'purchase'),  0)   AS total_spent,
  COALESCE(SUM(wt.amount)  FILTER (WHERE wt.type = 'refund'),    0)   AS total_refunded,
  COUNT(*) FILTER (WHERE wt.type = 'purchase')                        AS purchases_count,
  MAX(wt.created_at)                                                  AS last_activity_at
FROM students s
LEFT JOIN wallet_transactions wt ON wt.student_id = s.id
GROUP BY s.id;

-- ⭐ مين سجّل الطالب في الكورس + عدد دفعاته
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

-- ⭐ صفحة "مراجعة الامتحان" للطالب (سؤال + إجابة + الصحيح + الشرح + ملاحظة المدرس)
CREATE OR REPLACE VIEW v_student_answer_review AS
SELECT
  ans.id           AS answer_id,
  ea.id            AS attempt_id,
  ea.exam_id,
  ea.student_id,
  q.id             AS question_id,
  q.type           AS question_type,
  q.text           AS question_text,
  q.score          AS question_max_score,
  -- إجابة الطالب
  ans.choice_id    AS student_choice_id,
  sc.text          AS student_choice_text,
  ans.answer_text  AS student_answer_text,
  -- الإجابة الصحيحة (MCQ / True-False)
  cc.id            AS correct_choice_id,
  cc.text          AS correct_choice_text,
  -- التصحيح
  ans.is_correct,
  ans.score_awarded,
  ans.graded_at,
  ans.graded_by,
  -- التعليقات
  q.explanation    AS general_explanation,  -- يظهر لكل من حلّ
  ans.feedback     AS teacher_feedback      -- يظهر لهذا الطالب فقط
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

-- إحصائيات لوحة المدرس
CREATE OR REPLACE VIEW v_teacher_dashboard_counts AS
SELECT
  u.id AS teacher_id,
  (SELECT COUNT(*) FROM courses        c WHERE c.teacher_id = u.id AND c.deleted_at IS NULL) AS courses_count,
  (SELECT COUNT(*) FROM question_banks b WHERE b.teacher_id = u.id AND b.deleted_at IS NULL) AS banks_count,
  (SELECT COUNT(DISTINCT ts.student_id) FROM teacher_students ts WHERE ts.teacher_id = u.id) AS students_count,
  (SELECT COUNT(*) FROM users s WHERE s.manager_teacher_id = u.id AND s.role = 'secretary' AND s.is_active) AS secretaries_count
FROM users u
WHERE u.role = 'teacher';


-- =====================================================================
-- 14) SEED — البيانات الثابتة (المحافظات والصفوف)
-- =====================================================================

-- 27 محافظة مصرية
INSERT INTO governorates (name, name_en) VALUES
  ('القاهرة',          'Cairo'),
  ('الجيزة',           'Giza'),
  ('الإسكندرية',       'Alexandria'),
  ('القليوبية',        'Qalyubia'),
  ('الشرقية',          'Sharqia'),
  ('الدقهلية',         'Dakahlia'),
  ('البحيرة',          'Beheira'),
  ('المنوفية',         'Monufia'),
  ('الغربية',          'Gharbia'),
  ('كفر الشيخ',        'Kafr El Sheikh'),
  ('دمياط',            'Damietta'),
  ('بورسعيد',          'Port Said'),
  ('الإسماعيلية',      'Ismailia'),
  ('السويس',           'Suez'),
  ('شمال سيناء',       'North Sinai'),
  ('جنوب سيناء',       'South Sinai'),
  ('الفيوم',           'Fayoum'),
  ('بني سويف',         'Beni Suef'),
  ('المنيا',           'Minya'),
  ('أسيوط',            'Asyut'),
  ('سوهاج',            'Sohag'),
  ('قنا',              'Qena'),
  ('الأقصر',           'Luxor'),
  ('أسوان',            'Aswan'),
  ('البحر الأحمر',     'Red Sea'),
  ('الوادي الجديد',    'New Valley'),
  ('مطروح',            'Matrouh')
ON CONFLICT (name) DO NOTHING;

-- الصفوف الدراسية
INSERT INTO grades (name, order_index) VALUES
  ('الصف الأول الإعدادي',  1),
  ('الصف الثاني الإعدادي', 2),
  ('الصف الثالث الإعدادي', 3),
  ('الصف الأول الثانوي',   4),
  ('الصف الثاني الثانوي',  5),
  ('الصف الثالث الثانوي',  6)
ON CONFLICT (name) DO NOTHING;


COMMIT;

-- =====================================================================
-- النهاية. للتحقّق:
--   SELECT COUNT(*) FROM governorates;   -- 27
--   SELECT COUNT(*) FROM grades;         -- 6
--   \dv                                  -- يعرض كل الـ views
-- =====================================================================
