-- Auth hardening: account lockout + single-session enforcement
-- Run once against the lms database:
--   psql "$DATABASE_URL" -f backend/prisma/migrations/001_auth_hardening.sql

BEGIN;

-- USERS table (admin / teacher / secretary)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until       TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS token_version      INT NOT NULL DEFAULT 1;

-- STUDENTS table
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until       TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS token_version      INT NOT NULL DEFAULT 1;

-- Helpful partial indexes for the (rare) locked-account lookups
CREATE INDEX IF NOT EXISTS idx_users_locked_until
  ON users (locked_until) WHERE locked_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_locked_until
  ON students (locked_until) WHERE locked_until IS NOT NULL;

COMMIT;
