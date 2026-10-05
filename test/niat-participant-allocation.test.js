/**
 * NIAT Participant Authentication & Permanent Problem Allocation Test Suite
 * Tests Scenarios 1 through 9 from Section 18 of the specification.
 */
const http = require('http');
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

async function runNiatTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING NIAT PARTICIPANT & PERMANENT ALLOCATION TEST SUITE');
  console.log('   Scenarios 1 through 9 (Section 18 Specifications)');
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
  db.prepare("DELETE FROM problem_assignments WHERE user_id IN (SELECT id FROM users WHERE niat_id LIKE 'NIAT_TEST_%')").run();
  db.prepare("DELETE FROM problem_assignments WHERE problem_statement_id IN (SELECT id FROM problem_statements WHERE problem_code IN ('AG-01', 'AG-02', 'AG-03', 'A1', 'A2', 'A3'))").run();
  db.prepare("DELETE FROM users WHERE niat_id LIKE 'NIAT_TEST_%'").run();
  // Ensure problems A1/AG-01, A2/AG-02, A3/AG-03 are AVAILABLE and selection is OPEN
  db.prepare("UPDATE problem_statements SET status = 'AVAILABLE' WHERE problem_code IN ('AG-01', 'AG-02', 'AG-03', 'A1', 'A2', 'A3')").run();
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
    // -------------------------------------------------------------
    // TEST 1 — New Participant
    // Name: Student A, NIAT ID: NIAT_TEST_001
    // Expected: Account created
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 1: New participant registration/login');
    const studentA = { name: 'Student A', niatId: 'NIAT_TEST_001' };
    const regResA = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: studentA
    });

    assert(regResA.status === 200, 'Test 1.1: Registration returns HTTP 200');
    assert(regResA.data.success === true, 'Test 1.2: Success flag is true');
    assert(regResA.data.user.name === 'Student A', 'Test 1.3: User name matches Student A');
    assert(regResA.data.user.niat_id === 'NIAT_TEST_001', 'Test 1.4: NIAT ID matches normalized NIAT_TEST_001');
    assert(regResA.data.user.role === 'PARTICIPANT', 'Test 1.5: Role is PARTICIPANT');
    assert(Boolean(regResA.data.token), 'Test 1.6: JWT session token returned');
    assert(regResA.data.assignedProblem === null, 'Test 1.7: No problem initially assigned');

    const tokenA = regResA.data.token;
    const userA = regResA.data.user;

    // -------------------------------------------------------------
    // TEST 2 — Login Again with same NIAT ID and Name
    // Expected: Same participant account, No duplicate account
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 2: Existing participant logs in again');
    const reloginResA = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Student A', niatId: 'niat_test_001' } // lower case to test normalization
    });

    assert(reloginResA.status === 200, 'Test 2.1: Re-login returns HTTP 200');
    assert(reloginResA.data.user.id === userA.id, 'Test 2.2: Returns exact same participant ID');
    assert(reloginResA.data.user.niat_id === 'NIAT_TEST_001', 'Test 2.3: NIAT ID preserved');

    const countA = db.prepare('SELECT COUNT(*) as count FROM users WHERE niat_id = ?').get('NIAT_TEST_001');
    assert(countA.count === 1, 'Test 2.4: Database confirms exactly ONE account exists for NIAT_TEST_001');

    // -------------------------------------------------------------
    // TEST 3 — Same NIAT ID with different name
    // Try registering another name with: NIAT_TEST_001
    // Expected: Rejected
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 3: Attempting same NIAT ID with different name');
    const mismatchRes = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Imposter Student', niatId: 'NIAT_TEST_001' }
    });

    assert(mismatchRes.status === 409, 'Test 3.1: Mismatched name returns HTTP 409 Conflict');
    assert(mismatchRes.data.success === false, 'Test 3.2: Request rejected');
    assert(/already\s+registered\s+with\s+a\s+different\s+name/i.test(mismatchRes.data.message), 'Test 3.3: Error message indicates NIAT ID is already registered with a different name');

    // -------------------------------------------------------------
    // TEST 4 — Select Problem
    // Student A selects Problem A (e.g. AG-01 / A1)
    // Expected: Problem A -> LOCKED, Student A -> Problem A
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 4: Student A selects Problem A');
    const p1 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-01', 'A1') LIMIT 1").get();
    assert(Boolean(p1), `Test 4.1: Found target Problem A (${p1 ? p1.problem_code : 'none'})`);

    const selectResA = await makeRequest(`/api/problems/${p1.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (selectResA.status !== 200) {
      console.log('DEBUG selectResA failure:', selectResA.status, selectResA.data);
    }

    assert(selectResA.status === 200, 'Test 4.2: Problem selection returns HTTP 200');
    assert(selectResA.data.success === true, 'Test 4.3: Selection success flag is true');
    assert(selectResA.data.assignment?.status === 'LOCKED', 'Test 4.4: Problem assignment status is LOCKED');

    // Verify GET /api/my-problem
    const myProblemResA = await makeRequest('/api/my-problem', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(myProblemResA.status === 200 && myProblemResA.data.hasSelected === true, 'Test 4.5: GET /api/my-problem shows hasSelected = true');
    assert(myProblemResA.data.assignment.problem.code === p1.problem_code, 'Test 4.6: Problem code matches selected Problem A');
    assert(myProblemResA.data.assignment.participant.niat_id === 'NIAT_TEST_001', 'Test 4.7: Assignment participant NIAT ID matches NIAT_TEST_001');

    // -------------------------------------------------------------
    // TEST 5 — Same Student tries another problem
    // Expected: Rejected
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 5: Student A attempts to select a second problem');
    const p2 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-02', 'A2') LIMIT 1").get();

    const selectSecondRes = await makeRequest(`/api/problems/${p2.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    assert(selectSecondRes.status === 409, 'Test 5.1: Second problem selection returns HTTP 409 Conflict');
    assert(selectSecondRes.data.success === false, 'Test 5.2: Request rejected');
    assert(/already\s+selected\s+a\s+problem\s+statement/i.test(selectSecondRes.data.message), 'Test 5.3: Error message explains participant already has a locked problem');

    // -------------------------------------------------------------
    // TEST 6 — Another student tries Problem A
    // Expected: Rejected
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 6: Student B attempts to select already locked Problem A');
    const studentB = { name: 'Student B', niatId: 'NIAT_TEST_002' };
    const regResB = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: studentB
    });
    const tokenB = regResB.data.token;

    const selectTakenRes = await makeRequest(`/api/problems/${p1.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    assert(selectTakenRes.status === 409, 'Test 6.1: Attempting to select taken problem returns HTTP 409 Conflict');
    assert(selectTakenRes.data.success === false, 'Test 6.2: Selection rejected');
    assert(/already\s+been\s+selected|just\s+selected/i.test(selectTakenRes.data.message), 'Test 6.3: Error message indicates problem was already selected');

    // Available problems listing should NOT show Problem A to Student B
    const availableRes = await makeRequest('/api/problems', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const codes = (availableRes.data.problems || []).map(p => p.problem_code);
    assert(!codes.includes(p1.problem_code), 'Test 6.4: Problem A is removed from available problem listings');

    // -------------------------------------------------------------
    // TEST 7 — Logout/login
    // Student A logs out and logs in again
    // Expected: Previously selected Problem A is still assigned
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 7: Logout and login persistence check');
    const logoutRes = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(logoutRes.status === 200, 'Test 7.1: Logout returns HTTP 200');

    // Student A logs in again with NIAT ID
    const loginAgainRes = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: studentA
    });

    assert(loginAgainRes.status === 200, 'Test 7.2: Re-login succeeds');
    assert(loginAgainRes.data.assignedProblem !== null, 'Test 7.3: assignedProblem automatically returned in login response');
    assert(loginAgainRes.data.assignedProblem.problem_code === p1.problem_code, 'Test 7.4: Problem A remains permanently assigned');

    // -------------------------------------------------------------
    // TEST 8 — Concurrent selection race condition
    // Simulate multiple participants attempting to select the same problem simultaneously
    // Expected: Exactly ONE assignment succeeds. All other attempts fail safely.
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 8: Concurrent selection race condition test');
    const p3 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-03', 'A3') LIMIT 1").get();
    assert(Boolean(p3), `Test 8.1: Found target Problem C (${p3 ? p3.problem_code : 'none'})`);

    const [candC, candD] = await Promise.all([
      makeRequest('/api/participants/login', { method: 'POST', body: { name: 'Candidate C', niatId: 'NIAT_TEST_003' } }),
      makeRequest('/api/participants/login', { method: 'POST', body: { name: 'Candidate D', niatId: 'NIAT_TEST_004' } })
    ]);

    const tokenC = candC.data.token;
    const tokenD = candD.data.token;

    // Concurrently trigger selection for p3
    const [race1, race2] = await Promise.all([
      makeRequest(`/api/problems/${p3.problem_code}/select`, { method: 'POST', headers: { Authorization: `Bearer ${tokenC}` } }),
      makeRequest(`/api/problems/${p3.problem_code}/select`, { method: 'POST', headers: { Authorization: `Bearer ${tokenD}` } })
    ]);

    const statuses = [race1.status, race2.status];
    assert(statuses.includes(200), 'Test 8.2: Exactly one concurrent request succeeded (HTTP 200)');
    assert(statuses.includes(409), 'Test 8.3: The conflicting concurrent request was rejected (HTTP 409)');

    const countP3 = db.prepare('SELECT COUNT(*) as count FROM problem_assignments WHERE problem_statement_id = ?').get(p3.id);
    assert(countP3.count === 1, 'Test 8.4: Database constraint ensures exactly 1 assignment created');

    // -------------------------------------------------------------
    // TEST 9 — Admin visibility & Privacy protection
    // Admin can see Student A -> Problem A.
    // Participant cannot see other participants' assignments.
    // -------------------------------------------------------------
    console.log('\n🔹 TEST 9: Admin visibility & participant privacy protection');
    // Admin login
    const adminLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hackathon.org', password: 'AdminSecureHackathon2026!' }
    });
    assert(adminLoginRes.status === 200, 'Test 9.1: Admin login succeeds');
    const adminToken = adminLoginRes.data.token;

    // Admin participants list
    const adminPartsRes = await makeRequest('/api/admin/participants', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminPartsRes.status === 200, 'Test 9.2: Admin can fetch participants list');

    const adminStudentA = (adminPartsRes.data.participants || []).find(p => p.niat_id === 'NIAT_TEST_001');
    assert(Boolean(adminStudentA), 'Test 9.3: Admin can view Student A');
    assert(adminStudentA && adminStudentA.problem_code === p1.problem_code, 'Test 9.4: Admin can see Student A assigned to Problem A');

    // Participant blocked from admin endpoints
    const forbiddenRes = await makeRequest('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(forbiddenRes.status === 403, 'Test 9.5: Participant receives 403 Forbidden when accessing Admin API');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runNiatTests();
