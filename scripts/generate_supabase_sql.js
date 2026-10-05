const fs = require('fs');
const path = require('path');
const { domains, problems } = require('../server/src/db/problemData');

function escapeSql(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

let sql = `-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA & OFFICIAL 160 PROBLEMS SEED
-- Hackathon Problem Statement Allocation Platform
-- Run this complete script in your Supabase SQL Editor
-- ====================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Domains Table
CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_domains_code ON domains(code);

-- 3. Problem Statements Table
CREATE TABLE IF NOT EXISTS problem_statements (
  id SERIAL PRIMARY KEY,
  problem_code VARCHAR(50) UNIQUE NOT NULL,
  domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  detailed_requirements TEXT,
  expected_outcome TEXT,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ASSIGNED', 'DISABLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_problems_code ON problem_statements(problem_code);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problem_statements(status);
CREATE INDEX IF NOT EXISTS idx_problems_domain ON problem_statements(domain_id);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  niat_id VARCHAR(100) UNIQUE,
  auth_provider VARCHAR(50) DEFAULT 'local',
  auth_provider_user_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  profile_photo_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'PARTICIPANT' CHECK(role IN ('PARTICIPANT', 'ADMIN')),
  phone VARCHAR(50),
  college VARCHAR(255),
  course VARCHAR(255),
  year VARCHAR(50),
  team_name VARCHAR(255),
  participant_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_niat ON users(niat_id);

-- 5. Problem Assignments Table
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

-- 6. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 8. Enable Supabase Realtime for instant problem locking updates
ALTER TABLE problem_assignments REPLICA IDENTITY FULL;
ALTER TABLE problem_statements REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'problem_assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE problem_assignments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'problem_statements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE problem_statements;
  END IF;
END $$;

-- 9. Seed System Settings
INSERT INTO system_settings (key, value)
VALUES 
  ('selection_status', 'OPEN'),
  ('selection_start_time', ''),
  ('selection_end_time', ''),
  ('hackathon_title', 'HACKATHON 2026')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 10. Seed Lead Admin Account
INSERT INTO users (name, email, role, niat_id)
VALUES ('Lead Admin', 'lakkireddysanjeevareddy8@gmail.com', 'ADMIN', 'ADMIN-001')
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- 11. Seed Official 16 Domains
INSERT INTO domains (code, name, icon, description) VALUES
`;

const domainInserts = domains.map(d => 
  `  (${escapeSql(d.code)}, ${escapeSql(d.name)}, ${escapeSql(d.icon)}, ${escapeSql(d.description)})`
).join(',\n');

sql += domainInserts;
sql += `\nON CONFLICT (code) DO UPDATE SET\n  name = EXCLUDED.name,\n  icon = EXCLUDED.icon,\n  description = EXCLUDED.description;\n\n`;

sql += `-- 12. Seed Official 160 Problem Statements (from PDF)\n`;

for (const p of problems) {
  sql += `INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  ${escapeSql(p.code)},
  (SELECT id FROM domains WHERE code = ${escapeSql(p.domainCode)}),
  ${escapeSql(p.title)},
  ${escapeSql(p.description)},
  ${escapeSql(p.description)},
  ${escapeSql(p.description)},
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;\n\n`;
}

sql += `-- Verify final problem count
DO $$
DECLARE
  problem_count INTEGER;
  domain_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO problem_count FROM problem_statements;
  SELECT COUNT(*) INTO domain_count FROM domains;
  RAISE NOTICE 'Supabase Database Ready: % domains, % problem statements', domain_count, problem_count;
END $$;
`;

const outPath = path.join(__dirname, '../database/supabase_schema_and_seed.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log(`✅ Generated ${outPath} (${problems.length} problems, ${domains.length} domains)`);
