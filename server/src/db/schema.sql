-- InterviewPilot-AI PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  target_role     VARCHAR(120),
  experience_level VARCHAR(40),
  role            VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INTERVIEWS
CREATE TABLE IF NOT EXISTS interviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               VARCHAR(200) NOT NULL,
  role                VARCHAR(120) NOT NULL,
  experience_level    VARCHAR(40) NOT NULL,
  interview_type      VARCHAR(40) NOT NULL,
  difficulty          VARCHAR(20) NOT NULL,
  topics              TEXT[] NOT NULL DEFAULT '{}',
  custom_instructions TEXT,
  question_count      INT NOT NULL DEFAULT 10,
  status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  current_sequence    INT NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id  UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  type          VARCHAR(40) NOT NULL DEFAULT 'MAIN',
  topic         VARCHAR(120),
  difficulty    VARCHAR(20),
  sequence      INT NOT NULL,
  parent_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_interview_id ON questions(interview_id);

-- ANSWERS
CREATE TABLE IF NOT EXISTS answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  interview_id  UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer        TEXT NOT NULL,
  score         NUMERIC(5,2),
  feedback      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  evaluated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_answers_interview_id ON answers(interview_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_answers_question_id ON answers(question_id);

-- REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id        UUID UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_score       NUMERIC(5,2) NOT NULL,
  technical_score     NUMERIC(5,2),
  communication_score NUMERIC(5,2),
  problem_solving_score NUMERIC(5,2),
  relevance_score     NUMERIC(5,2),
  depth_score         NUMERIC(5,2),
  summary             TEXT,
  strengths           TEXT[] DEFAULT '{}',
  weaknesses          TEXT[] DEFAULT '{}',
  recommendations     TEXT[] DEFAULT '{}',
  weak_topics         TEXT[] DEFAULT '{}',
  strong_topics       TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
