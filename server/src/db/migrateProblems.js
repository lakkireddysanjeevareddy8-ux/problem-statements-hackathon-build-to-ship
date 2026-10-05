const db = require('./index');
const { domains, problems } = require('./problemData');

function migrateOfficialProblems() {
  console.log('🔄 Starting official PDF problem statements migration...');

  // Start atomic transaction
  const runMigration = db.transaction(() => {
    // 1. Check existing assignments
    const existingAssignments = db.prepare('SELECT * FROM problem_assignments').all();
    console.log(`ℹ️ Existing assignments found: ${existingAssignments.length}`);

    // 2. Sync Domains
    // Update or insert each domain by name, ensuring the code matches official code
    const domainMap = {}; // code -> domain_id

    for (const d of domains) {
      // Find domain by name first or by code
      const existingByName = db.prepare('SELECT id, code, name FROM domains WHERE name = ?').get(d.name);
      const existingByCode = db.prepare('SELECT id, code, name FROM domains WHERE code = ?').get(d.code);

      let domainId;
      if (existingByName) {
        domainId = existingByName.id;
        db.prepare(`
          UPDATE domains
          SET code = ?, icon = ?, description = ?
          WHERE id = ?
        `).run(d.code, d.icon, d.description, domainId);
      } else if (existingByCode) {
        domainId = existingByCode.id;
        db.prepare(`
          UPDATE domains
          SET name = ?, icon = ?, description = ?
          WHERE id = ?
        `).run(d.name, d.icon, d.description, domainId);
      } else {
        const res = db.prepare(`
          INSERT INTO domains (code, name, icon, description)
          VALUES (?, ?, ?, ?)
        `).run(d.code, d.name, d.icon, d.description);
        domainId = res.lastInsertRowid;
      }
      domainMap[d.code] = domainId;
    }

    console.log(`✅ Verified/synchronized 16 domains.`);

    // 3. Upsert Official 160 Problem Statements
    const officialCodes = new Set(problems.map(p => p.code));
    let updatedCount = 0;
    let insertedCount = 0;

    for (const p of problems) {
      const domainId = domainMap[p.domainCode];
      if (!domainId) {
        throw new Error(`Domain code ${p.domainCode} not found for problem ${p.code}`);
      }

      const existingProblem = db.prepare('SELECT id, problem_code, status FROM problem_statements WHERE problem_code = ?').get(p.code);

      if (existingProblem) {
        // Update problem preserving its ID and existing status (so if it was ASSIGNED, it remains ASSIGNED!)
        db.prepare(`
          UPDATE problem_statements
          SET domain_id = ?,
              title = ?,
              description = ?,
              detailed_requirements = ?,
              expected_outcome = ?,
              difficulty = 'Medium',
              tags = '[]',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          domainId,
          p.title,
          p.description,
          p.description,
          p.description,
          existingProblem.id
        );
        updatedCount++;
      } else {
        // Insert new problem statement
        db.prepare(`
          INSERT INTO problem_statements (
            problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'Medium', '[]', 'AVAILABLE')
        `).run(
          p.code,
          domainId,
          p.title,
          p.description,
          p.description,
          p.description
        );
        insertedCount++;
      }
    }

    console.log(`✅ Upserted official problems: ${updatedCount} updated, ${insertedCount} inserted.`);

    // 4. Clean up any obsolete non-official problems (only if NOT referenced by any assignment)
    const allProblems = db.prepare('SELECT id, problem_code FROM problem_statements').all();
    let removedCount = 0;

    for (const p of allProblems) {
      if (!officialCodes.has(p.problem_code)) {
        const isAssigned = db.prepare('SELECT id FROM problem_assignments WHERE problem_statement_id = ?').get(p.id);
        if (isAssigned) {
          console.warn(`⚠️ Obsolete problem ${p.problem_code} (id ${p.id}) has active assignment. Retaining for safety.`);
        } else {
          db.prepare('DELETE FROM problem_statements WHERE id = ?').run(p.id);
          removedCount++;
        }
      }
    }

    console.log(`✅ Removed ${removedCount} obsolete unassigned problem statements.`);

    // 5. Audit & Validate Final Counts
    const finalProblemCount = db.prepare('SELECT COUNT(*) as count FROM problem_statements').get().count;
    const finalDomainCount = db.prepare('SELECT COUNT(*) as count FROM domains').get().count;
    const finalAssignmentsCount = db.prepare('SELECT COUNT(*) as count FROM problem_assignments').get().count;

    console.log('\n--- MIGRATION VALIDATION ---');
    console.log(`Final Problem Statements Count: ${finalProblemCount}`);
    console.log(`Final Domains Count: ${finalDomainCount}`);
    console.log(`Final Preserved Assignments: ${finalAssignmentsCount}`);

    if (finalProblemCount !== 160) {
      throw new Error(`Migration error: Expected exactly 160 problems, got ${finalProblemCount}`);
    }
    if (finalDomainCount !== 16) {
      throw new Error(`Migration error: Expected exactly 16 domains, got ${finalDomainCount}`);
    }

    // Verify 10 problems per domain
    const distribution = db.prepare(`
      SELECT d.code, d.name, COUNT(p.id) as count
      FROM domains d
      JOIN problem_statements p ON d.id = p.domain_id
      GROUP BY d.id
      ORDER BY d.id
    `).all();

    for (const row of distribution) {
      if (row.count !== 10) {
        throw new Error(`Migration error: Domain ${row.code} (${row.name}) has ${row.count} problems instead of 10`);
      }
    }
    console.log('✅ Every domain has exactly 10 problems!');

    // Check duplicate codes
    const duplicateCodes = db.prepare(`
      SELECT problem_code, COUNT(*) as c
      FROM problem_statements
      GROUP BY problem_code
      HAVING c > 1
    `).all();

    if (duplicateCodes.length > 0) {
      throw new Error(`Migration error: Found duplicate problem codes: ${JSON.stringify(duplicateCodes)}`);
    }
    console.log('✅ Zero duplicate problem codes!');

    // Check duplicate titles
    const duplicateTitles = db.prepare(`
      SELECT title, COUNT(*) as c
      FROM problem_statements
      GROUP BY title
      HAVING c > 1
    `).all();

    if (duplicateTitles.length > 0) {
      throw new Error(`Migration error: Found duplicate problem titles: ${JSON.stringify(duplicateTitles)}`);
    }
    console.log('✅ Zero duplicate problem titles!');
  });

  runMigration();
  console.log('🎉 Migration completed successfully!\n');
}

if (require.main === module) {
  migrateOfficialProblems();
}

module.exports = { migrateOfficialProblems };
