/**
 * Comprehensive Acceptance Test Suite
 * Tests all 10 scenarios described in Section 40 of Master Prompt.
 */
const http = require('http');
const app = require('../server/src/app');
const db = require('../server/src/db');
const seed = require('../server/src/db/seed');

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

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ACCEPTANCE TESTS (10 CRITICAL SCENARIOS)');
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

  // Re-seed DB for clean test state
  // Clean assignments first
  db.prepare('DELETE FROM problem_assignments').run();
  db.prepare("DELETE FROM users WHERE email LIKE '%@test.com'").run();
  db.prepare("UPDATE problem_statements SET status = 'AVAILABLE'").run();
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
    // SETUP: Register Participants A, B, C and Admin Login
    // -------------------------------------------------------------
    console.log('📋 Setup: Registering test participants...');
    const pARes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Participant A', email: 'partA@test.com', password: 'Password123!', team_name: 'Team Alpha' }
    });
    const tokenA = pARes.data.token;
    const userA = pARes.data.user;

    const pBRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Participant B', email: 'partB@test.com', password: 'Password123!', team_name: 'Team Beta' }
    });
    const tokenB = pBRes.data.token;

    const pCRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Participant C', email: 'partC@test.com', password: 'Password123!', team_name: 'Team Gamma' }
    });
    const tokenC = pCRes.data.token;

    const adminLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hackathon.org', password: 'AdminSecureHackathon2026!' }
    });
    const adminToken = adminLoginRes.data.token;

    // -------------------------------------------------------------
    // TEST 1: Participant A selects problem A1. A1 becomes locked.
    // Participant B checks available problems -> A1 must NOT be visible.
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Selection & Non-availability for other participants ---');
    // Find problem A1
    const pA1 = db.prepare("SELECT id, problem_code FROM problem_statements WHERE problem_code = 'A1'").get();
    assert(pA1 && pA1.problem_code === 'A1', 'Problem A1 exists in database');

    // Participant A selects A1
    const selectResA = await makeRequest(`/api/problems/${pA1.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(selectResA.status === 200 && selectResA.data.success === true, 'Participant A successfully selected and locked A1');

    // Check my-problem for Participant A
    const myProblemA = await makeRequest('/api/my-problem', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(myProblemA.data.hasSelected === true && myProblemA.data.assignment.problem.code === 'A1', 'Participant A sees locked A1 in My Problem page');

    // Participant B fetches available problems
    const listResB = await makeRequest('/api/problems', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const foundA1InAvailable = listResB.data.problems.find(p => p.problem_code === 'A1');
    assert(foundA1InAvailable === undefined, 'Problem A1 is completely removed from Participant B available problems list');

    // -------------------------------------------------------------
    // TEST 2: Participant A attempts to select another problem (e.g. A2)
    // Backend must reject with 409 Conflict.
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Prevent double selection for same user ---');
    const pA2 = db.prepare("SELECT id, problem_code FROM problem_statements WHERE problem_code = 'A2'").get();
    const selectAgainRes = await makeRequest(`/api/problems/${pA2.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(selectAgainRes.status === 409, 'Backend rejects second problem selection with status 409 Conflict');
    assert(selectAgainRes.data.code === 'USER_ALREADY_ASSIGNED', 'Error code specifies USER_ALREADY_ASSIGNED');

    // -------------------------------------------------------------
    // TEST 3: Simultaneous selection race condition
    // Participant B and C attempt to select A3 at the exact same time
    // Exactly ONE succeeds; other receives Conflict 409
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Concurrent atomic race condition handling ---');
    const pA3 = db.prepare("SELECT id, problem_code FROM problem_statements WHERE problem_code = 'A3'").get();

    const [raceResB, raceResC] = await Promise.all([
      makeRequest(`/api/problems/${pA3.id}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenB}` }
      }),
      makeRequest(`/api/problems/${pA3.id}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenC}` }
      })
    ]);

    const statuses = [raceResB.status, raceResC.status].sort();
    assert(statuses[0] === 200 && statuses[1] === 409, `Concurrent selection resolved atomically: one 200, one 409 (got ${statuses[0]}, ${statuses[1]})`);

    // Verify database has exactly 1 assignment for A3
    const a3Assignments = db.prepare('SELECT COUNT(*) as count FROM problem_assignments WHERE problem_statement_id = ?').get(pA3.id).count;
    assert(a3Assignments === 1, 'Database constraint ensured exactly 1 assignment created for A3');

    // -------------------------------------------------------------
    // TEST 4: Direct attempt to select already assigned problem
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Reject selection of already assigned problem ---');
    const loserToken = raceResB.status === 409 ? tokenB : tokenC;
    const retryRes = await makeRequest(`/api/problems/${pA3.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loserToken}` }
    });
    assert(retryRes.status === 409, 'Subsequent attempt to select already assigned problem returns 409 Conflict');

    // -------------------------------------------------------------
    // TEST 5: Privacy isolation
    // Participant cannot access someone else\'s assignment
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Privacy & Assignment isolation ---');
    const myProblemLoser = await makeRequest('/api/my-problem', {
      headers: { Authorization: `Bearer ${loserToken}` }
    });
    assert(myProblemLoser.data.hasSelected === false, 'Unassigned user receives hasSelected: false without seeing other assignments');

    // -------------------------------------------------------------
    // TEST 6: Non-admin participant cannot access Admin API
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Role authorization - Participant blocked from Admin API ---');
    const adminAccessAttempt = await makeRequest('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(adminAccessAttempt.status === 403, 'Participant receives 403 Forbidden when attempting to access /api/admin/dashboard');

    // -------------------------------------------------------------
    // TEST 7: Admin can see participants, problems, and assignments
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Admin Dashboard Visibility ---');
    const adminDash = await makeRequest('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminDash.status === 200 && adminDash.data.stats.selected_problems >= 2, 'Admin can view overall metrics and selected problem counts');

    const adminParticipants = await makeRequest('/api/admin/participants', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundPartA = adminParticipants.data.participants.find(p => p.email.toLowerCase() === 'parta@test.com');
    assert(foundPartA && foundPartA.problem_code === 'A1', 'Admin can see Participant A assigned to A1 with timestamp');

    // -------------------------------------------------------------
    // TEST 8: Admin Export CSV
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Admin CSV Export ---');
    const exportRes = await makeRequest('/api/admin/export', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(exportRes.status === 200, 'Admin can download export CSV');
    assert(exportRes.headers['content-type'].includes('text/csv'), 'Content-type is text/csv');
    assert(exportRes.data.toLowerCase().includes('parta@test.com') && exportRes.data.includes('A1'), 'CSV contains participant A and problem A1 details');

    // -------------------------------------------------------------
    // TEST 9: Admin closes selection window -> participants blocked
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Hackathon Closed Mode prevents selection ---');
    await makeRequest('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { selection_status: 'CLOSED' }
    });

    // Unassigned participant tries to select an available problem (e.g. A4)
    const pA4 = db.prepare("SELECT id, problem_code FROM problem_statements WHERE problem_code = 'A4'").get();
    const closedSelectRes = await makeRequest(`/api/problems/${pA4.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loserToken}` }
    });
    assert(closedSelectRes.status === 403, 'Selection blocked with 403 when hackathon selection_status is CLOSED');

    // Reopen for normal operation
    await makeRequest('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { selection_status: 'OPEN' }
    });

    // -------------------------------------------------------------
    // TEST 10: Participant logs out and logs back in -> problem remains locked!
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Persistent assignment across logout/login ---');
    // Logout Participant A
    await makeRequest('/api/auth/logout', { method: 'POST' });

    // Login Participant A again
    const reloginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'partA@test.com', password: 'Password123!' }
    });
    assert(reloginRes.status === 200, 'Participant A logs in again successfully');
    assert(reloginRes.data.assignedProblem && reloginRes.data.assignedProblem.problem_code === 'A1', 'Login response includes persistent locked problem A1');

    const verifyMyProblemAfterRelogin = await makeRequest('/api/my-problem', {
      headers: { Authorization: `Bearer ${reloginRes.data.token}` }
    });
    assert(verifyMyProblemAfterRelogin.data.hasSelected === true && verifyMyProblemAfterRelogin.data.assignment.problem.code === 'A1', 'Assignment permanently retained and verified via /api/my-problem');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n=============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
