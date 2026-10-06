const http = require('http');
const assert = require('assert');
const path = require('path');

process.env.PORT = 0; // random port
process.env.DATABASE_URL = path.join(__dirname, '../data/test_delete.db');
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.ADMIN_SECRET = 'admin_secret_test';

const fs = require('fs');
if (fs.existsSync(process.env.DATABASE_URL)) {
  fs.unlinkSync(process.env.DATABASE_URL);
}

const app = require('../server/src/app');
const db = require('../server/src/db');
const seed = require('../server/src/db/seed');

let server;
let baseUrl;

function makeRequest(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const bodyStr = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function run() {
  await seed();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Admin login
    const adminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hackathon.org', password: 'AdminSecureHackathon2026!' }
    });
    assert.strictEqual(adminLogin.status, 200, 'Admin login should succeed');
    const adminToken = adminLogin.data.token;

    // 2. Register participant 1 (unassigned)
    const p1Res = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Delete Test User 1', niatId: 'DEL_001', email: 'del1@test.com' }
    });
    assert.strictEqual(p1Res.status, 200, 'Participant 1 login should succeed');
    const p1 = p1Res.data.user;

    // 3. Register participant 2 (will select a problem)
    const p2Res = await makeRequest('/api/participants/login', {
      method: 'POST',
      body: { name: 'Delete Test User 2', niatId: 'DEL_002', email: 'del2@test.com' }
    });
    assert.strictEqual(p2Res.status, 200, 'Participant 2 login should succeed');
    const p2 = p2Res.data.user;
    const p2Token = p2Res.data.token;

    // 4. Participant 2 selects an available problem
    const problemsRes = await makeRequest('/api/problems');
    const problemToLock = problemsRes.data.problems.find(p => p.status === 'AVAILABLE');
    assert(problemToLock, 'Should find an available problem');

    const selectRes = await makeRequest(`/api/problems/${problemToLock.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${p2Token}` }
    });
    assert.strictEqual(selectRes.status, 200, 'Problem selection should succeed');

    // Verify problem is now ASSIGNED
    const lockedProbCheck = db.prepare('SELECT status FROM problem_statements WHERE id = ?').get(problemToLock.id);
    assert.strictEqual(lockedProbCheck.status, 'ASSIGNED', 'Problem should be ASSIGNED');

    // 5. Test non-admin cannot delete participant
    const unauthDel = await makeRequest(`/api/admin/participants/${p1.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${p2Token}` }
    });
    assert.strictEqual(unauthDel.status, 403, 'Participant cannot call delete participant');

    // 6. Test admin deletes participant 1 (unassigned)
    const delP1Res = await makeRequest(`/api/admin/participants/${p1.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(delP1Res.status, 200, 'Admin can delete participant 1');
    assert.strictEqual(delP1Res.data.success, true);

    const user1Check = db.prepare('SELECT * FROM users WHERE id = ?').get(p1.id);
    assert(!user1Check, 'Participant 1 should no longer exist in DB');

    // 7. Test admin deletes participant 2 (has locked problem)
    const delP2Res = await makeRequest(`/api/admin/participants/${p2.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(delP2Res.status, 200, 'Admin can delete participant 2 with locked problem');
    assert.strictEqual(delP2Res.data.success, true);

    const user2Check = db.prepare('SELECT * FROM users WHERE id = ?').get(p2.id);
    assert(!user2Check, 'Participant 2 should no longer exist in DB');

    // Check assignment is deleted and problem is reverted to AVAILABLE
    const assignmentCheck = db.prepare('SELECT * FROM problem_assignments WHERE user_id = ?').get(p2.id);
    assert(!assignmentCheck, 'Assignment should be deleted');

    const revertedProbCheck = db.prepare('SELECT status FROM problem_statements WHERE id = ?').get(problemToLock.id);
    assert.strictEqual(revertedProbCheck.status, 'AVAILABLE', 'Problem should be reverted to AVAILABLE');

    console.log('✅ ALL PARTICIPANT DELETION TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
    if (fs.existsSync(process.env.DATABASE_URL)) {
      try { fs.unlinkSync(process.env.DATABASE_URL); } catch (e) {}
    }
  }
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
