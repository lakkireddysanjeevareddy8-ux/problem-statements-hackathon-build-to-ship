const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { lockProblemStatement, isSelectionOpen } = require('../services/allocation.service');
const { logAudit } = require('../services/audit.service');

// Get all domains with counts of available problems
router.get('/domains', (req, res) => {
  try {
    const domains = db.prepare(`
      SELECT d.id, d.code, d.name, d.icon, d.description,
             COUNT(p.id) as total_problems,
             SUM(CASE WHEN p.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_problems
      FROM domains d
      LEFT JOIN problem_statements p ON d.id = p.domain_id
      GROUP BY d.id
      ORDER BY d.id ASC
    `).all();

    return res.json({ success: true, domains });
  } catch (err) {
    console.error('Error fetching domains:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch domains.' });
  }
});

// Get problem statements (for participants)
// Supports include_all=true for full list with live availability statuses (Section 1 & 14)
// Defaults to ONLY AVAILABLE for backwards compatibility with tests
router.get('/', (req, res) => {
  try {
    const { domain, difficulty, search, status, include_all } = req.query;

    let query = `
      SELECT p.id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags, p.status, p.created_at,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon,
             a.user_id as assigned_user_id
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      LEFT JOIN problem_assignments a ON p.id = a.problem_statement_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      query += ` AND p.status = ?`;
      params.push(status);
    } else if (include_all === 'true' || include_all === '1' || status === 'ALL') {
      // Return all statuses (AVAILABLE, ASSIGNED)
    } else {
      query += ` AND p.status = 'AVAILABLE'`;
    }

    if (domain && domain !== 'ALL') {
      query += ` AND (d.code = ? OR d.id = ?)`;
      params.push(domain, domain);
    }

    if (difficulty && difficulty !== 'ALL') {
      query += ` AND p.difficulty = ?`;
      params.push(difficulty);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.problem_code LIKE ? OR p.tags LIKE ?)`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY d.id ASC, p.id ASC`;

    const problems = db.prepare(query).all(...params);

    // Compute live stats directly from real database counts! (Section 13)
    const statsRow = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) as assigned
      FROM problem_statements
    `).get();

    // Get current hackathon status
    const statusSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_status'").get();
    const startSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_start_time'").get();
    const endSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_end_time'").get();
    const windowInfo = isSelectionOpen();

    return res.json({
      success: true,
      problems,
      meta: {
        total: statsRow ? statsRow.total : problems.length,
        available: statsRow ? statsRow.available : problems.length,
        assigned: statsRow ? statsRow.assigned : 0,
        selection_status: statusSetting ? statusSetting.value : 'OPEN',
        selection_start_time: startSetting ? startSetting.value : null,
        selection_end_time: endSetting ? endSetting.value : null,
        is_selection_open: windowInfo.open,
        selection_message: windowInfo.open ? 'Problem selection is OPEN.' : windowInfo.reason
      }
    });
  } catch (err) {
    console.error('Error fetching problems:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch problem statements.' });
  }
});

// Helper to resolve problem ID from numeric ID, exact code, or formatted code (e.g. AG-04 -> A4)
function findProblemByParam(param) {
  if (!param) return null;
  const strParam = String(param).trim();

  // 1. Try by numeric ID
  const numId = parseInt(strParam, 10);
  if (!isNaN(numId) && String(numId) === strParam) {
    const byId = db.prepare('SELECT id FROM problem_statements WHERE id = ?').get(numId);
    if (byId) return byId.id;
  }

  // 2. Try exact problem_code (case-insensitive)
  const byCode = db.prepare('SELECT id FROM problem_statements WHERE problem_code = ? COLLATE NOCASE').get(strParam);
  if (byCode) return byCode.id;

  // 3. Try hyphenated format (e.g. AG-01, AG-04, HC-02, SA-05)
  const match = strParam.match(/^([a-zA-Z]+)[-_]?(\d+)$/);
  if (match) {
    const prefix = match[1].toUpperCase();
    const num = parseInt(match[2], 10);

    const prefixMap = {
      'AG': 'A',
      'HC': 'H',
      'HOSP': 'H',
      'ED': 'E',
      'EDU': 'E',
      'SC': 'S',
      'CITY': 'S',
      'PS': 'P',
      'SAFE': 'P',
      'FN': 'F',
      'FIN': 'F',
      'RC': 'R',
      'RET': 'R',
      'EC': 'C',
      'ENV': 'C',
      'TM': 'T',
      'TRANS': 'T',
      'EP': 'J',
      'JOB': 'J',
      'GV': 'G',
      'GOV': 'G',
      'HM': 'HC',
      'HOME': 'HC',
      'FD': 'FN',
      'FOOD': 'FN',
      'MW': 'MW',
      'CS': 'CS',
      'CYBER': 'CS',
      'SA': 'SA',
      'AUTO': 'SA'
    };

    const targetCode1 = `${prefix}${num}`;
    const byVariant1 = db.prepare('SELECT id FROM problem_statements WHERE problem_code = ? COLLATE NOCASE').get(targetCode1);
    if (byVariant1) return byVariant1.id;

    if (prefixMap[prefix]) {
      const targetCode2 = `${prefixMap[prefix]}${num}`;
      const byVariant2 = db.prepare('SELECT id FROM problem_statements WHERE problem_code = ? COLLATE NOCASE').get(targetCode2);
      if (byVariant2) return byVariant2.id;
    }
  }

  return null;
}

// Get single problem statement details
router.get('/:id', (req, res) => {
  try {
    const resolvedId = findProblemByParam(req.params.id);
    if (!resolvedId) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    const problem = db.prepare(`
      SELECT p.id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags, p.status, p.created_at,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      WHERE p.id = ?
    `).get(resolvedId);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    // PRIVACY REQUIREMENT (Section 15):
    // Do NOT expose who selected it to standard participants!
    return res.json({
      success: true,
      problem: {
        id: problem.id,
        problem_code: problem.problem_code,
        title: problem.title,
        description: problem.description,
        detailed_requirements: problem.detailed_requirements,
        expected_outcome: problem.expected_outcome,
        difficulty: problem.difficulty,
        tags: problem.tags,
        status: problem.status,
        is_available: problem.status === 'AVAILABLE',
        domain_id: problem.domain_id,
        domain_name: problem.domain_name,
        domain_code: problem.domain_code,
        domain_icon: problem.domain_icon,
        created_at: problem.created_at
      }
    });
  } catch (err) {
    console.error('Error fetching problem details:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch problem statement.' });
  }
});

// SELECT & PERMANENTLY LOCK A PROBLEM STATEMENT
// ATOMIC TRANSACTION GUARANTEED
router.post('/:id/select', authenticateToken, (req, res) => {
  const problemIdParam = req.params.id;
  const userId = req.user.id;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  try {
    const pId = findProblemByParam(problemIdParam);
    if (!pId) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    // Log selection attempt
    logAudit(userId, 'PROBLEM_SELECTION_STARTED', 'PROBLEM_STATEMENT', pId, null, req);

    // Call atomic locking transaction
    const allocationResult = lockProblemStatement(userId, pId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'Problem statement successfully selected and locked exclusively to your account!',
      assignmentId: allocationResult.assignmentId,
      assignment: {
        id: allocationResult.assignmentId,
        status: 'LOCKED',
        problem: allocationResult.problem
      },
      problem: allocationResult.problem
    });
  } catch (err) {
    // Log failure
    logAudit(userId, 'SELECTION_FAILED', 'PROBLEM_STATEMENT', problemIdParam, { error: err.message, code: err.code }, req);

    if (err.status) {
      return res.status(err.status).json({
        success: false,
        code: err.code,
        message: err.message,
        existingAssignment: err.existingAssignment || null
      });
    }

    console.error('Selection transaction error:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during problem locking. Please try again.'
    });
  }
});

module.exports = router;
