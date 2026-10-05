/**
 * Real-Time Problem Lock & Live Availability Update Test Suite
 * Tests multi-client real-time synchronization, privacy preservation,
 * and concurrent race conditions as specified in user prompt.
 */
const http = require('http');
const { Server } = require('socket.io');
const { io } = require('socket.io-client');
const app = require('../server/src/app');
const db = require('../server/src/db');
const { initSocket } = require('../server/src/services/socket.service');

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

async function runRealtimeTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING REAL-TIME PROBLEM LOCK & AVAILABILITY TEST SUITE');
  console.log('   Multi-client WebSocket verification & Concurrency protection');
  console.log('=============================================================\n');

  // Start HTTP + Socket.IO server on dynamic port
  server = http.createServer(app);
  const serverIo = new Server(server, { cors: { origin: '*' } });
  initSocket(serverIo);

  await new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });

  // Prepare database clean state
  db.prepare("DELETE FROM problem_assignments WHERE user_id IN (SELECT id FROM users WHERE niat_id LIKE 'RT_%')").run();
  db.prepare("DELETE FROM users WHERE niat_id LIKE 'RT_%'").run();
  db.prepare("DELETE FROM problem_assignments WHERE problem_statement_id IN (SELECT id FROM problem_statements WHERE problem_code IN ('A1', 'A2', 'A3'))").run();
  db.prepare("UPDATE problem_statements SET status = 'AVAILABLE' WHERE problem_code IN ('A1', 'A2', 'A3')").run();
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

  let clientA_Socket;
  let clientB_Socket;
  let admin_Socket;

  try {
    // Register Student A & Student B
    const regA = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Student A Realtime', niatId: 'RT_001' }
    });
    const tokenA = regA.data.token;
    const userA = regA.data.user;

    const regB = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Student B Realtime', niatId: 'RT_002' }
    });
    const tokenB = regB.data.token;
    const userB = regB.data.user;

    console.log('🔹 TEST 1: Connect WebSocket clients for Student A, Student B, and Admin');
    clientA_Socket = io(baseUrl, { transports: ['websocket'] });
    clientB_Socket = io(baseUrl, { transports: ['websocket'] });
    admin_Socket = io(baseUrl, { transports: ['websocket'] });

    await Promise.all([
      new Promise(res => clientA_Socket.on('connect', res)),
      new Promise(res => clientB_Socket.on('connect', res)),
      new Promise(res => admin_Socket.on('connect', res))
    ]);

    assert(clientA_Socket.connected, 'Client A WebSocket connected');
    assert(clientB_Socket.connected, 'Client B WebSocket connected');
    assert(admin_Socket.connected, 'Admin WebSocket connected');

    // Fetch initial problems & counts
    const initList = await makeRequest('/api/problems?include_all=true');
    const initAvail = initList.data.meta.available;
    const initAssigned = initList.data.meta.assigned;
    const availableProblems = initList.data.problems.filter(p => p.status === 'AVAILABLE');
    const targetProblem = availableProblems[0];
    const problem2 = availableProblems[1];

    console.log(`\n🔹 TEST 2: Student A locks Problem ${targetProblem.problem_code} -> Real-time broadcast to Student B & Admin`);
    
    // Set up listeners on Client B and Admin
    const clientB_Promise = new Promise((resolve) => {
      clientB_Socket.on('problem_locked', (payload) => {
        resolve(payload);
      });
    });

    const admin_Promise = new Promise((resolve) => {
      admin_Socket.on('problem_locked', (payload) => {
        resolve(payload);
      });
    });

    // Student A selects problem
    const selectRes = await makeRequest(`/api/problems/${targetProblem.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    if (selectRes.status !== 200) {
      console.log('selectRes failure details:', selectRes.status, selectRes.data);
    }

    assert(selectRes.status === 200, 'Student A selection HTTP 200 OK');
    assert(selectRes.data.success === true, 'Student A selection successful');

    // Wait for WebSocket events
    const payloadB = await clientB_Promise;
    const payloadAdmin = await admin_Promise;

    assert(payloadB.problemId === targetProblem.id, 'Client B received real-time problem_locked with matching problemId');
    assert(payloadB.problemCode === targetProblem.problem_code, 'Client B received matching problemCode');
    assert(payloadB.status === 'ASSIGNED', 'Client B received status ASSIGNED');
    assert(payloadAdmin.problemId === targetProblem.id, 'Admin received real-time problem_locked event');

    console.log('\n🔹 TEST 3: Participant Privacy Check (No sensitive information leaked in realtime payload)');
    assert(payloadB.assignedUserId === userA.id, 'assignedUserId provided for current-user matching');
    assert(payloadB.name === undefined && payloadB.userName === undefined, 'No participant name leaked in socket payload');
    assert(payloadB.email === undefined, 'No participant email leaked in socket payload');
    assert(payloadB.niat_id === undefined && payloadB.niatId === undefined, 'No NIAT ID leaked in socket payload');

    console.log('\n🔹 TEST 4: Live availability counts updated from database source of truth');
    const afterList = await makeRequest('/api/problems?include_all=true');
    assert(afterList.data.meta.available === initAvail - 1, `Available problems decremented by 1 (${initAvail} -> ${afterList.data.meta.available})`);
    assert(afterList.data.meta.assigned === initAssigned + 1, `Assigned problems incremented by 1 (${initAssigned} -> ${afterList.data.meta.assigned})`);
    assert(afterList.data.meta.total === initList.data.meta.total, 'Total problem count unchanged');

    console.log(`\n🔹 TEST 5: Concurrent race condition — Student B and Student C contest Problem ${problem2.problem_code} simultaneously`);
    const regC = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Student C Realtime', niatId: 'RT_003' }
    });
    const tokenC = regC.data.token;

    const [resB, resC] = await Promise.all([
      makeRequest(`/api/problems/${problem2.id}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenB}` }
      }),
      makeRequest(`/api/problems/${problem2.id}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenC}` }
      })
    ]);

    const successes = [resB, resC].filter(r => r.status === 200);
    const conflicts = [resB, resC].filter(r => r.status === 409);

    assert(successes.length === 1, 'Exactly ONE concurrent selection succeeded (HTTP 200)');
    assert(conflicts.length === 1, 'Exactly ONE conflicting request was rejected (HTTP 409)');
    assert(
      conflicts[0].data.message === 'Sorry, this problem was just selected by another participant. Please choose another problem.',
      `Error message matches required prompt text: "${conflicts[0].data.message}"`
    );

    const dbAssignments = db.prepare('SELECT COUNT(*) as count FROM problem_assignments WHERE problem_statement_id = ?').get(problem2.id);
    assert(dbAssignments.count === 1, 'Database confirms exactly ONE assignment exists in problem_assignments table');

    console.log('\n=============================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');

  } finally {
    if (clientA_Socket) clientA_Socket.disconnect();
    if (clientB_Socket) clientB_Socket.disconnect();
    if (admin_Socket) admin_Socket.disconnect();
    if (server) server.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runRealtimeTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
