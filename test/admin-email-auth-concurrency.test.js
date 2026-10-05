/**
 * Comprehensive Test Suite for:
 * 1. Participant Access (Name + NIAT ID)
 * 2. Authorized Email Admin Access & Protection
 * 3. 140+ Concurrent Participant Load & Race Condition Test
 *
 * Covers Scenarios 1 through 20 of the specification.
 */
const http = require('http');
process.env.ADMIN_EMAILS = 'lead_admin@hackathon.org,coordinator@hackathon.org,super_admin@hackathon.org';

const app = require('../server/src/app');
const db = require('../server/src/db');

let server;
let port;
let baseUrl;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = options.headers || {};
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, {
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING PARTICIPANT & AUTHORIZED ADMIN AUTH TEST SUITE');
  console.log('   All 20 Validation Scenarios (Section 23 Specifications)');
  console.log('=============================================================\n');

  // Start server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });

  // Clean test data
  db.prepare("DELETE FROM problem_assignments WHERE user_id IN (SELECT id FROM users WHERE niat_id LIKE 'TEST_P_%' OR niat_id LIKE 'NIAT_CONC_%')").run();
  db.prepare("DELETE FROM users WHERE niat_id LIKE 'TEST_P_%' OR niat_id LIKE 'NIAT_CONC_%'").run();
  db.prepare("DELETE FROM users WHERE email IN ('lead_admin@hackathon.org', 'coordinator@hackathon.org', 'super_admin@hackathon.org', 'unauthorized@hackathon.org')").run();
  db.prepare("DELETE FROM problem_assignments WHERE problem_statement_id IN (SELECT id FROM problem_statements WHERE problem_code IN ('A1', 'A2', 'A3', 'A4', 'AG-01', 'AG-02', 'AG-03', 'AG-04'))").run();
  db.prepare("UPDATE problem_statements SET status = 'AVAILABLE' WHERE problem_code IN ('A1', 'A2', 'A3', 'A4', 'AG-01', 'AG-02', 'AG-03', 'AG-04')").run();
  db.prepare("UPDATE system_settings SET value = 'OPEN' WHERE key = 'selection_status'").run();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // =============================================================
    // SECTION A: PARTICIPANT AUTHENTICATION & ALLOCATION (Tests 1 - 7)
    // =============================================================
    console.log('\n📋 SECTION A: Participant Verification (Tests 1 - 7)');

    // Test 1: New NIAT ID -> account created
    const p1 = { name: 'Rahul Sharma', niatId: 'TEST_P_001' };
    const res1 = await makeRequest('/api/participants/login', { method: 'POST', body: p1 });
    assert(res1.status === 200, 'Test 1.1: New NIAT ID returns 200');
    assert(res1.data.user?.niat_id === 'TEST_P_001', 'Test 1.2: Account created with normalized NIAT ID');
    assert(res1.data.user?.role === 'PARTICIPANT', 'Test 1.3: User role is PARTICIPANT');
    const tokenP1 = res1.data.token;
    const userP1 = res1.data.user;

    // Test 2: Existing NIAT ID -> same account retrieved
    const res2 = await makeRequest('/api/participants/login', { method: 'POST', body: { name: 'Rahul Sharma', niatId: 'test_p_001' } });
    assert(res2.status === 200, 'Test 2.1: Re-login with same NIAT ID returns 200');
    assert(res2.data.user?.id === userP1.id, 'Test 2.2: Same internal account returned');

    // Test 3: Duplicate NIAT ID -> no duplicate account
    const countP1 = db.prepare('SELECT COUNT(*) as count FROM users WHERE niat_id = ?').get('TEST_P_001');
    assert(countP1.count === 1, 'Test 3.1: Exactly 1 record exists in database for TEST_P_001');

    // Test 4: Participant selects one problem -> assignment locked
    const problem1 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-01', 'A1') LIMIT 1").get();
    const selectRes1 = await makeRequest(`/api/problems/${problem1.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenP1}` }
    });
    assert(selectRes1.status === 200, 'Test 4.1: Problem selection returns 200');
    assert(selectRes1.data.assignment?.status === 'LOCKED', 'Test 4.2: Assignment status is LOCKED');

    // Test 5: Participant attempts second problem -> rejected
    const problem2 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-02', 'A2') LIMIT 1").get();
    const selectRes2 = await makeRequest(`/api/problems/${problem2.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenP1}` }
    });
    assert(selectRes2.status === 409, 'Test 5.1: Attempting second problem returns 409 Conflict');
    assert(/already\s+selected\s+a\s+problem/i.test(selectRes2.data.message), 'Test 5.2: Explains participant already has a locked problem');

    // Test 6: Another participant attempts assigned problem -> rejected
    const resP2 = await makeRequest('/api/participants/login', { method: 'POST', body: { name: 'Priya Patel', niatId: 'TEST_P_002' } });
    const tokenP2 = resP2.data.token;
    const selectTaken = await makeRequest(`/api/problems/${problem1.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenP2}` }
    });
    assert(selectTaken.status === 409, 'Test 6.1: Attempting assigned problem returns 409 Conflict');
    assert(/already\s+been\s+selected|just\s+selected/i.test(selectTaken.data.message), 'Test 6.2: Explains problem is unavailable');

    // Test 7: Logout/login -> same assignment remains
    await makeRequest('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${tokenP1}` } });
    const resRelogin = await makeRequest('/api/participants/login', { method: 'POST', body: p1 });
    assert(resRelogin.status === 200, 'Test 7.1: Re-login returns 200');
    assert(resRelogin.data.assignedProblem?.problem_code === problem1.problem_code, 'Test 7.2: Selected problem remains permanently assigned after logout/login');

    // =============================================================
    // SECTION B: ADMIN AUTHORIZATION & PROTECTION (Tests 8 - 15)
    // =============================================================
    console.log('\n📋 SECTION B: Admin Email Authorization (Tests 8 - 15)');

    // Test 8: Authorized email -> ADMIN role
    const adminRes1 = await makeRequest('/api/auth/admin-login', {
      method: 'POST',
      body: { email: 'lead_admin@hackathon.org' }
    });
    assert(adminRes1.status === 200, 'Test 8.1: Authorized admin email returns 200');
    assert(adminRes1.data.user?.role === 'ADMIN', 'Test 8.2: User role is ADMIN');
    const adminToken = adminRes1.data.token;

    // Test 9: Authorized email -> session enables /admin API access
    const dashRes = await makeRequest('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dashRes.status === 200, 'Test 9.1: Admin session allows access to /api/admin/dashboard');
    assert(dashRes.data.stats?.total_problems === 160, 'Test 9.2: Dashboard returns real stats (160 total problems)');

    // Test 10: Unauthorized email -> rejected with 403
    const unauthRes = await makeRequest('/api/auth/admin-login', {
      method: 'POST',
      body: { email: 'unauthorized@hackathon.org' }
    });
    assert(unauthRes.status === 403, 'Test 10.1: Unauthorized admin email returns 403 Forbidden');
    assert(unauthRes.data.message === 'This email is not authorized for administrator access.', 'Test 10.2: Exact rejection message returned');

    // Test 11: Participant attempts /admin access with participant session -> rejected
    const partAdminRes = await makeRequest('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${tokenP1}` }
    });
    assert(partAdminRes.status === 403, 'Test 11: Participant session blocked from /admin API with 403 Forbidden');

    // Test 12: Participant attempts admin participants list -> rejected
    const partPartsRes = await makeRequest('/api/admin/participants', {
      headers: { Authorization: `Bearer ${tokenP1}` }
    });
    assert(partPartsRes.status === 403, 'Test 12: Participant blocked from admin participants API');

    // Test 13: Admin refreshes /admin -> session persists via /api/auth/me
    const meRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(meRes.status === 200, 'Test 13.1: Admin session verified via /api/auth/me');
    assert(meRes.data.user?.role === 'ADMIN', 'Test 13.2: Role remains ADMIN');

    // Test 14: Admin logout -> session invalidated
    const adminLogout = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminLogout.status === 200, 'Test 14: Admin logout returns 200');

    // Test 15: Multiple authorized admin emails & case insensitivity
    const adminRes2 = await makeRequest('/api/auth/admin-login', {
      method: 'POST',
      body: { email: 'COORDINATOR@hackathon.org ' } // Upper case with trailing space to test normalization
    });
    assert(adminRes2.status === 200, 'Test 15.1: Second authorized admin email (uppercase with spaces) returns 200');
    assert(adminRes2.data.user?.role === 'ADMIN', 'Test 15.2: Role is ADMIN for second admin');

    const adminRes3 = await makeRequest('/api/auth/admin-login', {
      method: 'POST',
      body: { email: 'super_admin@hackathon.org' }
    });
    assert(adminRes3.status === 200, 'Test 15.3: Third authorized admin email returns 200');

    // =============================================================
    // SECTION C: 140 CONCURRENT PARTICIPANTS & RACE CONDITIONS (Tests 16 - 20)
    // =============================================================
    console.log('\n📋 SECTION C: Concurrency & Stress Testing (Tests 16 - 20)');

    // Test 16: Simulate 140 participant registrations/logins
    console.log('  ⏳ Concurrently registering 140 participants (NIAT_CONC_001 to NIAT_CONC_140)...');
    const registrationPromises = [];
    for (let i = 1; i <= 140; i++) {
      const pad = String(i).padStart(3, '0');
      registrationPromises.push(
        makeRequest('/api/participants/login', {
          method: 'POST',
          body: { name: `Student ${pad}`, niatId: `NIAT_CONC_${pad}` }
        })
      );
    }

    const regResults = await Promise.all(registrationPromises);
    const successfulRegs = regResults.filter(r => r.status === 200 && r.data.success);
    assert(successfulRegs.length === 140, `Test 16: All 140 concurrent participant registrations succeeded (got ${successfulRegs.length})`);

    // Test 18: Verify no duplicate participant accounts
    const totalConcUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE niat_id LIKE 'NIAT_CONC_%'").get();
    assert(totalConcUsers.count === 140, `Test 18: Database contains exactly 140 accounts (got ${totalConcUsers.count})`);

    // Test 17: Simulate 50 simultaneous participants racing for the exact same problem statement (Problem A4 / AG-04)
    const raceProblem = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-04', 'A4') LIMIT 1").get();
    console.log(`  ⏳ Simulating 50 participants simultaneously racing for Problem ${raceProblem.problem_code}...`);

    const racePromises = [];
    for (let i = 1; i <= 50; i++) {
      const userToken = successfulRegs[i - 1].data.token;
      racePromises.push(
        makeRequest(`/api/problems/${raceProblem.problem_code}/select`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${userToken}` }
        })
      );
    }

    const raceResults = await Promise.all(racePromises);
    const successSelections = raceResults.filter(r => r.status === 200 && r.data.success);
    const conflictSelections = raceResults.filter(r => r.status === 409);

    assert(successSelections.length === 1, `Test 17.1: Exactly ONE concurrent selection succeeded (got ${successSelections.length})`);
    assert(conflictSelections.length === 49, `Test 17.2: Exactly 49 conflicting requests safely rejected with 409 (got ${conflictSelections.length})`);

    // Test 19: Verify no duplicate problem assignments in database
    const assignmentRows = db.prepare('SELECT COUNT(*) as count FROM problem_assignments WHERE problem_statement_id = ?').get(raceProblem.id);
    assert(assignmentRows.count === 1, `Test 19: Exactly 1 assignment record exists in problem_assignments table (got ${assignmentRows.count})`);

    // Test 20: Verify database remains consistent
    const problemRecord = db.prepare('SELECT status FROM problem_statements WHERE id = ?').get(raceProblem.id);
    assert(problemRecord.status === 'ASSIGNED', 'Test 20: Problem statement status is permanently set to ASSIGNED');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================================');
  console.log(`📊 FINAL TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
