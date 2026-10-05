const db = require('../db');
const { broadcastProblemLocked } = require('./socket.service');

/**
 * Checks whether hackathon selection window is currently open.
 */
function isSelectionOpen() {
  const statusSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_status'").get();
  if (statusSetting && statusSetting.value !== 'OPEN') {
    return { open: false, reason: 'Problem selection is currently CLOSED by the hackathon organizers.' };
  }

  const startSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_start_time'").get();
  const endSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_end_time'").get();

  const now = new Date();
  if (startSetting && startSetting.value) {
    const start = new Date(startSetting.value);
    if (now < start) {
      return { open: false, reason: 'Problem selection has not started yet.' };
    }
  }

  if (endSetting && endSetting.value) {
    const end = new Date(endSetting.value);
    if (now > end) {
      return { open: false, reason: 'Problem selection has CLOSED.' };
    }
  }

  return { open: true };
}

/**
 * ATOMIC DATABASE-LEVEL PROBLEM LOCKING
 *
 * Implements strict ACID transaction:
 * 1. Checks hackathon open status.
 * 2. Checks if participant already has a selected problem.
 * 3. Checks if problem statement is available.
 * 4. Inserts into problem_assignments guarded by UNIQUE(problem_statement_id) & UNIQUE(user_id).
 * 5. Updates problem_statements status to 'ASSIGNED'.
 * 6. Records an audit log event.
 * 7. Broadcasts real-time event to all connected sockets.
 */
function lockProblemStatement(userId, problemId, ipAddress = 'unknown') {
  // 1. Verify Hackathon window
  const windowCheck = isSelectionOpen();
  if (!windowCheck.open) {
    const err = new Error(windowCheck.reason);
    err.status = 403;
    err.code = 'SELECTION_CLOSED';
    throw err;
  }

  // Define atomic transaction
  const executeAllocation = db.transaction((uId, pId, ip) => {
    // A. Check if user already has an assigned problem
    const userAssignment = db.prepare(`
      SELECT a.id, a.problem_statement_id, p.problem_code, p.title
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      WHERE a.user_id = ?
    `).get(uId);

    if (userAssignment) {
      const err = new Error('You have already selected a problem statement. Your selection is permanently locked.');
      err.status = 409;
      err.code = 'USER_ALREADY_ASSIGNED';
      err.existingAssignment = userAssignment;
      throw err;
    }

    // B. Check if problem exists
    const problem = db.prepare(`
      SELECT p.id, p.problem_code, p.title, p.status, d.name as domain_name
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      WHERE p.id = ?
    `).get(pId);

    if (!problem) {
      const err = new Error('Problem statement not found.');
      err.status = 404;
      err.code = 'PROBLEM_NOT_FOUND';
      throw err;
    }

    if (problem.status !== 'AVAILABLE') {
      const err = new Error('Sorry, this problem was just selected by another participant. Please choose another problem.');
      err.status = 409;
      err.code = 'PROBLEM_UNAVAILABLE';
      throw err;
    }

    // C. Verify no assignment already exists for this problem
    const problemAssignment = db.prepare(`
      SELECT id, user_id FROM problem_assignments WHERE problem_statement_id = ?
    `).get(pId);

    if (problemAssignment) {
      const err = new Error('Sorry, this problem was just selected by another participant. Please choose another problem.');
      err.status = 409;
      err.code = 'PROBLEM_ALREADY_ASSIGNED';
      throw err;
    }

    // D. Insert assignment into problem_assignments table
    // (Enforced by UNIQUE(problem_statement_id) and UNIQUE(user_id) in schema)
    let insertResult;
    try {
      insertResult = db.prepare(`
        INSERT INTO problem_assignments (problem_statement_id, user_id, selected_at, status)
        VALUES (?, ?, CURRENT_TIMESTAMP, 'LOCKED')
      `).run(pId, uId);
    } catch (sqlErr) {
      if (sqlErr.message && sqlErr.message.includes('UNIQUE')) {
        const err = new Error('Sorry, this problem was just selected by another participant. Please choose another problem.');
        err.status = 409;
        err.code = 'PROBLEM_ALREADY_ASSIGNED';
        throw err;
      }
      throw sqlErr;
    }

    // E. Mark problem statement as ASSIGNED
    db.prepare(`
      UPDATE problem_statements
      SET status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(pId);

    // F. Record audit log
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
      VALUES (?, 'PROBLEM_SELECTED', 'PROBLEM_ASSIGNMENT', ?, ?, ?)
    `).run(
      uId,
      insertResult.lastInsertRowid.toString(),
      JSON.stringify({
        problem_id: pId,
        problem_code: problem.problem_code,
        title: problem.title
      }),
      ip
    );

    return {
      assignmentId: insertResult.lastInsertRowid,
      problem
    };
  });

  // Execute the transaction
  const result = executeAllocation(userId, problemId, ipAddress);

  // Broadcast real-time event to other participants
  try {
    broadcastProblemLocked(result.problem, userId);
  } catch (socketErr) {
    console.warn('Socket broadcast warning:', socketErr);
  }

  return result;
}

module.exports = {
  isSelectionOpen,
  lockProblemStatement
};
