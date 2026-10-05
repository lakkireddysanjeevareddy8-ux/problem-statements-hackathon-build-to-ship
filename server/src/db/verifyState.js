const db = require('./index');

console.log('=== DATABASE VERIFICATION ===');
const totalProblems = db.prepare('SELECT COUNT(*) as c FROM problem_statements').get().c;
console.log('Total problems in DB:', totalProblems);

const availableProblems = db.prepare("SELECT COUNT(*) as c FROM problem_statements WHERE status = 'AVAILABLE'").get().c;
console.log('Available problems:', availableProblems);

const assignedProblems = db.prepare("SELECT COUNT(*) as c FROM problem_statements WHERE status = 'ASSIGNED'").get().c;
console.log('Assigned problems:', assignedProblems);

const totalDomains = db.prepare('SELECT COUNT(*) as c FROM domains').get().c;
console.log('Total domains in DB:', totalDomains);

console.log('\n--- DOMAINS & COUNTS ---');
const domainRows = db.prepare(`
  SELECT d.id, d.code, d.name, COUNT(p.id) as count
  FROM domains d
  LEFT JOIN problem_statements p ON d.id = p.domain_id
  GROUP BY d.id
  ORDER BY d.id
`).all();

for (const d of domainRows) {
  console.log(`Domain ${d.id.toString().padStart(2)}: [${d.code.padEnd(2)}] ${d.name.padEnd(36)} -> ${d.count} problems`);
}

console.log('\n--- CHECK DUPLICATE CODES ---');
const dupCodes = db.prepare('SELECT problem_code, COUNT(*) as c FROM problem_statements GROUP BY problem_code HAVING c > 1').all();
console.log('Duplicate codes:', dupCodes.length === 0 ? 'NONE (ALL UNIQUE)' : dupCodes);

console.log('\n--- CHECK DUPLICATE TITLES ---');
const dupTitles = db.prepare('SELECT title, COUNT(*) as c FROM problem_statements GROUP BY title HAVING c > 1').all();
console.log('Duplicate titles:', dupTitles.length === 0 ? 'NONE (ALL UNIQUE)' : dupTitles);

console.log('\n--- SAMPLE PROBLEMS PER DOMAIN ---');
const sample = db.prepare('SELECT problem_code, title FROM problem_statements WHERE problem_code IN (\'A1\', \'H1\', \'E1\', \'S1\', \'P1\', \'F1\', \'R1\', \'C1\', \'T1\', \'J1\', \'G1\', \'HC1\', \'FN1\', \'MW1\', \'CS1\', \'SA1\') ORDER BY id').all();
for (const s of sample) {
  console.log(`  ${s.problem_code.padEnd(4)}: ${s.title}`);
}

console.log('\n--- ASSIGNMENTS IN DB ---');
const assignments = db.prepare(`
  SELECT a.id, a.selected_at, p.problem_code, p.title, u.name as participant_name, u.niat_id
  FROM problem_assignments a
  JOIN problem_statements p ON a.problem_statement_id = p.id
  JOIN users u ON a.user_id = u.id
`).all();
console.log(`Total assignments: ${assignments.length}`);
for (const a of assignments) {
  console.log(`  Assignment #${a.id}: Problem ${a.problem_code} (${a.title}) -> ${a.participant_name} (${a.niat_id})`);
}
