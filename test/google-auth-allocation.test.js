/**
 * Google Sign-In & Permanent Allocation Automated Test Suite
 * Tests Scenarios A through H from Section 24 of the specification.
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

async function runGoogleAuthTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING GOOGLE AUTH & PERMANENT ALLOCATION TEST SUITE');
  console.log('   Scenarios A through H (Section 24 Specifications)');
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
  db.prepare("DELETE FROM problem_assignments WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@google-test.com')").run();
  db.prepare("DELETE FROM problem_assignments WHERE problem_statement_id IN (SELECT id FROM problem_statements WHERE problem_code IN ('AG-01', 'AG-02', 'AG-05', 'A1', 'A2', 'A5'))").run();
  db.prepare("DELETE FROM users WHERE email LIKE '%@google-test.com'").run();
  // Ensure problems AG-01 (or A1), AG-02 (or A2), AG-05 (or A5) are AVAILABLE
  db.prepare("UPDATE problem_statements SET status = 'AVAILABLE' WHERE problem_code IN ('AG-01', 'AG-02', 'AG-05', 'A1', 'A2', 'A5')").run();

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
    // TEST A — New Google user
    // Expected: Account created, Participant ID assigned (e.g. USER_001), No problem assigned
    // -------------------------------------------------------------
    console.log('\n🔹 TEST A: New Google user signs in');
    const googleUserA = {
      sub: 'google_oauth_sub_1001',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@google-test.com',
      picture: 'https://lh3.googleusercontent.com/a/rahul-photo'
    };

    const loginResA = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: { credential: googleUserA }
    });

    assert(loginResA.status === 200, 'Test A1: Google sign-in returns HTTP 200');
    assert(loginResA.data.success === true, 'Test A2: Google sign-in success flag is true');
    assert(loginResA.data.user.email === googleUserA.email, 'Test A3: Email matches Google account');
    assert(loginResA.data.user.auth_provider === 'google', 'Test A4: auth_provider is set to "google"');
    assert(loginResA.data.user.auth_provider_user_id === googleUserA.sub, 'Test A5: auth_provider_user_id stored accurately');
    assert(typeof loginResA.data.user.participant_id === 'string' && loginResA.data.user.participant_id.startsWith('USER_'), 'Test A6: Unique Participant ID assigned (USER_XXX)');
    assert(!loginResA.data.assignedProblem, 'Test A7: No problem initially assigned to new user');

    const tokenA = loginResA.data.token;
    const initialUserA = loginResA.data.user;

    // Verify GET /api/me
    const meResA = await makeRequest('/api/me', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(meResA.status === 200 && meResA.data.user.id === initialUserA.id, 'Test A8: GET /api/me returns created participant profile');
    assert(meResA.data.assignedProblem === null, 'Test A9: GET /api/me confirms no problem assigned');

    // -------------------------------------------------------------
    // TEST B — Existing Google user logs in again
    // Expected: Same application user ID and participant ID, no duplicate account created
    // -------------------------------------------------------------
    console.log('\n🔹 TEST B: Existing Google user logs in again');
    const reloginResA = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: { credential: googleUserA }
    });

    assert(reloginResA.status === 200, 'Test B1: Existing Google user login returns HTTP 200');
    assert(reloginResA.data.user.id === initialUserA.id, 'Test B2: Exact same internal user ID returned');
    assert(reloginResA.data.user.participant_id === initialUserA.participant_id, 'Test B3: Exact same participant_id (USER_XXX) maintained');

    // Verify DB count: only 1 user for this google sub
    const countA = db.prepare("SELECT COUNT(*) as count FROM users WHERE auth_provider = 'google' AND auth_provider_user_id = ?").get(googleUserA.sub);
    assert(countA.count === 1, 'Test B4: Database confirms exactly ONE user record exists for Google identity');

    // -------------------------------------------------------------
    // TEST C — One problem selection (User A selects AG-01)
    // Expected: Problem locked to User A, status LOCKED
    // -------------------------------------------------------------
    console.log('\n🔹 TEST C: User A selects problem AG-01');
    // Find problem AG-01 / A1
    const p1 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-01', 'A1') LIMIT 1").get();
    assert(Boolean(p1), `Test C1: Found problem code ${p1 ? p1.problem_code : 'none'}`);

    const selectResA = await makeRequest(`/api/problems/${p1.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    assert(selectResA.status === 200, 'Test C2: Problem selection returns HTTP 200');
    assert(selectResA.data.success === true, 'Test C3: Selection success flag is true');
    assert(selectResA.data.assignment.status === 'LOCKED', 'Test C4: Assignment status is LOCKED');

    // Verify via GET /api/my-problem
    const myProblemResA = await makeRequest('/api/my-problem', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(myProblemResA.status === 200 && myProblemResA.data.hasSelected === true, 'Test C5: GET /api/my-problem shows hasSelected = true');
    assert(myProblemResA.data.assignment.problem.code === p1.problem_code, 'Test C6: Problem code matches selected problem');
    assert(myProblemResA.data.assignment.participant.participant_id === initialUserA.participant_id, 'Test C7: Participant ID matches User A');

    // -------------------------------------------------------------
    // TEST D — Duplicate problem attempt (User B tries selecting AG-01)
    // Expected: Rejected with 409 Conflict
    // -------------------------------------------------------------
    console.log('\n🔹 TEST D: User B attempts to select already assigned AG-01');
    const googleUserB = {
      sub: 'google_oauth_sub_2002',
      name: 'Priya Sharma',
      email: 'priya.sharma@google-test.com',
      picture: 'https://lh3.googleusercontent.com/a/priya-photo'
    };

    const loginResB = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: { credential: googleUserB }
    });
    const tokenB = loginResB.data.token;
    const userB = loginResB.data.user;
    assert(userB.participant_id !== initialUserA.participant_id, 'Test D1: User B has distinct participant ID');

    const selectResB = await makeRequest(`/api/problems/${p1.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    assert(selectResB.status === 409, 'Test D2: Attempting to select assigned problem returns HTTP 409 Conflict');
    assert(selectResB.data.success === false, 'Test D3: Selection fails with error message');
    assert(/already\s+(been\s+)?selected|just\s+selected/i.test(selectResB.data.message), 'Test D4: Error message indicates problem already taken');

    // Check problem listing for User B - AG-01 should not be listed as available
    const problemsResB = await makeRequest('/api/problems', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const availableCodes = (problemsResB.data.problems || []).map(p => p.problem_code);
    assert(!availableCodes.includes(p1.problem_code), 'Test D5: AG-01 is removed completely from available problem list');

    // -------------------------------------------------------------
    // TEST E — Multiple problem attempt (User A already owns AG-01 and tries AG-02)
    // Expected: Rejected with 409 Conflict
    // -------------------------------------------------------------
    console.log('\n🔹 TEST E: User A attempts to select a second problem (AG-02)');
    const p2 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-02', 'A2') LIMIT 1").get();

    const selectSecondResA = await makeRequest(`/api/problems/${p2.problem_code}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    assert(selectSecondResA.status === 409, 'Test E1: Second problem selection returns HTTP 409 Conflict');
    assert(selectSecondResA.data.success === false, 'Test E2: Request rejected');
    assert(/already\s+selected/i.test(selectSecondResA.data.message), 'Test E3: Message explains user already selected a problem statement');

    // -------------------------------------------------------------
    // TEST F — Logout and login test
    // Expected: User A logs in again via Google; AG-01 is still LOCKED to USER_001
    // -------------------------------------------------------------
    console.log('\n🔹 TEST F: Logout and sign-in again with same Google account');
    // Logout
    const logoutRes = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(logoutRes.status === 200, 'Test F1: POST /api/auth/logout returns HTTP 200');

    // User A signs in again tomorrow
    const returningResA = await makeRequest('/api/auth/google', {
      method: 'POST',
      body: { credential: googleUserA }
    });
    assert(returningResA.status === 200, 'Test F2: Google re-login succeeds');
    assert(returningResA.data.user.participant_id === initialUserA.participant_id, 'Test F3: Recognized as same participant ID');
    assert(returningResA.data.assignedProblem !== null, 'Test F4: assignedProblem is automatically returned on login');
    assert(returningResA.data.assignedProblem.problem_code === p1.problem_code, 'Test F5: Problem AG-01 is still permanently locked');

    // -------------------------------------------------------------
    // TEST G — Concurrent selection race condition
    // Expected: User C and User D simultaneously try to select AG-05; exactly ONE succeeds
    // -------------------------------------------------------------
    console.log('\n🔹 TEST G: Concurrent selection race condition test');
    const p5 = db.prepare("SELECT * FROM problem_statements WHERE problem_code IN ('AG-05', 'A5') LIMIT 1").get();
    assert(Boolean(p5), `Test G1: Found target problem for concurrent test (${p5.problem_code})`);

    const googleUserC = { sub: 'google_sub_race_c', name: 'User C', email: 'user.c@google-test.com' };
    const googleUserD = { sub: 'google_sub_race_d', name: 'User D', email: 'user.d@google-test.com' };

    const [loginC, loginD] = await Promise.all([
      makeRequest('/api/auth/google', { method: 'POST', body: { credential: googleUserC } }),
      makeRequest('/api/auth/google', { method: 'POST', body: { credential: googleUserD } })
    ]);

    const tokenC = loginC.data.token;
    const tokenD = loginD.data.token;

    // Fire both requests simultaneously
    const [raceRes1, raceRes2] = await Promise.all([
      makeRequest(`/api/problems/${p5.problem_code}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenC}` }
      }),
      makeRequest(`/api/problems/${p5.problem_code}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenD}` }
      })
    ]);

    const statuses = [raceRes1.status, raceRes2.status];
    const successes = [raceRes1.data.success, raceRes2.data.success].filter(Boolean);

    assert(statuses.includes(200), 'Test G2: Exactly one concurrent request succeeded with 200');
    assert(statuses.includes(409), 'Test G3: The other concurrent request failed with 409 Conflict');
    assert(successes.length === 1, 'Test G4: Database atomic transaction ensured exactly one assignment created');

    // Verify DB count
    const assignmentCount = db.prepare('SELECT COUNT(*) as count FROM problem_assignments WHERE problem_statement_id = ?').get(p5.id);
    assert(assignmentCount.count === 1, 'Test G5: Problem statement assignment table has exactly 1 row for problem');

    // -------------------------------------------------------------
    // TEST H — Direct API security & Unauthorized access
    // Expected: Unauthenticated request -> 401; Tampering with user_id in body -> Ignored; Non-admin modifying assignment -> 403
    // -------------------------------------------------------------
    console.log('\n🔹 TEST H: Direct API security & authentication enforcement');
    // Unauthenticated selection
    const unauthRes = await makeRequest(`/api/problems/${p2.problem_code}/select`, {
      method: 'POST',
      body: { user_id: initialUserA.id } // Malicious attempt to spoof user_id
    });
    assert(unauthRes.status === 401, 'Test H1: Unauthenticated selection attempt is rejected with 401 Unauthorized');

    // Attempting to access admin-only reassignment endpoint as a participant
    const nonAdminReassign = await makeRequest('/api/admin/reassign', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: { user_id: initialUserA.id, new_problem_code: p2.problem_code, reason: 'unauthorized change' }
    });
    assert(nonAdminReassign.status === 403, 'Test H2: Non-admin participant cannot access admin reassignment (403 Forbidden)');

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

runGoogleAuthTests();
