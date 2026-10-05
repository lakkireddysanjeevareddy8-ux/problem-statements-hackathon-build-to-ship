const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { logAudit } = require('../services/audit.service');
const { broadcastHackathonStatus, broadcastProblemUpdated } = require('../services/socket.service');

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin-only middleware for all routes here
router.use(authenticateToken, requireAdmin);

// 1. Dashboard Metrics and Charts
router.get('/dashboard', (req, res) => {
  try {
    const totalParticipants = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'PARTICIPANT'").get().count;
    const totalProblems = db.prepare('SELECT COUNT(*) as count FROM problem_statements').get().count;
    const availableProblems = db.prepare("SELECT COUNT(*) as count FROM problem_statements WHERE status = 'AVAILABLE'").get().count;
    const selectedProblems = db.prepare("SELECT COUNT(*) as count FROM problem_statements WHERE status = 'ASSIGNED'").get().count;
    const disabledProblems = db.prepare("SELECT COUNT(*) as count FROM problem_statements WHERE status = 'DISABLED'").get().count;
    const remainingProblems = availableProblems;
    const numberOfDomains = db.prepare('SELECT COUNT(*) as count FROM domains').get().count;

    const selectionPercentage = totalProblems > 0 ? ((selectedProblems / totalProblems) * 100).toFixed(1) : '0';

    // Chart: Problems by Domain (Total vs Available vs Selected)
    const problemsByDomain = db.prepare(`
      SELECT d.id, d.code, d.name, d.icon,
             COUNT(p.id) as total,
             SUM(CASE WHEN p.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
             SUM(CASE WHEN p.status = 'ASSIGNED' THEN 1 ELSE 0 END) as selected
      FROM domains d
      LEFT JOIN problem_statements p ON d.id = p.domain_id
      GROUP BY d.id
      ORDER BY d.id ASC
    `).all();

    // Chart: Assignments Timeline (grouped by hour/day)
    const assignmentsTimeline = db.prepare(`
      SELECT strftime('%Y-%m-%d %H:00', selected_at) as time_bucket, COUNT(*) as count
      FROM problem_assignments
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
      LIMIT 24
    `).all();

    // Chart: Participants by Domain
    const participantsByDomain = db.prepare(`
      SELECT d.name as domain_name, d.code as domain_code, d.icon as domain_icon, COUNT(a.id) as count
      FROM domains d
      JOIN problem_statements p ON d.id = p.domain_id
      JOIN problem_assignments a ON p.id = a.problem_statement_id
      GROUP BY d.id
      ORDER BY count DESC
    `).all();

    // Recent activity audit logs
    const recentActivity = db.prepare(`
      SELECT l.id, l.action, l.resource_type, l.resource_id, l.details, l.created_at,
             u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `).all();

    // System Settings
    const statusSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_status'").get();
    const startSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_start_time'").get();
    const endSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'selection_end_time'").get();

    return res.json({
      success: true,
      stats: {
        total_participants: totalParticipants,
        total_problems: totalProblems,
        available_problems: availableProblems,
        selected_problems: selectedProblems,
        disabled_problems: disabledProblems,
        remaining_problems: remainingProblems,
        number_of_domains: numberOfDomains,
        selection_percentage: parseFloat(selectionPercentage)
      },
      charts: {
        problems_by_domain: problemsByDomain,
        assignments_timeline: assignmentsTimeline,
        participants_by_domain: participantsByDomain
      },
      settings: {
        selection_status: statusSetting ? statusSetting.value : 'OPEN',
        selection_start_time: startSetting ? startSetting.value : '',
        selection_end_time: endSetting ? endSetting.value : ''
      },
      recent_activity: recentActivity
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard metrics.' });
  }
});

// 2. All Problems with Assignment Status and Selected By info
router.get('/problems', (req, res) => {
  try {
    const { domain, status, difficulty, search } = req.query;

    let query = `
      SELECT p.id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags, p.status, p.created_at, p.updated_at,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon,
             a.id as assignment_id, a.selected_at,
             u.id as user_id, u.name as selected_by_name, u.email as selected_by_email,
             u.team_name as selected_by_team, u.college as selected_by_college
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      LEFT JOIN problem_assignments a ON p.id = a.problem_statement_id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (domain) {
      query += ` AND (d.code = ? OR d.id = ?)`;
      params.push(domain, domain);
    }

    if (status && status !== 'ALL') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (difficulty && difficulty !== 'ALL') {
      query += ` AND p.difficulty = ?`;
      params.push(difficulty);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.problem_code LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY d.id ASC, p.id ASC`;

    const problems = db.prepare(query).all(...params);
    return res.json({ success: true, problems, count: problems.length });
  } catch (err) {
    console.error('Error fetching admin problems:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch problems.' });
  }
});

// 3. Create Problem Statement
router.post('/problems', (req, res) => {
  try {
    const {
      problem_code,
      domain_id,
      title,
      description,
      detailed_requirements,
      expected_outcome,
      difficulty,
      tags
    } = req.body;

    if (!problem_code || !domain_id || !title || !description) {
      return res.status(400).json({ success: false, message: 'Problem code, domain, title, and description are required.' });
    }

    const cleanCode = problem_code.trim().toUpperCase();

    // Check unique code
    const existing = db.prepare('SELECT id FROM problem_statements WHERE problem_code = ?').get(cleanCode);
    if (existing) {
      return res.status(409).json({ success: false, message: `Problem code ${cleanCode} already exists.` });
    }

    const tagsFormatted = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');

    const result = db.prepare(`
      INSERT INTO problem_statements (
        problem_code, domain_id, title, description, detailed_requirements,
        expected_outcome, difficulty, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
    `).run(
      cleanCode,
      domain_id,
      title.trim(),
      description.trim(),
      detailed_requirements ? detailed_requirements.trim() : null,
      expected_outcome ? expected_outcome.trim() : null,
      difficulty || 'Medium',
      tagsFormatted
    );

    const problemId = result.lastInsertRowid;
    logAudit(req.user.id, 'ADMIN_CREATED_PROBLEM', 'PROBLEM_STATEMENT', problemId, { code: cleanCode, title }, req);

    const created = db.prepare(`
      SELECT p.*, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      WHERE p.id = ?
    `).get(problemId);

    broadcastProblemUpdated(created);

    return res.status(201).json({ success: true, message: 'Problem statement created.', problem: created });
  } catch (err) {
    console.error('Admin create problem error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create problem statement.' });
  }
});

// 4. Update Problem Statement
router.put('/problems/:id', (req, res) => {
  try {
    const problemId = req.params.id;
    const {
      domain_id,
      title,
      description,
      detailed_requirements,
      expected_outcome,
      difficulty,
      tags
    } = req.body;

    const existing = db.prepare('SELECT * FROM problem_statements WHERE id = ?').get(problemId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    const tagsFormatted = Array.isArray(tags) ? JSON.stringify(tags) : (tags || existing.tags);

    db.prepare(`
      UPDATE problem_statements
      SET domain_id = COALESCE(?, domain_id),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          detailed_requirements = COALESCE(?, detailed_requirements),
          expected_outcome = COALESCE(?, expected_outcome),
          difficulty = COALESCE(?, difficulty),
          tags = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      domain_id || null,
      title ? title.trim() : null,
      description ? description.trim() : null,
      detailed_requirements ? detailed_requirements.trim() : null,
      expected_outcome ? expected_outcome.trim() : null,
      difficulty || null,
      tagsFormatted,
      problemId
    );

    logAudit(req.user.id, 'ADMIN_UPDATED_PROBLEM', 'PROBLEM_STATEMENT', problemId, { title }, req);

    const updated = db.prepare(`
      SELECT p.*, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_statements p
      JOIN domains d ON p.domain_id = d.id
      WHERE p.id = ?
    `).get(problemId);

    broadcastProblemUpdated(updated);

    return res.json({ success: true, message: 'Problem statement updated.', problem: updated });
  } catch (err) {
    console.error('Admin update problem error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update problem statement.' });
  }
});

// 5. Toggle enable / disable problem
router.patch('/problems/:id/toggle-status', (req, res) => {
  try {
    const problemId = req.params.id;
    const problem = db.prepare('SELECT id, problem_code, status FROM problem_statements WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    if (problem.status === 'ASSIGNED') {
      return res.status(400).json({ success: false, message: 'Cannot disable an actively assigned problem statement without resetting its assignment first.' });
    }

    const newStatus = problem.status === 'AVAILABLE' ? 'DISABLED' : 'AVAILABLE';
    db.prepare('UPDATE problem_statements SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, problemId);

    logAudit(req.user.id, 'ADMIN_TOGGLED_PROBLEM_STATUS', 'PROBLEM_STATEMENT', problemId, { oldStatus: problem.status, newStatus }, req);

    const updated = db.prepare('SELECT * FROM problem_statements WHERE id = ?').get(problemId);
    broadcastProblemUpdated(updated);

    return res.json({ success: true, message: `Problem status changed to ${newStatus}.`, problem: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle problem status.' });
  }
});

// 6. Delete Problem Statement
router.delete('/problems/:id', (req, res) => {
  try {
    const problemId = req.params.id;
    const problem = db.prepare('SELECT id, problem_code, status FROM problem_statements WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem statement not found.' });
    }

    if (problem.status === 'ASSIGNED') {
      return res.status(400).json({ success: false, message: 'Cannot delete an assigned problem statement.' });
    }

    db.prepare('DELETE FROM problem_statements WHERE id = ?').run(problemId);
    logAudit(req.user.id, 'ADMIN_DELETED_PROBLEM', 'PROBLEM_STATEMENT', problemId, { code: problem.problem_code }, req);

    return res.json({ success: true, message: 'Problem statement deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete problem statement.' });
  }
});

// 7. Participant Management Table
router.get('/participants', (req, res) => {
  try {
    const { college, domain, team, status, search } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.college, u.course, u.year, u.team_name, u.participant_id, u.created_at,
             a.id as assignment_id, a.selected_at, a.status as assignment_status,
             p.id as problem_id, p.problem_code, p.title as problem_title,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM users u
      LEFT JOIN problem_assignments a ON u.id = a.user_id
      LEFT JOIN problem_statements p ON a.problem_statement_id = p.id
      LEFT JOIN domains d ON p.domain_id = d.id
      WHERE u.role = 'PARTICIPANT'
    `;
    const params = [];

    if (college) {
      query += ` AND u.college LIKE ?`;
      params.push(`%${college}%`);
    }

    if (team) {
      query += ` AND u.team_name LIKE ?`;
      params.push(`%${team}%`);
    }

    if (domain) {
      query += ` AND (d.code = ? OR d.id = ?)`;
      params.push(domain, domain);
    }

    if (status === 'LOCKED') {
      query += ` AND a.id IS NOT NULL`;
    } else if (status === 'UNASSIGNED') {
      query += ` AND a.id IS NULL`;
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.team_name LIKE ? OR u.college LIKE ? OR p.problem_code LIKE ? OR p.title LIKE ?)`;
      params.push(term, term, term, term, term, term);
    }

    query += ` ORDER BY a.selected_at DESC, u.created_at DESC`;

    const participants = db.prepare(query).all(...params);
    return res.json({ success: true, participants, count: participants.length });
  } catch (err) {
    console.error('Error fetching admin participants:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch participants.' });
  }
});

// 8. Assignments List
router.get('/assignments', (req, res) => {
  try {
    const assignments = db.prepare(`
      SELECT a.id, a.selected_at, a.status,
             u.id as user_id, u.name as participant_name, u.email as participant_email,
             u.phone, u.college, u.course, u.year, u.team_name, u.participant_id,
             p.id as problem_id, p.problem_code, p.title as problem_title, p.difficulty,
             d.id as domain_id, d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_assignments a
      JOIN users u ON a.user_id = u.id
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      ORDER BY a.selected_at DESC
    `).all();

    return res.json({ success: true, assignments, count: assignments.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch assignments.' });
  }
});

// 9. Exceptional Admin Reset Workflow (Section 30)
// Protected admin workflow with confirmation and audit logging
router.post('/reset-assignment/:id', (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'A valid administrative reason (at least 5 characters) is required for audit logs.' });
    }

    const assignment = db.prepare(`
      SELECT a.*, p.id as problem_id, p.problem_code, u.id as user_id, u.name as user_name, u.email as user_email
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).get(assignmentId);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment record not found.' });
    }

    // Execute atomic reset transaction
    const resetTx = db.transaction(() => {
      // Delete assignment
      db.prepare('DELETE FROM problem_assignments WHERE id = ?').run(assignmentId);

      // Revert problem status to AVAILABLE
      db.prepare("UPDATE problem_statements SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(assignment.problem_id);

      // Log in audit log
      logAudit(
        req.user.id,
        'ADMIN_RESET_ASSIGNMENT',
        'PROBLEM_ASSIGNMENT',
        assignmentId,
        {
          problem_code: assignment.problem_code,
          revoked_from_user: assignment.user_email,
          reason: reason.trim()
        },
        req
      );
    });

    resetTx();

    // Broadcast problem available again
    const updatedProblem = db.prepare('SELECT * FROM problem_statements WHERE id = ?').get(assignment.problem_id);
    broadcastProblemUpdated(updatedProblem);

    return res.json({
      success: true,
      message: `Assignment successfully reset. Problem ${assignment.problem_code} is now available again.`
    });
  } catch (err) {
    console.error('Reset assignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset assignment.' });
  }
});

// 10. Update Hackathon Settings (Section 31 & 32)
router.put('/settings', (req, res) => {
  try {
    const { selection_status, selection_start_time, selection_end_time, hackathon_title } = req.body;

    const updateTx = db.transaction(() => {
      if (selection_status) {
        db.prepare("INSERT INTO system_settings (key, value) VALUES ('selection_status', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").run(selection_status);
      }
      if (selection_start_time !== undefined) {
        db.prepare("INSERT INTO system_settings (key, value) VALUES ('selection_start_time', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").run(selection_start_time || '');
      }
      if (selection_end_time !== undefined) {
        db.prepare("INSERT INTO system_settings (key, value) VALUES ('selection_end_time', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").run(selection_end_time || '');
      }
      if (hackathon_title) {
        db.prepare("INSERT INTO system_settings (key, value) VALUES ('hackathon_title', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").run(hackathon_title);
      }
    });

    updateTx();

    logAudit(req.user.id, 'HACKATHON_STATUS_CHANGED', 'SYSTEM_SETTINGS', null, { selection_status, selection_start_time, selection_end_time }, req);

    const payload = {
      selection_status: selection_status || 'OPEN',
      selection_start_time: selection_start_time || '',
      selection_end_time: selection_end_time || '',
      hackathon_title: hackathon_title || 'HACKATHON 2026'
    };

    broadcastHackathonStatus(payload);

    return res.json({ success: true, message: 'Hackathon settings updated successfully.', settings: payload });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

// 11. Bulk Import Problem Statements via CSV (Section 21)
router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or missing headers.' });
    }

    // Parse CSV header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    // Expected headers: problem_code, domain, title, description, difficulty, tags
    const colCode = headers.indexOf('problem_code') !== -1 ? headers.indexOf('problem_code') : headers.indexOf('code');
    const colDomain = headers.indexOf('domain') !== -1 ? headers.indexOf('domain') : headers.indexOf('domain_code');
    const colTitle = headers.indexOf('title');
    const colDesc = headers.indexOf('description');
    const colDiff = headers.indexOf('difficulty');
    const colTags = headers.indexOf('tags');

    if (colCode === -1 || colTitle === -1 || colDesc === -1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV format. Required headers: problem_code, title, description. Optional: domain, difficulty, tags.'
      });
    }

    // Prepare domain cache
    const domains = db.prepare('SELECT id, code, name FROM domains').all();
    const domainCodeMap = {};
    for (const d of domains) {
      domainCodeMap[d.code.toUpperCase()] = d.id;
      domainCodeMap[d.name.toUpperCase()] = d.id;
    }

    // Fallback domain if none specified
    const defaultDomainId = domains[0]?.id || 1;

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    const errors = [];
    const duplicates = [];

    const insertProblem = db.prepare(`
      INSERT INTO problem_statements (
        problem_code, domain_id, title, description, detailed_requirements, expected_outcome, difficulty, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
    `);

    // Helper to parse CSV line respecting quotes
    function parseCsvLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.replace(/^["']|["']$/g, ''));
    }

    const importTx = db.transaction(() => {
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (!cols || cols.length <= Math.max(colCode, colTitle, colDesc)) {
          invalidCount++;
          errors.push(`Line ${i + 1}: Insufficient columns`);
          continue;
        }

        const code = cols[colCode]?.trim().toUpperCase();
        const title = cols[colTitle]?.trim();
        const description = cols[colDesc]?.trim();
        const domainVal = colDomain !== -1 ? cols[colDomain]?.trim().toUpperCase() : null;
        const difficulty = colDiff !== -1 && ['Easy', 'Medium', 'Hard'].includes(cols[colDiff]?.trim()) ? cols[colDiff].trim() : 'Medium';
        const tags = colTags !== -1 && cols[colTags] ? JSON.stringify(cols[colTags].split(';').map(t => t.trim())) : '[]';

        if (!code || !title || !description) {
          invalidCount++;
          errors.push(`Line ${i + 1}: Missing required fields`);
          continue;
        }

        // Check duplicate problem_code
        const existing = db.prepare('SELECT id FROM problem_statements WHERE problem_code = ?').get(code);
        if (existing) {
          duplicateCount++;
          duplicates.push(code);
          continue;
        }

        const domainId = domainCodeMap[domainVal] || defaultDomainId;

        insertProblem.run(code, domainId, title, description, null, null, difficulty, tags);
        validCount++;
      }
    });

    importTx();

    logAudit(req.user.id, 'ADMIN_IMPORTED_PROBLEMS', 'CSV', null, { validCount, duplicateCount, invalidCount }, req);

    return res.json({
      success: true,
      message: `Import processed. Successfully added ${validCount} problem statements.`,
      stats: {
        total_rows: lines.length - 1,
        valid_records: validCount,
        duplicate_records: duplicateCount,
        invalid_records: invalidCount,
        duplicate_ids: duplicates,
        errors: errors.slice(0, 10)
      }
    });
  } catch (err) {
    console.error('Import CSV error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process CSV file.' });
  }
});

// 12. Export CSV (Section 10)
router.get('/export', (req, res) => {
  try {
    const assignments = db.prepare(`
      SELECT
        u.name as participant_name,
        u.email,
        u.phone,
        u.college,
        u.course,
        u.year,
        u.team_name,
        p.problem_code as problem_id,
        p.title as problem_title,
        d.name as domain,
        a.selected_at as selection_timestamp
      FROM problem_assignments a
      JOIN users u ON a.user_id = u.id
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      ORDER BY a.selected_at ASC
    `).all();

    const headers = [
      'Participant Name',
      'Email',
      'Phone',
      'College',
      'Course',
      'Year',
      'Team',
      'Problem ID',
      'Problem Title',
      'Domain',
      'Selection Timestamp'
    ];

    function escapeCsv(val) {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }

    const rows = [headers.join(',')];
    for (const item of assignments) {
      rows.push([
        escapeCsv(item.participant_name),
        escapeCsv(item.email),
        escapeCsv(item.phone || ''),
        escapeCsv(item.college || ''),
        escapeCsv(item.course || ''),
        escapeCsv(item.year || ''),
        escapeCsv(item.team_name || ''),
        escapeCsv(item.problem_id),
        escapeCsv(item.problem_title),
        escapeCsv(item.domain),
        escapeCsv(item.selection_timestamp)
      ].join(','));
    }

    const csvData = rows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="hackathon_assignments_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate export file.' });
  }
});

// 13. Audit Logs Viewer
router.get('/audit-logs', (req, res) => {
  try {
    const { action, limit = 100 } = req.query;

    let query = `
      SELECT l.id, l.action, l.resource_type, l.resource_id, l.details, l.ip_address, l.created_at,
             u.id as user_id, u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
    `;
    const params = [];

    if (action) {
      query += ` WHERE l.action = ?`;
      params.push(action);
    }

    query += ` ORDER BY l.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10) || 100);

    const logs = db.prepare(query).all(...params);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;
