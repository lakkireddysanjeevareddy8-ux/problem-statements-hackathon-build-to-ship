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

// Get available problem statements (for participants)
// Enforces Section 4 & 15: ONLY AVAILABLE problems appear.
router.get('/', (req, res) => {
  try {
    const { domain, difficulty, search } = req.query;

    let query = `
      SELECT p.id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags, p.status, p.created_at,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      WHERE p.status = 'AVAILABLE'
    `;
    const params = [];

    if (domain) {
      query += ` AND (d.code = ? OR d.id = ?)`;
      params.push(domain, domain);
    }

    if (difficulty) {
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

    // Get current hackathon status
    const statusSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_status'").get();
    const startSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_start_time'").get();
    const endSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_end_time'").get();
    const windowInfo = isSelectionOpen();

    return res.json({
      success: true,
      problems,
      meta: {
        total: problems.length,
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

// Get single problem statement details
router.get('/:id', (req, res) => {
  try {
    const problemId = req.params.id;
    const problem = db.prepare(`
      SELECT p.id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags, p.status, p.created_at,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      WHERE p.id = ? OR p.problem_code = ?
    `).get(problemId, problemId);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    // PRIVACY REQUIREMENT (Section 15):
    // Do NOT expose who selected it to standard participants!
    // Return sanitized object.
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
    // Lookup problem numeric ID if code passed
    let pId = parseInt(problemIdParam, 10);
    if (isNaN(pId)) {
      const found = db.prepare('SELECT id FROM problem_statements WHERE problem_code = ?').get(problemIdParam);
      if (!found) {
        return res.status(404).json({ success: false, message: 'Problem statement not found.' });
      }
      pId = found.id;
    }

    // Log selection attempt
    logAudit(userId, 'PROBLEM_SELECTION_STARTED', 'PROBLEM_STATEMENT', pId, null, req);

    // Call atomic locking transaction
    const allocationResult = lockProblemStatement(userId, pId, ipAddress);

    return res.status(200).json({
      success: true,
      message: 'Problem statement successfully selected and locked exclusively to your account!',
      assignmentId: allocationResult.assignmentId,
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
