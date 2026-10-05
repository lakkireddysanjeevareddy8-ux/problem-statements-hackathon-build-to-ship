-- ====================================================================
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
  ('A', 'Agriculture', '🌾', 'Smart crop detection, irrigation, equipment sharing, and agricultural market solutions.'),
  ('H', 'Healthcare & Hospitals', '🏥', 'Hospital systems, symptom triage, patient queues, bed availability, and medical tools.'),
  ('E', 'Education', '🎓', 'Personalized learning, attendance, timetables, doubt solving, and dropout prevention.'),
  ('S', 'Smart City', '🏙️', 'Waste collection, citizen complaints, smart parking, flood alerts, and civic dashboards.'),
  ('P', 'Public Safety & Emergency', '🚨', 'Emergency SOS, disaster management, shelter finding, and crowd safety monitoring.'),
  ('F', 'Finance & FinTech', '💳', 'Personal budgeting, expense management, small business cashflow, and loan comparison.'),
  ('R', 'Retail & E-Commerce', '🛍️', 'Local marketplaces, product recommendations, inventory management, and customer support.'),
  ('C', 'Environment & Climate', '🌱', 'Carbon tracking, tree plantation, water conservation, and renewable energy monitoring.'),
  ('T', 'Transportation & Mobility', '🚗', 'Carpooling, college transport, EV charging finder, and route optimization.'),
  ('J', 'Employment & Career', '💼', 'Resume analysis, skill-based job matching, career roadmaps, and campus placement.'),
  ('G', 'Government & Public Services', '🏛️', 'Government scheme discovery, grievance management, appointment booking, and civic heatmaps.'),
  ('HC', 'Home & Community', '🏡', 'Apartment management, skill exchange, neighborhood safety, and visitor management.'),
  ('FN', 'Food & Nutrition', '🥗', 'Food waste reduction, meal planning, nutrition info, and food expiry tracking.'),
  ('MW', 'Mental Wellness & Social Wellbeing', '🧠', 'Student stress management, digital wellness, peer support, and mood journals.'),
  ('CS', 'Cybersecurity & Digital Safety', '🛡️', 'Phishing awareness, password security, scam detection, and cyber incident reporting.'),
  ('SA', 'Smart Automation', '🤖', 'Home and office automation, workflow automation, and automated task assistants.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 12. Seed Official 160 Problem Statements (from PDF)
INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A1',
  (SELECT id FROM domains WHERE code = 'A'),
  'Smart Crop Disease Detection Platform',
  'Farmers struggle to identify crop diseases early. Build a web application where farmers can upload crop images and receive possible disease identification, severity estimation, and recommended actions.',
  'Farmers struggle to identify crop diseases early. Build a web application where farmers can upload crop images and receive possible disease identification, severity estimation, and recommended actions.',
  'Farmers struggle to identify crop diseases early. Build a web application where farmers can upload crop images and receive possible disease identification, severity estimation, and recommended actions.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A2',
  (SELECT id FROM domains WHERE code = 'A'),
  'AI-Based Crop Recommendation System',
  'Build a platform that recommends suitable crops based on soil type, location, weather, water availability, and previous crop history.',
  'Build a platform that recommends suitable crops based on soil type, location, weather, water availability, and previous crop history.',
  'Build a platform that recommends suitable crops based on soil type, location, weather, water availability, and previous crop history.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A3',
  (SELECT id FROM domains WHERE code = 'A'),
  'Farm Expense & Profit Tracker',
  'Create a dashboard that helps farmers record seeds, fertilizers, labor, equipment, irrigation, and other expenses and calculates estimated profit per crop.',
  'Create a dashboard that helps farmers record seeds, fertilizers, labor, equipment, irrigation, and other expenses and calculates estimated profit per crop.',
  'Create a dashboard that helps farmers record seeds, fertilizers, labor, equipment, irrigation, and other expenses and calculates estimated profit per crop.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A4',
  (SELECT id FROM domains WHERE code = 'A'),
  'Smart Irrigation Recommendation System',
  'Build an application that recommends when and how much to irrigate crops using weather information, crop type, soil conditions, and historical irrigation data.',
  'Build an application that recommends when and how much to irrigate crops using weather information, crop type, soil conditions, and historical irrigation data.',
  'Build an application that recommends when and how much to irrigate crops using weather information, crop type, soil conditions, and historical irrigation data.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A5',
  (SELECT id FROM domains WHERE code = 'A'),
  'Farmer-to-Buyer Marketplace',
  'Create a platform connecting farmers directly with restaurants, retailers, wholesalers, and consumers to reduce unnecessary middlemen.',
  'Create a platform connecting farmers directly with restaurants, retailers, wholesalers, and consumers to reduce unnecessary middlemen.',
  'Create a platform connecting farmers directly with restaurants, retailers, wholesalers, and consumers to reduce unnecessary middlemen.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A6',
  (SELECT id FROM domains WHERE code = 'A'),
  'Agricultural Equipment Sharing Platform',
  'Build a system where farmers can rent tractors, harvesters, pumps, and other agricultural equipment from nearby owners.',
  'Build a system where farmers can rent tractors, harvesters, pumps, and other agricultural equipment from nearby owners.',
  'Build a system where farmers can rent tractors, harvesters, pumps, and other agricultural equipment from nearby owners.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A7',
  (SELECT id FROM domains WHERE code = 'A'),
  'Government Agricultural Scheme Finder',
  'Create an application that matches farmers with government subsidies, loans, insurance programs, and agricultural schemes based on their profile.',
  'Create an application that matches farmers with government subsidies, loans, insurance programs, and agricultural schemes based on their profile.',
  'Create an application that matches farmers with government subsidies, loans, insurance programs, and agricultural schemes based on their profile.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A8',
  (SELECT id FROM domains WHERE code = 'A'),
  'Crop Price Prediction Dashboard',
  'Build a platform that displays historical crop prices and predicts possible future price trends using available market data.',
  'Build a platform that displays historical crop prices and predicts possible future price trends using available market data.',
  'Build a platform that displays historical crop prices and predicts possible future price trends using available market data.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A9',
  (SELECT id FROM domains WHERE code = 'A'),
  'Farm-to-Consumer Traceability System',
  'Create a platform that allows consumers to track a food product from farm to retailer using digital batch records.',
  'Create a platform that allows consumers to track a food product from farm to retailer using digital batch records.',
  'Create a platform that allows consumers to track a food product from farm to retailer using digital batch records.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'A10',
  (SELECT id FROM domains WHERE code = 'A'),
  'Agricultural Waste Marketplace',
  'Build a platform where farmers can list agricultural waste such as straw, husks, and crop residues so industries can purchase and reuse them.',
  'Build a platform where farmers can list agricultural waste such as straw, husks, and crop residues so industries can purchase and reuse them.',
  'Build a platform where farmers can list agricultural waste such as straw, husks, and crop residues so industries can purchase and reuse them.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H1',
  (SELECT id FROM domains WHERE code = 'H'),
  'Smart Hospital Appointment System',
  'Build a hospital appointment platform that automatically manages doctors, departments, available slots, cancellations, and waiting lists.',
  'Build a hospital appointment platform that automatically manages doctors, departments, available slots, cancellations, and waiting lists.',
  'Build a hospital appointment platform that automatically manages doctors, departments, available slots, cancellations, and waiting lists.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H2',
  (SELECT id FROM domains WHERE code = 'H'),
  'AI-Based Symptom Triage Assistant',
  'Create a web application where users enter symptoms and receive a preliminary urgency classification such as emergency, urgent, or routine consultation.',
  'Create a web application where users enter symptoms and receive a preliminary urgency classification such as emergency, urgent, or routine consultation.',
  'Create a web application where users enter symptoms and receive a preliminary urgency classification such as emergency, urgent, or routine consultation.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H3',
  (SELECT id FROM domains WHERE code = 'H'),
  'Hospital Bed Availability Dashboard',
  'Build a real-time dashboard showing available, occupied, reserved, and cleaning-status beds across hospital departments.',
  'Build a real-time dashboard showing available, occupied, reserved, and cleaning-status beds across hospital departments.',
  'Build a real-time dashboard showing available, occupied, reserved, and cleaning-status beds across hospital departments.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H4',
  (SELECT id FROM domains WHERE code = 'H'),
  'Digital Patient Queue Management',
  'Create a system that allows patients to obtain digital tokens and track their estimated waiting time without physically standing in queues.',
  'Create a system that allows patients to obtain digital tokens and track their estimated waiting time without physically standing in queues.',
  'Create a system that allows patients to obtain digital tokens and track their estimated waiting time without physically standing in queues.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H5',
  (SELECT id FROM domains WHERE code = 'H'),
  'Medicine Availability Finder',
  'Build a platform that helps patients find nearby pharmacies or hospital pharmacies that have a particular medicine in stock.',
  'Build a platform that helps patients find nearby pharmacies or hospital pharmacies that have a particular medicine in stock.',
  'Build a platform that helps patients find nearby pharmacies or hospital pharmacies that have a particular medicine in stock.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H6',
  (SELECT id FROM domains WHERE code = 'H'),
  'Medical Report Organizer',
  'Create a secure application where patients can upload and organize medical reports, prescriptions, test results, and appointment history.',
  'Create a secure application where patients can upload and organize medical reports, prescriptions, test results, and appointment history.',
  'Create a secure application where patients can upload and organize medical reports, prescriptions, test results, and appointment history.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H7',
  (SELECT id FROM domains WHERE code = 'H'),
  'Emergency Blood Donor Network',
  'Build a platform connecting hospitals and patients with compatible blood donors based on blood group and location.',
  'Build a platform connecting hospitals and patients with compatible blood donors based on blood group and location.',
  'Build a platform connecting hospitals and patients with compatible blood donors based on blood group and location.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H8',
  (SELECT id FROM domains WHERE code = 'H'),
  'Hospital Resource Management System',
  'Create a dashboard for hospitals to monitor ICU beds, oxygen equipment, ventilators, medicines, blood units, and other critical resources.',
  'Create a dashboard for hospitals to monitor ICU beds, oxygen equipment, ventilators, medicines, blood units, and other critical resources.',
  'Create a dashboard for hospitals to monitor ICU beds, oxygen equipment, ventilators, medicines, blood units, and other critical resources.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H9',
  (SELECT id FROM domains WHERE code = 'H'),
  'Patient Feedback & Hospital Quality Dashboard',
  'Build a platform that collects patient feedback and generates department-wise insights about waiting time, cleanliness, staff behavior, and service quality.',
  'Build a platform that collects patient feedback and generates department-wise insights about waiting time, cleanliness, staff behavior, and service quality.',
  'Build a platform that collects patient feedback and generates department-wise insights about waiting time, cleanliness, staff behavior, and service quality.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'H10',
  (SELECT id FROM domains WHERE code = 'H'),
  'Elderly Healthcare Reminder Platform',
  'Create an application that reminds elderly users about medicines, appointments, health checkups, and important medical activities.',
  'Create an application that reminds elderly users about medicines, appointments, health checkups, and important medical activities.',
  'Create an application that reminds elderly users about medicines, appointments, health checkups, and important medical activities.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E1',
  (SELECT id FROM domains WHERE code = 'E'),
  'AI Personalized Learning Platform',
  'Build an application that analyzes a student''s performance and recommends personalized learning materials and practice questions.',
  'Build an application that analyzes a student''s performance and recommends personalized learning materials and practice questions.',
  'Build an application that analyzes a student''s performance and recommends personalized learning materials and practice questions.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E2',
  (SELECT id FROM domains WHERE code = 'E'),
  'Student Attendance & Performance Dashboard',
  'Create a system where teachers can track attendance, marks, assignments, and identify students who may require additional support.',
  'Create a system where teachers can track attendance, marks, assignments, and identify students who may require additional support.',
  'Create a system where teachers can track attendance, marks, assignments, and identify students who may require additional support.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E3',
  (SELECT id FROM domains WHERE code = 'E'),
  'AI Doubt-Solving Platform',
  'Build a platform where students can submit academic questions and receive explanations, examples, and learning resources.',
  'Build a platform where students can submit academic questions and receive explanations, examples, and learning resources.',
  'Build a platform where students can submit academic questions and receive explanations, examples, and learning resources.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E4',
  (SELECT id FROM domains WHERE code = 'E'),
  'Skill Gap Analyzer',
  'Create an application that compares a student''s current skills with the requirements of a selected career or job and generates a personalized learning roadmap.',
  'Create an application that compares a student''s current skills with the requirements of a selected career or job and generates a personalized learning roadmap.',
  'Create an application that compares a student''s current skills with the requirements of a selected career or job and generates a personalized learning roadmap.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E5',
  (SELECT id FROM domains WHERE code = 'E'),
  'Smart College Timetable Generator',
  'Build an application that automatically creates conflict-free timetables based on classrooms, faculty availability, subjects, and student batches.',
  'Build an application that automatically creates conflict-free timetables based on classrooms, faculty availability, subjects, and student batches.',
  'Build an application that automatically creates conflict-free timetables based on classrooms, faculty availability, subjects, and student batches.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E6',
  (SELECT id FROM domains WHERE code = 'E'),
  'Scholarship Discovery Platform',
  'Create a system that recommends scholarships to students based on academic performance, income category, course, location, and eligibility.',
  'Create a system that recommends scholarships to students based on academic performance, income category, course, location, and eligibility.',
  'Create a system that recommends scholarships to students based on academic performance, income category, course, location, and eligibility.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E7',
  (SELECT id FROM domains WHERE code = 'E'),
  'Student Project Collaboration Platform',
  'Build a platform where students can find teammates, publish project ideas, assign tasks, and track project progress.',
  'Build a platform where students can find teammates, publish project ideas, assign tasks, and track project progress.',
  'Build a platform where students can find teammates, publish project ideas, assign tasks, and track project progress.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E8',
  (SELECT id FROM domains WHERE code = 'E'),
  'AI Interview Preparation Platform',
  'Create a web application that conducts mock interviews and provides feedback on answers, communication, and technical knowledge.',
  'Create a web application that conducts mock interviews and provides feedback on answers, communication, and technical knowledge.',
  'Create a web application that conducts mock interviews and provides feedback on answers, communication, and technical knowledge.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E9',
  (SELECT id FROM domains WHERE code = 'E'),
  'Digital Laboratory Management System',
  'Build a platform for managing laboratory equipment, experiments, bookings, maintenance, and student usage records.',
  'Build a platform for managing laboratory equipment, experiments, bookings, maintenance, and student usage records.',
  'Build a platform for managing laboratory equipment, experiments, bookings, maintenance, and student usage records.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'E10',
  (SELECT id FROM domains WHERE code = 'E'),
  'Early Dropout Risk Detection',
  'Create a dashboard that analyzes attendance, academic performance, assignment completion, and engagement data to identify students who may be at risk of dropping out.',
  'Create a dashboard that analyzes attendance, academic performance, assignment completion, and engagement data to identify students who may be at risk of dropping out.',
  'Create a dashboard that analyzes attendance, academic performance, assignment completion, and engagement data to identify students who may be at risk of dropping out.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S1',
  (SELECT id FROM domains WHERE code = 'S'),
  'Smart Waste Collection Platform',
  'Build a system that helps municipalities track waste collection vehicles, collection schedules, and overflowing garbage locations.',
  'Build a system that helps municipalities track waste collection vehicles, collection schedules, and overflowing garbage locations.',
  'Build a system that helps municipalities track waste collection vehicles, collection schedules, and overflowing garbage locations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S2',
  (SELECT id FROM domains WHERE code = 'S'),
  'Citizen Complaint Management System',
  'Create a platform where citizens report road, water, electricity, sanitation, and public infrastructure problems and track resolution status.',
  'Create a platform where citizens report road, water, electricity, sanitation, and public infrastructure problems and track resolution status.',
  'Create a platform where citizens report road, water, electricity, sanitation, and public infrastructure problems and track resolution status.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S3',
  (SELECT id FROM domains WHERE code = 'S'),
  'Smart Parking Finder',
  'Build a web application that helps users find available parking spaces and optionally reserve them.',
  'Build a web application that helps users find available parking spaces and optionally reserve them.',
  'Build a web application that helps users find available parking spaces and optionally reserve them.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S4',
  (SELECT id FROM domains WHERE code = 'S'),
  'Pothole Reporting Platform',
  'Create a map-based system where citizens can report potholes with photographs and location information.',
  'Create a map-based system where citizens can report potholes with photographs and location information.',
  'Create a map-based system where citizens can report potholes with photographs and location information.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S5',
  (SELECT id FROM domains WHERE code = 'S'),
  'Public Toilet Finder & Maintenance System',
  'Build an application that helps citizens find nearby public toilets and allows authorities to monitor cleanliness and maintenance complaints.',
  'Build an application that helps citizens find nearby public toilets and allows authorities to monitor cleanliness and maintenance complaints.',
  'Build an application that helps citizens find nearby public toilets and allows authorities to monitor cleanliness and maintenance complaints.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S6',
  (SELECT id FROM domains WHERE code = 'S'),
  'Smart Streetlight Monitoring',
  'Create a dashboard for monitoring streetlights, reporting failures, and prioritizing maintenance.',
  'Create a dashboard for monitoring streetlights, reporting failures, and prioritizing maintenance.',
  'Create a dashboard for monitoring streetlights, reporting failures, and prioritizing maintenance.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S7',
  (SELECT id FROM domains WHERE code = 'S'),
  'Urban Flood Alert Platform',
  'Build a system that combines rainfall, drainage, and location information to identify areas at higher risk of urban flooding.',
  'Build a system that combines rainfall, drainage, and location information to identify areas at higher risk of urban flooding.',
  'Build a system that combines rainfall, drainage, and location information to identify areas at higher risk of urban flooding.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S8',
  (SELECT id FROM domains WHERE code = 'S'),
  'Public Transport Tracking Platform',
  'Create a web application that displays public buses, routes, estimated arrival times, and service alerts.',
  'Create a web application that displays public buses, routes, estimated arrival times, and service alerts.',
  'Create a web application that displays public buses, routes, estimated arrival times, and service alerts.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S9',
  (SELECT id FROM domains WHERE code = 'S'),
  'City Air Quality Dashboard',
  'Build a platform displaying air quality levels across different locations and providing health recommendations based on pollution levels.',
  'Build a platform displaying air quality levels across different locations and providing health recommendations based on pollution levels.',
  'Build a platform displaying air quality levels across different locations and providing health recommendations based on pollution levels.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'S10',
  (SELECT id FROM domains WHERE code = 'S'),
  'Smart Civic Resource Dashboard',
  'Create a dashboard that helps municipal authorities visualize complaints, infrastructure conditions, sanitation data, and maintenance activities.',
  'Create a dashboard that helps municipal authorities visualize complaints, infrastructure conditions, sanitation data, and maintenance activities.',
  'Create a dashboard that helps municipal authorities visualize complaints, infrastructure conditions, sanitation data, and maintenance activities.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P1',
  (SELECT id FROM domains WHERE code = 'P'),
  'Emergency SOS Web Platform',
  'Build a platform where users can trigger an emergency alert and share their location with predefined emergency contacts.',
  'Build a platform where users can trigger an emergency alert and share their location with predefined emergency contacts.',
  'Build a platform where users can trigger an emergency alert and share their location with predefined emergency contacts.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P2',
  (SELECT id FROM domains WHERE code = 'P'),
  'Disaster Management Dashboard',
  'Create a dashboard for authorities to monitor disaster incidents, affected areas, shelters, resources, and rescue operations.',
  'Create a dashboard for authorities to monitor disaster incidents, affected areas, shelters, resources, and rescue operations.',
  'Create a dashboard for authorities to monitor disaster incidents, affected areas, shelters, resources, and rescue operations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P3',
  (SELECT id FROM domains WHERE code = 'P'),
  'Missing Person Reporting Platform',
  'Build a system for reporting missing persons and managing verified information, locations, and case updates.',
  'Build a system for reporting missing persons and managing verified information, locations, and case updates.',
  'Build a system for reporting missing persons and managing verified information, locations, and case updates.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P4',
  (SELECT id FROM domains WHERE code = 'P'),
  'Women Safety Route Planner',
  'Create a map-based application that recommends safer routes using factors such as lighting, public activity, and reported incidents.',
  'Create a map-based application that recommends safer routes using factors such as lighting, public activity, and reported incidents.',
  'Create a map-based application that recommends safer routes using factors such as lighting, public activity, and reported incidents.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P5',
  (SELECT id FROM domains WHERE code = 'P'),
  'Emergency Shelter Finder',
  'Build an application that helps people locate nearby shelters during floods, cyclones, earthquakes, or other disasters.',
  'Build an application that helps people locate nearby shelters during floods, cyclones, earthquakes, or other disasters.',
  'Build an application that helps people locate nearby shelters during floods, cyclones, earthquakes, or other disasters.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P6',
  (SELECT id FROM domains WHERE code = 'P'),
  'Volunteer Coordination Platform',
  'Create a system that connects volunteers with disaster-relief organizations and assigns tasks based on location and skills.',
  'Create a system that connects volunteers with disaster-relief organizations and assigns tasks based on location and skills.',
  'Create a system that connects volunteers with disaster-relief organizations and assigns tasks based on location and skills.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P7',
  (SELECT id FROM domains WHERE code = 'P'),
  'Emergency Vehicle Coordination System',
  'Build a platform that helps coordinate ambulances, fire engines, rescue teams, and emergency requests.',
  'Build a platform that helps coordinate ambulances, fire engines, rescue teams, and emergency requests.',
  'Build a platform that helps coordinate ambulances, fire engines, rescue teams, and emergency requests.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P8',
  (SELECT id FROM domains WHERE code = 'P'),
  'Crowd Safety Monitoring Dashboard',
  'Create a system for event organizers to monitor crowd density, entrances, exits, and potential overcrowding.',
  'Create a system for event organizers to monitor crowd density, entrances, exits, and potential overcrowding.',
  'Create a system for event organizers to monitor crowd density, entrances, exits, and potential overcrowding.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P9',
  (SELECT id FROM domains WHERE code = 'P'),
  'Disaster Resource Distribution Platform',
  'Build an application for tracking food, water, medicine, clothing, and other relief supplies during disasters.',
  'Build an application for tracking food, water, medicine, clothing, and other relief supplies during disasters.',
  'Build an application for tracking food, water, medicine, clothing, and other relief supplies during disasters.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'P10',
  (SELECT id FROM domains WHERE code = 'P'),
  'Emergency Communication Hub',
  'Create a centralized platform for authorities to publish verified emergency instructions, alerts, evacuation information, and updates.',
  'Create a centralized platform for authorities to publish verified emergency instructions, alerts, evacuation information, and updates.',
  'Create a centralized platform for authorities to publish verified emergency instructions, alerts, evacuation information, and updates.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F1',
  (SELECT id FROM domains WHERE code = 'F'),
  'Personal Expense Management Platform',
  'Build a web application that automatically categorizes expenses and provides spending insights.',
  'Build a web application that automatically categorizes expenses and provides spending insights.',
  'Build a web application that automatically categorizes expenses and provides spending insights.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F2',
  (SELECT id FROM domains WHERE code = 'F'),
  'Student Budget Planner',
  'Create a budgeting platform specifically designed for students to manage food, travel, education, entertainment, and savings.',
  'Create a budgeting platform specifically designed for students to manage food, travel, education, entertainment, and savings.',
  'Create a budgeting platform specifically designed for students to manage food, travel, education, entertainment, and savings.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F3',
  (SELECT id FROM domains WHERE code = 'F'),
  'Small Business Cash Flow Dashboard',
  'Build a system that helps small businesses track income, expenses, invoices, and projected cash flow.',
  'Build a system that helps small businesses track income, expenses, invoices, and projected cash flow.',
  'Build a system that helps small businesses track income, expenses, invoices, and projected cash flow.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F4',
  (SELECT id FROM domains WHERE code = 'F'),
  'AI Financial Education Assistant',
  'Create an educational platform that explains financial concepts such as savings, loans, interest, taxes, and investments in simple language.',
  'Create an educational platform that explains financial concepts such as savings, loans, interest, taxes, and investments in simple language.',
  'Create an educational platform that explains financial concepts such as savings, loans, interest, taxes, and investments in simple language.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F5',
  (SELECT id FROM domains WHERE code = 'F'),
  'Subscription Management Platform',
  'Build an application that tracks recurring subscriptions and alerts users about upcoming payments.',
  'Build an application that tracks recurring subscriptions and alerts users about upcoming payments.',
  'Build an application that tracks recurring subscriptions and alerts users about upcoming payments.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F6',
  (SELECT id FROM domains WHERE code = 'F'),
  'Bill Splitting Platform',
  'Create a system for groups to track shared expenses and automatically calculate who owes whom.',
  'Create a system for groups to track shared expenses and automatically calculate who owes whom.',
  'Create a system for groups to track shared expenses and automatically calculate who owes whom.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F7',
  (SELECT id FROM domains WHERE code = 'F'),
  'Loan Comparison Platform',
  'Build a platform that allows users to compare loans based on interest rate, tenure, fees, and estimated monthly payments.',
  'Build a platform that allows users to compare loans based on interest rate, tenure, fees, and estimated monthly payments.',
  'Build a platform that allows users to compare loans based on interest rate, tenure, fees, and estimated monthly payments.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F8',
  (SELECT id FROM domains WHERE code = 'F'),
  'Invoice Management System',
  'Create an application for freelancers and small businesses to generate, track, and manage invoices.',
  'Create an application for freelancers and small businesses to generate, track, and manage invoices.',
  'Create an application for freelancers and small businesses to generate, track, and manage invoices.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F9',
  (SELECT id FROM domains WHERE code = 'F'),
  'Financial Goal Tracker',
  'Build a platform where users define financial goals and receive progress tracking and saving recommendations.',
  'Build a platform where users define financial goals and receive progress tracking and saving recommendations.',
  'Build a platform where users define financial goals and receive progress tracking and saving recommendations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'F10',
  (SELECT id FROM domains WHERE code = 'F'),
  'Small Business Credit Readiness Platform',
  'Create a system that analyzes business financial records and provides an indicative credit-readiness score.',
  'Create a system that analyzes business financial records and provides an indicative credit-readiness score.',
  'Create a system that analyzes business financial records and provides an indicative credit-readiness score.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R1',
  (SELECT id FROM domains WHERE code = 'R'),
  'Local Store Digital Marketplace',
  'Build a platform where local shops can list products and customers can order from nearby stores.',
  'Build a platform where local shops can list products and customers can order from nearby stores.',
  'Build a platform where local shops can list products and customers can order from nearby stores.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R2',
  (SELECT id FROM domains WHERE code = 'R'),
  'Smart Product Recommendation System',
  'Create an e-commerce platform that recommends products based on customer behavior and preferences.',
  'Create an e-commerce platform that recommends products based on customer behavior and preferences.',
  'Create an e-commerce platform that recommends products based on customer behavior and preferences.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R3',
  (SELECT id FROM domains WHERE code = 'R'),
  'Inventory Management System',
  'Build a dashboard that helps retailers monitor stock levels, sales, low-stock products, and reorder requirements.',
  'Build a dashboard that helps retailers monitor stock levels, sales, low-stock products, and reorder requirements.',
  'Build a dashboard that helps retailers monitor stock levels, sales, low-stock products, and reorder requirements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R4',
  (SELECT id FROM domains WHERE code = 'R'),
  'Expiry Management System',
  'Create a system that alerts stores about products approaching their expiry dates.',
  'Create a system that alerts stores about products approaching their expiry dates.',
  'Create a system that alerts stores about products approaching their expiry dates.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R5',
  (SELECT id FROM domains WHERE code = 'R'),
  'Customer Loyalty Platform',
  'Build an application that manages customer points, rewards, offers, and purchase history.',
  'Build an application that manages customer points, rewards, offers, and purchase history.',
  'Build an application that manages customer points, rewards, offers, and purchase history.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R6',
  (SELECT id FROM domains WHERE code = 'R'),
  'Second-Hand Marketplace',
  'Create a platform where users can buy and sell used electronics, furniture, books, and other products.',
  'Create a platform where users can buy and sell used electronics, furniture, books, and other products.',
  'Create a platform where users can buy and sell used electronics, furniture, books, and other products.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R7',
  (SELECT id FROM domains WHERE code = 'R'),
  'Smart Shopping List',
  'Build an application that creates optimized shopping lists based on previous purchases, budget, and preferences.',
  'Build an application that creates optimized shopping lists based on previous purchases, budget, and preferences.',
  'Build an application that creates optimized shopping lists based on previous purchases, budget, and preferences.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R8',
  (SELECT id FROM domains WHERE code = 'R'),
  'Price Comparison Platform',
  'Create a system that allows users to compare product prices across different sellers.',
  'Create a system that allows users to compare product prices across different sellers.',
  'Create a system that allows users to compare product prices across different sellers.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R9',
  (SELECT id FROM domains WHERE code = 'R'),
  'Return & Warranty Management System',
  'Build a platform for customers to track product warranties, returns, repairs, and service requests.',
  'Build a platform for customers to track product warranties, returns, repairs, and service requests.',
  'Build a platform for customers to track product warranties, returns, repairs, and service requests.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'R10',
  (SELECT id FROM domains WHERE code = 'R'),
  'AI Customer Support Platform',
  'Create an AI-powered customer support system that handles common queries and escalates complex issues to human agents.',
  'Create an AI-powered customer support system that handles common queries and escalates complex issues to human agents.',
  'Create an AI-powered customer support system that handles common queries and escalates complex issues to human agents.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C1',
  (SELECT id FROM domains WHERE code = 'C'),
  'Personal Carbon Footprint Tracker',
  'Build a platform that estimates an individual''s carbon footprint based on travel, electricity, food, and lifestyle data.',
  'Build a platform that estimates an individual''s carbon footprint based on travel, electricity, food, and lifestyle data.',
  'Build a platform that estimates an individual''s carbon footprint based on travel, electricity, food, and lifestyle data.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C2',
  (SELECT id FROM domains WHERE code = 'C'),
  'Tree Plantation Management Platform',
  'Create a system for organizations to track trees planted, locations, species, survival rates, and maintenance.',
  'Create a system for organizations to track trees planted, locations, species, survival rates, and maintenance.',
  'Create a system for organizations to track trees planted, locations, species, survival rates, and maintenance.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C3',
  (SELECT id FROM domains WHERE code = 'C'),
  'Water Conservation Dashboard',
  'Build a platform that tracks household or institutional water consumption and provides conservation recommendations.',
  'Build a platform that tracks household or institutional water consumption and provides conservation recommendations.',
  'Build a platform that tracks household or institutional water consumption and provides conservation recommendations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C4',
  (SELECT id FROM domains WHERE code = 'C'),
  'Plastic Waste Reporting Platform',
  'Create a system where users can report plastic waste hotspots and monitor cleanup activities.',
  'Create a system where users can report plastic waste hotspots and monitor cleanup activities.',
  'Create a system where users can report plastic waste hotspots and monitor cleanup activities.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C5',
  (SELECT id FROM domains WHERE code = 'C'),
  'E-Waste Collection Platform',
  'Build a marketplace connecting households and organizations with authorized e-waste collection services.',
  'Build a marketplace connecting households and organizations with authorized e-waste collection services.',
  'Build a marketplace connecting households and organizations with authorized e-waste collection services.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C6',
  (SELECT id FROM domains WHERE code = 'C'),
  'Climate Risk Dashboard',
  'Create a platform that displays climate risks such as heatwaves, floods, droughts, and extreme rainfall for different regions.',
  'Create a platform that displays climate risks such as heatwaves, floods, droughts, and extreme rainfall for different regions.',
  'Create a platform that displays climate risks such as heatwaves, floods, droughts, and extreme rainfall for different regions.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C7',
  (SELECT id FROM domains WHERE code = 'C'),
  'Renewable Energy Monitoring Platform',
  'Build a dashboard for monitoring solar panels, energy generation, consumption, and savings.',
  'Build a dashboard for monitoring solar panels, energy generation, consumption, and savings.',
  'Build a dashboard for monitoring solar panels, energy generation, consumption, and savings.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C8',
  (SELECT id FROM domains WHERE code = 'C'),
  'Sustainable Lifestyle Recommendation App',
  'Create an application that suggests environmentally friendly alternatives to everyday activities.',
  'Create an application that suggests environmentally friendly alternatives to everyday activities.',
  'Create an application that suggests environmentally friendly alternatives to everyday activities.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C9',
  (SELECT id FROM domains WHERE code = 'C'),
  'River & Lake Pollution Reporting System',
  'Build a map-based platform for reporting pollution incidents and monitoring cleanup efforts.',
  'Build a map-based platform for reporting pollution incidents and monitoring cleanup efforts.',
  'Build a map-based platform for reporting pollution incidents and monitoring cleanup efforts.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'C10',
  (SELECT id FROM domains WHERE code = 'C'),
  'Community Recycling Platform',
  'Create a system that connects residents with recycling centers and tracks recyclable material collection.',
  'Create a system that connects residents with recycling centers and tracks recyclable material collection.',
  'Create a system that connects residents with recycling centers and tracks recyclable material collection.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T1',
  (SELECT id FROM domains WHERE code = 'T'),
  'Smart Carpooling Platform',
  'Build a platform that connects people traveling along similar routes to share rides.',
  'Build a platform that connects people traveling along similar routes to share rides.',
  'Build a platform that connects people traveling along similar routes to share rides.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T2',
  (SELECT id FROM domains WHERE code = 'T'),
  'College Transport Management System',
  'Create a system for managing college buses, routes, drivers, students, and live trip information.',
  'Create a system for managing college buses, routes, drivers, students, and live trip information.',
  'Create a system for managing college buses, routes, drivers, students, and live trip information.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T3',
  (SELECT id FROM domains WHERE code = 'T'),
  'EV Charging Station Finder',
  'Build an application that helps EV users find charging stations and view availability.',
  'Build an application that helps EV users find charging stations and view availability.',
  'Build an application that helps EV users find charging stations and view availability.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T4',
  (SELECT id FROM domains WHERE code = 'T'),
  'Road Accident Blackspot Dashboard',
  'Create a map showing accident-prone areas using historical accident data.',
  'Create a map showing accident-prone areas using historical accident data.',
  'Create a map showing accident-prone areas using historical accident data.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T5',
  (SELECT id FROM domains WHERE code = 'T'),
  'Vehicle Maintenance Reminder System',
  'Build an application that tracks vehicle servicing, insurance, pollution certificates, and maintenance schedules.',
  'Build an application that tracks vehicle servicing, insurance, pollution certificates, and maintenance schedules.',
  'Build an application that tracks vehicle servicing, insurance, pollution certificates, and maintenance schedules.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T6',
  (SELECT id FROM domains WHERE code = 'T'),
  'Intelligent Parking Management',
  'Create a system that manages parking spaces, reservations, payments, and occupancy.',
  'Create a system that manages parking spaces, reservations, payments, and occupancy.',
  'Create a system that manages parking spaces, reservations, payments, and occupancy.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T7',
  (SELECT id FROM domains WHERE code = 'T'),
  'Public Transport Route Optimizer',
  'Build an application that recommends efficient public transport routes based on travel time and transfers.',
  'Build an application that recommends efficient public transport routes based on travel time and transfers.',
  'Build an application that recommends efficient public transport routes based on travel time and transfers.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T8',
  (SELECT id FROM domains WHERE code = 'T'),
  'School Bus Safety Platform',
  'Create a system for tracking school buses and notifying parents about pickup and drop-off events.',
  'Create a system for tracking school buses and notifying parents about pickup and drop-off events.',
  'Create a system for tracking school buses and notifying parents about pickup and drop-off events.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T9',
  (SELECT id FROM domains WHERE code = 'T'),
  'Traffic Incident Reporting Platform',
  'Build an application where users can report accidents, roadblocks, traffic jams, and hazards.',
  'Build an application where users can report accidents, roadblocks, traffic jams, and hazards.',
  'Build an application where users can report accidents, roadblocks, traffic jams, and hazards.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'T10',
  (SELECT id FROM domains WHERE code = 'T'),
  'Logistics Route Optimization Platform',
  'Create a system that helps delivery companies optimize routes based on multiple delivery locations.',
  'Create a system that helps delivery companies optimize routes based on multiple delivery locations.',
  'Create a system that helps delivery companies optimize routes based on multiple delivery locations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J1',
  (SELECT id FROM domains WHERE code = 'J'),
  'AI Resume Analyzer',
  'Build a platform that analyzes resumes against a job description and identifies missing skills and improvements.',
  'Build a platform that analyzes resumes against a job description and identifies missing skills and improvements.',
  'Build a platform that analyzes resumes against a job description and identifies missing skills and improvements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J2',
  (SELECT id FROM domains WHERE code = 'J'),
  'Skill-Based Job Matching Platform',
  'Create a system that matches candidates with jobs based on skills rather than only job titles.',
  'Create a system that matches candidates with jobs based on skills rather than only job titles.',
  'Create a system that matches candidates with jobs based on skills rather than only job titles.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J3',
  (SELECT id FROM domains WHERE code = 'J'),
  'Internship Discovery Platform',
  'Build a platform that helps students discover internships based on their skills, course, location, and interests.',
  'Build a platform that helps students discover internships based on their skills, course, location, and interests.',
  'Build a platform that helps students discover internships based on their skills, course, location, and interests.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J4',
  (SELECT id FROM domains WHERE code = 'J'),
  'Career Roadmap Generator',
  'Create an application that generates personalized career roadmaps based on a student''s desired profession.',
  'Create an application that generates personalized career roadmaps based on a student''s desired profession.',
  'Create an application that generates personalized career roadmaps based on a student''s desired profession.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J5',
  (SELECT id FROM domains WHERE code = 'J'),
  'Freelancer-Client Matching Platform',
  'Build a marketplace connecting freelancers with clients based on skills and project requirements.',
  'Build a marketplace connecting freelancers with clients based on skills and project requirements.',
  'Build a marketplace connecting freelancers with clients based on skills and project requirements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J6',
  (SELECT id FROM domains WHERE code = 'J'),
  'Interview Scheduling System',
  'Create a platform that manages interview slots, candidates, interviewers, reminders, and feedback.',
  'Create a platform that manages interview slots, candidates, interviewers, reminders, and feedback.',
  'Create a platform that manages interview slots, candidates, interviewers, reminders, and feedback.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J7',
  (SELECT id FROM domains WHERE code = 'J'),
  'Employee Skill Management Platform',
  'Build a dashboard that helps organizations track employee skills, certifications, and training requirements.',
  'Build a dashboard that helps organizations track employee skills, certifications, and training requirements.',
  'Build a dashboard that helps organizations track employee skills, certifications, and training requirements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J8',
  (SELECT id FROM domains WHERE code = 'J'),
  'AI Mock Interview Platform',
  'Create a system that conducts simulated interviews and evaluates candidate responses.',
  'Create a system that conducts simulated interviews and evaluates candidate responses.',
  'Create a system that conducts simulated interviews and evaluates candidate responses.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J9',
  (SELECT id FROM domains WHERE code = 'J'),
  'Campus Placement Management System',
  'Build a complete platform for colleges to manage companies, students, eligibility, applications, interviews, and offers.',
  'Build a complete platform for colleges to manage companies, students, eligibility, applications, interviews, and offers.',
  'Build a complete platform for colleges to manage companies, students, eligibility, applications, interviews, and offers.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'J10',
  (SELECT id FROM domains WHERE code = 'J'),
  'Career Mentorship Platform',
  'Create a platform connecting students with industry professionals for mentorship sessions.',
  'Create a platform connecting students with industry professionals for mentorship sessions.',
  'Create a platform connecting students with industry professionals for mentorship sessions.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G1',
  (SELECT id FROM domains WHERE code = 'G'),
  'Government Scheme Discovery Platform',
  'Build an application that helps citizens find government schemes they may be eligible for.',
  'Build an application that helps citizens find government schemes they may be eligible for.',
  'Build an application that helps citizens find government schemes they may be eligible for.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G2',
  (SELECT id FROM domains WHERE code = 'G'),
  'Digital Grievance Management System',
  'Create a platform for citizens to submit complaints and track their resolution.',
  'Create a platform for citizens to submit complaints and track their resolution.',
  'Create a platform for citizens to submit complaints and track their resolution.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G3',
  (SELECT id FROM domains WHERE code = 'G'),
  'Public Service Appointment Platform',
  'Build a system for booking appointments for government services and managing queues.',
  'Build a system for booking appointments for government services and managing queues.',
  'Build a system for booking appointments for government services and managing queues.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G4',
  (SELECT id FROM domains WHERE code = 'G'),
  'Government Office Queue Management',
  'Create a digital token and queue tracking system for government offices.',
  'Create a digital token and queue tracking system for government offices.',
  'Create a digital token and queue tracking system for government offices.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G5',
  (SELECT id FROM domains WHERE code = 'G'),
  'Civic Issue Heatmap',
  'Build a map that visualizes reported civic problems such as garbage, potholes, water leaks, and streetlight failures.',
  'Build a map that visualizes reported civic problems such as garbage, potholes, water leaks, and streetlight failures.',
  'Build a map that visualizes reported civic problems such as garbage, potholes, water leaks, and streetlight failures.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G6',
  (SELECT id FROM domains WHERE code = 'G'),
  'Public Project Transparency Dashboard',
  'Create a platform showing government infrastructure projects, budgets, timelines, contractors, and progress.',
  'Create a platform showing government infrastructure projects, budgets, timelines, contractors, and progress.',
  'Create a platform showing government infrastructure projects, budgets, timelines, contractors, and progress.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G7',
  (SELECT id FROM domains WHERE code = 'G'),
  'Document Application Tracker',
  'Build a platform where citizens can track applications for certificates, licenses, permits, and other services.',
  'Build a platform where citizens can track applications for certificates, licenses, permits, and other services.',
  'Build a platform where citizens can track applications for certificates, licenses, permits, and other services.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G8',
  (SELECT id FROM domains WHERE code = 'G'),
  'Citizen Feedback Platform',
  'Create a system that collects citizen feedback about public services and generates analytics.',
  'Create a system that collects citizen feedback about public services and generates analytics.',
  'Create a system that collects citizen feedback about public services and generates analytics.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G9',
  (SELECT id FROM domains WHERE code = 'G'),
  'Local Government Resource Dashboard',
  'Build a dashboard for authorities to monitor public resources, complaints, projects, and service delivery.',
  'Build a dashboard for authorities to monitor public resources, complaints, projects, and service delivery.',
  'Build a dashboard for authorities to monitor public resources, complaints, projects, and service delivery.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'G10',
  (SELECT id FROM domains WHERE code = 'G'),
  'Rural Service Information Platform',
  'Create a simple multilingual platform providing rural citizens with information about government services and programs.',
  'Create a simple multilingual platform providing rural citizens with information about government services and programs.',
  'Create a simple multilingual platform providing rural citizens with information about government services and programs.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC1',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Apartment Management System',
  'Build a platform for managing residents, maintenance requests, notices, visitor records, and payments.',
  'Build a platform for managing residents, maintenance requests, notices, visitor records, and payments.',
  'Build a platform for managing residents, maintenance requests, notices, visitor records, and payments.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC2',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Community Skill Exchange Platform',
  'Create a system where neighbors can exchange skills such as tutoring, repairs, cooking, or technology support.',
  'Create a system where neighbors can exchange skills such as tutoring, repairs, cooking, or technology support.',
  'Create a system where neighbors can exchange skills such as tutoring, repairs, cooking, or technology support.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC3',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Local Community Event Platform',
  'Build an application for discovering and organizing local community events.',
  'Build an application for discovering and organizing local community events.',
  'Build an application for discovering and organizing local community events.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC4',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Neighborhood Safety Network',
  'Create a platform where residents can report local safety concerns and share verified alerts.',
  'Create a platform where residents can report local safety concerns and share verified alerts.',
  'Create a platform where residents can report local safety concerns and share verified alerts.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC5',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Household Expense Manager',
  'Build an application for families to track shared household expenses.',
  'Build an application for families to track shared household expenses.',
  'Build an application for families to track shared household expenses.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC6',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Home Maintenance Tracker',
  'Create a platform for managing appliance maintenance, repairs, warranties, and service schedules.',
  'Create a platform for managing appliance maintenance, repairs, warranties, and service schedules.',
  'Create a platform for managing appliance maintenance, repairs, warranties, and service schedules.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC7',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Lost & Found Community Platform',
  'Build a neighborhood-based platform for reporting and finding lost items.',
  'Build a neighborhood-based platform for reporting and finding lost items.',
  'Build a neighborhood-based platform for reporting and finding lost items.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC8',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Local Service Provider Marketplace',
  'Create a platform connecting residents with electricians, plumbers, cleaners, tutors, and other service providers.',
  'Create a platform connecting residents with electricians, plumbers, cleaners, tutors, and other service providers.',
  'Create a platform connecting residents with electricians, plumbers, cleaners, tutors, and other service providers.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC9',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Community Resource Sharing Platform',
  'Build an application where neighbors can lend or borrow tools, books, equipment, and other items.',
  'Build an application where neighbors can lend or borrow tools, books, equipment, and other items.',
  'Build an application where neighbors can lend or borrow tools, books, equipment, and other items.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'HC10',
  (SELECT id FROM domains WHERE code = 'HC'),
  'Apartment Visitor Management System',
  'Create a digital visitor management platform with resident approval and entry records.',
  'Create a digital visitor management platform with resident approval and entry records.',
  'Create a digital visitor management platform with resident approval and entry records.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN1',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Food Waste Reduction Platform',
  'Build a platform connecting restaurants, stores, and households with organizations that can redistribute surplus food.',
  'Build a platform connecting restaurants, stores, and households with organizations that can redistribute surplus food.',
  'Build a platform connecting restaurants, stores, and households with organizations that can redistribute surplus food.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN2',
  (SELECT id FROM domains WHERE code = 'FN'),
  'AI Meal Planning Platform',
  'Create a system that generates meal plans based on budget, dietary preferences, available ingredients, and nutritional requirements.',
  'Create a system that generates meal plans based on budget, dietary preferences, available ingredients, and nutritional requirements.',
  'Create a system that generates meal plans based on budget, dietary preferences, available ingredients, and nutritional requirements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN3',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Restaurant Food Waste Dashboard',
  'Build a dashboard that helps restaurants track food waste and identify major sources of waste.',
  'Build a dashboard that helps restaurants track food waste and identify major sources of waste.',
  'Build a dashboard that helps restaurants track food waste and identify major sources of waste.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN4',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Smart Grocery Planner',
  'Create an application that generates grocery lists based on planned meals and household consumption.',
  'Create an application that generates grocery lists based on planned meals and household consumption.',
  'Create an application that generates grocery lists based on planned meals and household consumption.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN5',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Food Donation Coordination Platform',
  'Build a platform connecting food donors with NGOs and community organizations.',
  'Build a platform connecting food donors with NGOs and community organizations.',
  'Build a platform connecting food donors with NGOs and community organizations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN6',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Restaurant Nutrition Information Platform',
  'Create a system that allows restaurants to display nutritional information for menu items.',
  'Create a system that allows restaurants to display nutritional information for menu items.',
  'Create a system that allows restaurants to display nutritional information for menu items.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN7',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Local Food Producer Marketplace',
  'Build a platform connecting local farmers and food producers directly with consumers.',
  'Build a platform connecting local farmers and food producers directly with consumers.',
  'Build a platform connecting local farmers and food producers directly with consumers.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN8',
  (SELECT id FROM domains WHERE code = 'FN'),
  'Food Expiry Tracker',
  'Create an application that tracks food products at home and reminds users before expiry.',
  'Create an application that tracks food products at home and reminds users before expiry.',
  'Create an application that tracks food products at home and reminds users before expiry.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN9',
  (SELECT id FROM domains WHERE code = 'FN'),
  'School Nutrition Management System',
  'Build a dashboard for monitoring school meal programs, menus, attendance, and food distribution.',
  'Build a dashboard for monitoring school meal programs, menus, attendance, and food distribution.',
  'Build a dashboard for monitoring school meal programs, menus, attendance, and food distribution.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'FN10',
  (SELECT id FROM domains WHERE code = 'FN'),
  'AI Recipe Generator',
  'Create a platform that generates recipes using ingredients already available to users.',
  'Create a platform that generates recipes using ingredients already available to users.',
  'Create a platform that generates recipes using ingredients already available to users.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW1',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Student Stress Management Platform',
  'Build a platform that helps students track workload, study habits, sleep patterns, and stress indicators.',
  'Build a platform that helps students track workload, study habits, sleep patterns, and stress indicators.',
  'Build a platform that helps students track workload, study habits, sleep patterns, and stress indicators.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW2',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Digital Wellness Dashboard',
  'Create an application that helps users understand and manage their screen time and digital habits.',
  'Create an application that helps users understand and manage their screen time and digital habits.',
  'Create an application that helps users understand and manage their screen time and digital habits.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW3',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Anonymous Peer Support Platform',
  'Build a moderated platform where students can anonymously share problems and receive peer support.',
  'Build a moderated platform where students can anonymously share problems and receive peer support.',
  'Build a moderated platform where students can anonymously share problems and receive peer support.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW4',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Study-Life Balance Planner',
  'Create a system that helps students balance academics, exercise, social activities, and personal time.',
  'Create a system that helps students balance academics, exercise, social activities, and personal time.',
  'Create a system that helps students balance academics, exercise, social activities, and personal time.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW5',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Workplace Wellbeing Dashboard',
  'Build a platform that allows organizations to monitor anonymous employee wellbeing surveys.',
  'Build a platform that allows organizations to monitor anonymous employee wellbeing surveys.',
  'Build a platform that allows organizations to monitor anonymous employee wellbeing surveys.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW6',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Daily Mood Journal',
  'Create a web application for users to record moods, activities, and personal reflections and visualize trends.',
  'Create a web application for users to record moods, activities, and personal reflections and visualize trends.',
  'Create a web application for users to record moods, activities, and personal reflections and visualize trends.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW7',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Social Connection Platform for Seniors',
  'Build a platform that helps elderly people discover community activities and connect with others.',
  'Build a platform that helps elderly people discover community activities and connect with others.',
  'Build a platform that helps elderly people discover community activities and connect with others.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW8',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Digital Detox Challenge Platform',
  'Create an application that organizes screen-time reduction challenges and tracks progress.',
  'Create an application that organizes screen-time reduction challenges and tracks progress.',
  'Create an application that organizes screen-time reduction challenges and tracks progress.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW9',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Student Support Resource Finder',
  'Build a platform that helps students discover counseling, academic, financial, and social support resources available to them.',
  'Build a platform that helps students discover counseling, academic, financial, and social support resources available to them.',
  'Build a platform that helps students discover counseling, academic, financial, and social support resources available to them.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'MW10',
  (SELECT id FROM domains WHERE code = 'MW'),
  'Community Volunteering Platform',
  'Create a platform that connects people looking to volunteer with local social organizations.',
  'Create a platform that connects people looking to volunteer with local social organizations.',
  'Create a platform that connects people looking to volunteer with local social organizations.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS1',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Phishing Awareness Simulator',
  'Build an educational platform that teaches users how to identify phishing attacks through simulated examples.',
  'Build an educational platform that teaches users how to identify phishing attacks through simulated examples.',
  'Build an educational platform that teaches users how to identify phishing attacks through simulated examples.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS2',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Password Security Education Platform',
  'Create an application that teaches users about password security and evaluates password practices without storing actual passwords.',
  'Create an application that teaches users about password security and evaluates password practices without storing actual passwords.',
  'Create an application that teaches users about password security and evaluates password practices without storing actual passwords.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS3',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Scam Detection Assistant',
  'Build a system where users can submit suspicious messages, emails, or links for risk analysis.',
  'Build a system where users can submit suspicious messages, emails, or links for risk analysis.',
  'Build a system where users can submit suspicious messages, emails, or links for risk analysis.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS4',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Cybersecurity Awareness Dashboard',
  'Create a platform for organizations to conduct cybersecurity awareness campaigns and track employee training.',
  'Create a platform for organizations to conduct cybersecurity awareness campaigns and track employee training.',
  'Create a platform for organizations to conduct cybersecurity awareness campaigns and track employee training.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS5',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Digital Privacy Assistant',
  'Build an application that teaches users how to improve privacy settings across common online services.',
  'Build an application that teaches users how to improve privacy settings across common online services.',
  'Build an application that teaches users how to improve privacy settings across common online services.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS6',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Fake Website Detection Platform',
  'Create a tool that analyzes website characteristics and provides an indicative risk assessment.',
  'Create a tool that analyzes website characteristics and provides an indicative risk assessment.',
  'Create a tool that analyzes website characteristics and provides an indicative risk assessment.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS7',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Data Breach Awareness Platform',
  'Build a dashboard that helps organizations track potential security incidents and response activities.',
  'Build a dashboard that helps organizations track potential security incidents and response activities.',
  'Build a dashboard that helps organizations track potential security incidents and response activities.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS8',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Secure Document Sharing Platform',
  'Create a web application for sharing documents with access controls, expiration dates, and audit logs.',
  'Create a web application for sharing documents with access controls, expiration dates, and audit logs.',
  'Create a web application for sharing documents with access controls, expiration dates, and audit logs.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS9',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Cyber Incident Reporting System',
  'Build a platform where organizations can report, categorize, and track cybersecurity incidents.',
  'Build a platform where organizations can report, categorize, and track cybersecurity incidents.',
  'Build a platform where organizations can report, categorize, and track cybersecurity incidents.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'CS10',
  (SELECT id FROM domains WHERE code = 'CS'),
  'Cybersecurity Learning Platform',
  'Create an interactive learning platform with cybersecurity lessons, quizzes, challenges, progress tracking, and leaderboards.',
  'Create an interactive learning platform with cybersecurity lessons, quizzes, challenges, progress tracking, and leaderboards.',
  'Create an interactive learning platform with cybersecurity lessons, quizzes, challenges, progress tracking, and leaderboards.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA1',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Smart Home Automation Management System',
  'Build a web application that allows users to monitor and control home appliances, lighting, fans, and other devices through a centralized dashboard with automated schedules and rules.',
  'Build a web application that allows users to monitor and control home appliances, lighting, fans, and other devices through a centralized dashboard with automated schedules and rules.',
  'Build a web application that allows users to monitor and control home appliances, lighting, fans, and other devices through a centralized dashboard with automated schedules and rules.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA2',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Smart Office Automation Platform',
  'Create a system that automatically manages office lighting, temperature, meeting rooms, equipment, and energy consumption based on occupancy, schedules, and user requirements.',
  'Create a system that automatically manages office lighting, temperature, meeting rooms, equipment, and energy consumption based on occupancy, schedules, and user requirements.',
  'Create a system that automatically manages office lighting, temperature, meeting rooms, equipment, and energy consumption based on occupancy, schedules, and user requirements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA3',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Automated College Classroom System',
  'Build a platform that automates classroom operations such as lights, fans, projectors, attendance, timetable-based device control, and energy monitoring.',
  'Build a platform that automates classroom operations such as lights, fans, projectors, attendance, timetable-based device control, and energy monitoring.',
  'Build a platform that automates classroom operations such as lights, fans, projectors, attendance, timetable-based device control, and energy monitoring.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA4',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Smart Hospital Room Automation',
  'Create a system that automates hospital room lighting, temperature, equipment status, nurse-call alerts, and room monitoring based on patient and staff requirements.',
  'Create a system that automates hospital room lighting, temperature, equipment status, nurse-call alerts, and room monitoring based on patient and staff requirements.',
  'Create a system that automates hospital room lighting, temperature, equipment status, nurse-call alerts, and room monitoring based on patient and staff requirements.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA5',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Smart Agriculture Automation Platform',
  'Build a web application that automatically controls irrigation, greenhouse conditions, water pumps, and other agricultural operations using sensor data and predefined rules.',
  'Build a web application that automatically controls irrigation, greenhouse conditions, water pumps, and other agricultural operations using sensor data and predefined rules.',
  'Build a web application that automatically controls irrigation, greenhouse conditions, water pumps, and other agricultural operations using sensor data and predefined rules.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA6',
  (SELECT id FROM domains WHERE code = 'SA'),
  'AI-Based Workflow Automation Platform',
  'Create a platform where users can create automated workflows such as If → Condition → Action. For example, when a new customer registers, automatically send a welcome email, create a CRM record, and notify the sales team.',
  'Create a platform where users can create automated workflows such as If → Condition → Action. For example, when a new customer registers, automatically send a welcome email, create a CRM record, and notify the sales team.',
  'Create a platform where users can create automated workflows such as If → Condition → Action. For example, when a new customer registers, automatically send a welcome email, create a CRM record, and notify the sales team.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA7',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Smart Energy Automation System',
  'Build a platform that monitors electricity consumption and automatically recommends or executes actions to reduce unnecessary energy usage.',
  'Build a platform that monitors electricity consumption and automatically recommends or executes actions to reduce unnecessary energy usage.',
  'Build a platform that monitors electricity consumption and automatically recommends or executes actions to reduce unnecessary energy usage.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA8',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Automated Inventory Reordering System',
  'Create a system that monitors inventory levels and automatically generates purchase requests or alerts when stock reaches predefined thresholds.',
  'Create a system that monitors inventory levels and automatically generates purchase requests or alerts when stock reaches predefined thresholds.',
  'Create a system that monitors inventory levels and automatically generates purchase requests or alerts when stock reaches predefined thresholds.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA9',
  (SELECT id FROM domains WHERE code = 'SA'),
  'Smart Parking Automation System',
  'Build a platform that detects parking availability and automatically manages slot allocation, reservations, entry/exit records, and notifications.',
  'Build a platform that detects parking availability and automatically manages slot allocation, reservations, entry/exit records, and notifications.',
  'Build a platform that detects parking availability and automatically manages slot allocation, reservations, entry/exit records, and notifications.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

INSERT INTO problem_statements (problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status)
VALUES (
  'SA10',
  (SELECT id FROM domains WHERE code = 'SA'),
  'AI-Based Personal Task Automation Assistant',
  'Create a web application that understands user tasks and automatically schedules reminders, organizes activities, prioritizes work, and triggers appropriate actions.',
  'Create a web application that understands user tasks and automatically schedules reminders, organizes activities, prioritizes work, and triggers appropriate actions.',
  'Create a web application that understands user tasks and automatically schedules reminders, organizes activities, prioritizes work, and triggers appropriate actions.',
  'Medium',
  '[]',
  'AVAILABLE'
)
ON CONFLICT (problem_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  detailed_requirements = EXCLUDED.detailed_requirements,
  expected_outcome = EXCLUDED.expected_outcome,
  domain_id = EXCLUDED.domain_id;

-- Verify final problem count
DO $$
DECLARE
  problem_count INTEGER;
  domain_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO problem_count FROM problem_statements;
  SELECT COUNT(*) INTO domain_count FROM domains;
  RAISE NOTICE 'Supabase Database Ready: % domains, % problem statements', domain_count, problem_count;
END $$;
