-- =====================================================================
-- LMS — PostgreSQL Schema (Source of Truth)
-- Target: PostgreSQL 15+
-- Encoding: UTF-8
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- LOOKUPS
-- ---------------------------------------------------------------------
CREATE TABLE governorates (
  id          SMALLSERIAL PRIMARY KEY,
  name        VARCHAR(60) NOT NULL UNIQUE,
  name_en     VARCHAR(60)
);

CREATE TABLE grades (
  id          SMALLSERIAL PRIMARY KEY,
  name        VARCHAR(60) NOT NULL UNIQUE,
  order_index SMALLINT NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- IDENTITY & ACCESS
-- ---------------------------------------------------------------------
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
CREATE INDEX idx_users_role                ON users(role);
CREATE INDEX idx_users_manager             ON users(manager_teacher_id);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE user_permissions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key  VARCHAR(80) NOT NULL,
  granted_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission_key)
);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

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
  balance         NUMERIC(12,2) NOT NULL DEFAULT 0,
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

-- ---------------------------------------------------------------------
-- ACADEMIC CONTENT
-- ---------------------------------------------------------------------
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
CREATE INDEX idx_courses_teacher   ON courses(teacher_id, is_published);
CREATE INDEX idx_courses_grade     ON courses(grade_id);
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
  max_views     INTEGER,
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

-- ---------------------------------------------------------------------
-- QUESTION BANKS
-- ---------------------------------------------------------------------
CREATE TABLE question_banks (
  id          BIGSERIAL PRIMARY KEY,
  teacher_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  grade_id    SMALLINT REFERENCES grades(id) ON DELETE SET NULL,
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
  explanation TEXT,
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

-- ---------------------------------------------------------------------
-- EXAMS
-- ---------------------------------------------------------------------
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

CREATE TABLE exam_questions (
  id              BIGSERIAL PRIMARY KEY,
  exam_id         BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id     BIGINT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  score_override  NUMERIC(5,2),
  UNIQUE (exam_id, question_id)
);
CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);

CREATE TABLE exam_random_rules (
  id             BIGSERIAL PRIMARY KEY,
  exam_id        BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  bank_id        BIGINT NOT NULL REFERENCES question_banks(id) ON DELETE RESTRICT,
  count_value    SMALLINT NOT NULL CHECK (count_value > 0),
  question_type  question_type,
  UNIQUE (exam_id, bank_id, question_type)
);
CREATE INDEX idx_exam_random_rules_exam ON exam_random_rules(exam_id);

CREATE TABLE exam_attempts (
  id           BIGSERIAL PRIMARY KEY,
  exam_id      BIGINT NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  student_id   BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score        NUMERIC(6,2),
  status       attempt_status NOT NULL DEFAULT 'in_progress',
  snapshot     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_attempts_exam_student ON exam_attempts(exam_id, student_id);
CREATE INDEX idx_attempts_student_status ON exam_attempts(student_id, status);
CREATE TRIGGER trg_attempts_updated_at BEFORE UPDATE ON exam_attempts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE exam_answers (
  id             BIGSERIAL PRIMARY KEY,
  attempt_id     BIGINT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id    BIGINT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  choice_id      BIGINT REFERENCES question_choices(id) ON DELETE SET NULL,
  answer_text    TEXT,
  is_correct     BOOLEAN,            -- NULL = not graded yet (essay)
  score_awarded  NUMERIC(5,2),       -- NULL = not graded yet (essay)
  graded_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  graded_at      TIMESTAMPTZ,        -- NULL while pending review
  feedback       TEXT,               -- ملاحظة المدرس على إجابة المقالي
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_answers_attempt        ON exam_answers(attempt_id);
CREATE INDEX idx_answers_pending_review ON exam_answers(question_id) WHERE graded_at IS NULL;

-- ---------------------------------------------------------------------
-- ENROLLMENT & PAYMENT
-- ---------------------------------------------------------------------
CREATE TABLE enrollments (
  id              BIGSERIAL PRIMARY KEY,
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  course_id       BIGINT NOT NULL REFERENCES courses(id)  ON DELETE RESTRICT,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unenrolled_at   TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  total_due       NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_total      NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);
CREATE INDEX idx_enroll_student ON enrollments(student_id, is_active);
CREATE INDEX idx_enroll_course  ON enrollments(course_id, is_active);
CREATE TRIGGER trg_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE payments (
  id             BIGSERIAL PRIMARY KEY,
  enrollment_id  BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT,
  amount         NUMERIC(10,2) NOT NULL,
  method         payment_method NOT NULL,
  reference      VARCHAR(120),
  note           TEXT,
  recorded_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_enrollment ON payments(enrollment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Auto-sync enrollments.paid_total whenever a payment is added.
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

-- ---------------------------------------------------------------------
-- WALLET — رصيد الطالب وحركاته
-- ---------------------------------------------------------------------
-- amount موجبة (شحن/استرداد) أو سالبة (شراء كورس).
-- reference_type/id يربط الحركة بالكيان المتعلق (مثال: enrollment).
CREATE TABLE wallet_transactions (
  id              BIGSERIAL PRIMARY KEY,
  student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  type            wallet_tx_type NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  balance_after   NUMERIC(12,2) NOT NULL,
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
CREATE INDEX idx_wallet_student      ON wallet_transactions(student_id, created_at DESC);
CREATE INDEX idx_wallet_reference    ON wallet_transactions(reference_type, reference_id);

-- Trigger: يحدّث students.balance ويملأ balance_after تلقائياً.
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

-- ---------------------------------------------------------------------
-- TRACKING
-- ---------------------------------------------------------------------
CREATE TABLE video_views (
  id                BIGSERIAL PRIMARY KEY,
  student_id        BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  video_id          BIGINT NOT NULL REFERENCES videos(id)   ON DELETE CASCADE,
  lesson_id         BIGINT NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
  course_id         BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_watched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  watched_seconds   INTEGER NOT NULL DEFAULT 0,
  completed         BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address        INET,
  user_agent        TEXT
);
CREATE INDEX idx_views_student_video  ON video_views(student_id, video_id);
CREATE INDEX idx_views_video_student  ON video_views(video_id, student_id);
CREATE INDEX idx_views_lesson_student ON video_views(lesson_id, student_id);
CREATE INDEX idx_views_started_at     ON video_views(started_at);

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

-- ---------------------------------------------------------------------
-- COMMUNICATION
-- ---------------------------------------------------------------------
CREATE TABLE messages (
  id                    BIGSERIAL PRIMARY KEY,
  sender_user_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,
  recipient_student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  audience              message_audience NOT NULL,
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
  type        VARCHAR(60) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  data        JSONB,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_notification_subject CHECK (user_id IS NOT NULL OR student_id IS NOT NULL)
);
CREATE INDEX idx_notifications_user    ON notifications(user_id, read_at, created_at DESC);
CREATE INDEX idx_notifications_student ON notifications(student_id, read_at, created_at DESC);

-- ---------------------------------------------------------------------
-- AUDIT
-- ---------------------------------------------------------------------
CREATE TABLE activity_logs (
  id                 BIGSERIAL PRIMARY KEY,
  actor_user_id      BIGINT REFERENCES users(id)    ON DELETE SET NULL,
  actor_student_id   BIGINT REFERENCES students(id) ON DELETE SET NULL,
  action             VARCHAR(80) NOT NULL,
  entity_type        VARCHAR(60),
  entity_id          BIGINT,
  metadata           JSONB,
  ip_address         INET,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_actor_user    ON activity_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_activity_actor_student ON activity_logs(actor_student_id, created_at DESC);
CREATE INDEX idx_activity_entity        ON activity_logs(entity_type, entity_id);

COMMIT;
