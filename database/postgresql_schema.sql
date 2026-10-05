-- PostgreSQL Schema for Hackathon Problem Statement Allocation Platform

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT' CHECK(role IN ('PARTICIPANT', 'ADMIN')),
  phone VARCHAR(50),
  college VARCHAR(255),
  course VARCHAR(255),
  year VARCHAR(50),
  team_name VARCHAR(255),
  participant_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domains_code ON domains(code);

CREATE TABLE IF NOT EXISTS problem_statements (
  id SERIAL PRIMARY KEY,
  problem_code VARCHAR(50) UNIQUE NOT NULL,
  domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  detailed_requirements TEXT,
  expected_outcome TEXT,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ASSIGNED', 'DISABLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problems_code ON problem_statements(problem_code);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problem_statements(status);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON problem_statements(domain_id);

-- CRITICAL DATABASE-LEVEL CONSTRAINTS:
-- 1. UNIQUE(problem_statement_id): Exactly one participant can ever lock a problem statement
-- 2. UNIQUE(user_id): Exactly one problem statement can ever be locked to a participant account
CREATE TABLE IF NOT EXISTS problem_assignments (
  id SERIAL PRIMARY KEY,
  problem_statement_id INTEGER UNIQUE NOT NULL REFERENCES problem_statements(id) ON DELETE RESTRICT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'LOCKED' CHECK(status IN ('LOCKED', 'REVOKED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_problem ON problem_assignments(problem_statement_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_user ON problem_assignments(user_id);

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
