-- Database schema for Hackathon Problem Statement Allocation Platform

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  niat_id TEXT UNIQUE COLLATE NOCASE,
  auth_provider TEXT NOT NULL DEFAULT 'local',
  auth_provider_user_id TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT,
  profile_photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'PARTICIPANT' CHECK(role IN ('PARTICIPANT', 'ADMIN')),
  phone TEXT,
  college TEXT,
  course TEXT,
  year TEXT,
  team_name TEXT,
  participant_id TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domains_code ON domains(code);

-- Problem statements table
CREATE TABLE IF NOT EXISTS problem_statements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_code TEXT UNIQUE NOT NULL,
  domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_requirements TEXT,
  expected_outcome TEXT,
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ASSIGNED', 'DISABLED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problem_statements_code ON problem_statements(problem_code);
CREATE INDEX IF NOT EXISTS idx_problem_statements_domain ON problem_statements(domain_id);
CREATE INDEX IF NOT EXISTS idx_problem_statements_status ON problem_statements(status);

-- Problem assignments table
-- CRITICAL DATABASE-LEVEL CONSTRAINTS:
-- 1. UNIQUE(problem_statement_id): Exactly one participant can ever lock a problem statement
-- 2. UNIQUE(user_id): Exactly one problem statement can ever be locked to a participant account
CREATE TABLE IF NOT EXISTS problem_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_statement_id INTEGER UNIQUE NOT NULL REFERENCES problem_statements(id) ON DELETE RESTRICT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'LOCKED' CHECK(status IN ('LOCKED', 'REVOKED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_problem ON problem_assignments(problem_statement_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_user ON problem_assignments(user_id);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
