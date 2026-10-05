const bcrypt = require('bcryptjs');
const db = require('./index');
const { domains, problems } = require('./problemData');
require('dotenv').config();

async function seed() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Domains
  const insertDomain = db.prepare(`
    INSERT INTO domains (code, name, icon, description)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET
      name = excluded.name,
      icon = excluded.icon,
      description = excluded.description
  `);

  const domainMap = {};
  const seedDomains = db.transaction(() => {
    for (const d of domains) {
      insertDomain.run(d.code, d.name, d.icon, d.description);
    }
  });
  seedDomains();

  // Populate domainMap id lookup
  const allDomains = db.prepare('SELECT id, code FROM domains').all();
  for (const d of allDomains) {
    domainMap[d.code] = d.id;
  }
  console.log(`✅ Seeded ${allDomains.length} domains.`);

  // 2. Seed 160 Problem Statements
  const insertProblem = db.prepare(`
    INSERT INTO problem_statements (
      problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(problem_code) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      detailed_requirements = excluded.detailed_requirements,
      expected_outcome = excluded.expected_outcome,
      difficulty = excluded.difficulty,
      tags = excluded.tags
  `);

  const seedProblems = db.transaction(() => {
    let count = 0;
    for (const p of problems) {
      const domainId = domainMap[p.domainCode];
      if (!domainId) {
        console.warn(`Warning: domain code ${p.domainCode} not found for problem ${p.code}`);
        continue;
      }
      insertProblem.run(
        p.code,
        domainId,
        p.title,
        p.description,
        p.detailedRequirements || p.description,
        p.expectedOutcome || p.description,
        p.difficulty || 'Medium',
        p.tags || '[]',
        'AVAILABLE'
      );
      count++;
    }
    return count;
  });

  const seededCount = seedProblems();
  console.log(`✅ Seeded ${seededCount} problem statements across ${allDomains.length} domains.`);

  // 3. Seed Admin Account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hackathon.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecureHackathon2026!';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, college, course, year, team_name, participant_id)
      VALUES (?, ?, ?, 'ADMIN', ?, ?, ?, ?, ?, ?)
    `).run(
      'Hackathon Lead Organizer',
      adminEmail,
      adminHash,
      '+1-555-0199',
      'Hackathon Central HQ',
      'Administration',
      'Organizer',
      'Admin Operations',
      'ADMIN-001'
    );
    console.log(`✅ Created Admin account: ${adminEmail}`);
  } else {
    // Update password hash if needed
    db.prepare("UPDATE users SET password_hash = ?, role = 'ADMIN' WHERE email = ?").run(adminHash, adminEmail);
    console.log(`ℹ️ Admin account already exists: ${adminEmail} (credentials updated)`);
  }

  // 4. Seed Demo Participants for testing & live preview
  const demoParticipant1 = 'alex.chen@university.edu';
  const demoParticipant2 = 'sarah.patel@tech.edu';
  const demoPassword = await bcrypt.hash('Participant123!', 10);

  if (!db.prepare('SELECT id FROM users WHERE email = ?').get(demoParticipant1)) {
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, college, course, year, team_name, participant_id)
      VALUES (?, ?, ?, 'PARTICIPANT', ?, ?, ?, ?, ?, ?)
    `).run(
      'Alex Chen',
      demoParticipant1,
      demoPassword,
      '+1-555-0234',
      'MIT Engineering',
      'B.S. Computer Science',
      '3rd Year',
      'Neural Knights',
      'PART-1001'
    );
    console.log(`✅ Created Demo Participant: ${demoParticipant1}`);
  }

  if (!db.prepare('SELECT id FROM users WHERE email = ?').get(demoParticipant2)) {
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, college, course, year, team_name, participant_id)
      VALUES (?, ?, ?, 'PARTICIPANT', ?, ?, ?, ?, ?, ?)
    `).run(
      'Sarah Patel',
      demoParticipant2,
      demoPassword,
      '+1-555-0288',
      'Stanford University',
      'M.S. Data Science',
      '1st Year',
      'AlgoForge',
      'PART-1002'
    );
    console.log(`✅ Created Demo Participant: ${demoParticipant2}`);
  }

  // 5. Audit log seeding
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (adminUser) {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, resource_type, details)
      VALUES (?, 'SYSTEM_SEEDED', 'DATABASE', 'Seeded 16 domains, 160 problem statements, and initial admin/demo users')
    `).run(adminUser.id);
  }

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETE!');
  console.log('======================================================');
  console.log(`Admin Credentials:`);
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`Demo Participant 1:`);
  console.log(`  Email:    ${demoParticipant1}`);
  console.log(`  Password: Participant123!`);
  console.log(`Demo Participant 2:`);
  console.log(`  Email:    ${demoParticipant2}`);
  console.log(`  Password: Participant123!`);
  console.log('======================================================\n');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
