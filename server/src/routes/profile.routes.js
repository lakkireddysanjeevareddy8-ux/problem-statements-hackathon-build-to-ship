const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { logAudit } = require('../services/audit.service');

// Get profile
router.get('/', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// Update profile
router.put('/', authenticateToken, (req, res) => {
  try {
    const { name, phone, college, course, year, team_name, participant_id } = req.body;
    const userId = req.user.id;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          college = COALESCE(?, college),
          course = COALESCE(?, course),
          year = COALESCE(?, year),
          team_name = COALESCE(?, team_name),
          participant_id = COALESCE(?, participant_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      phone ? phone.trim() : null,
      college ? college.trim() : null,
      course ? course.trim() : null,
      year ? year.trim() : null,
      team_name ? team_name.trim() : null,
      participant_id ? participant_id.trim() : null,
      userId
    );

    const updated = db.prepare(`
      SELECT id, name, email, role, phone, college, course, year, team_name, participant_id, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId);

    logAudit(userId, 'PROFILE_UPDATED', 'USER', userId, null, req);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Get currently authenticated participant's locked problem statement
// Enforces Section 14: Never expose someone else's assignment!
router.get('/my-problem', authenticateToken, (req, res) => {
  try {
    const assignment = db.prepare(`
      SELECT
        a.id as assignment_id,
        a.selected_at,
        a.status as assignment_status,
        p.id as problem_id,
        p.problem_code,
        p.title,
        p.description,
        p.detailed_requirements,
        p.expected_outcome,
        p.difficulty,
        p.tags,
        d.id as domain_id,
        d.name as domain_name,
        d.code as domain_code,
        d.icon as domain_icon,
        u.id as user_id,
        u.name as participant_name,
        u.email as participant_email,
        u.phone as participant_phone,
        u.college,
        u.course,
        u.year,
        u.team_name,
        u.participant_id
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
    `).get(req.user.id);

    if (!assignment) {
      return res.json({
        success: true,
        hasSelected: false,
        message: 'No problem statement has been selected yet.'
      });
    }

    return res.json({
      success: true,
      hasSelected: true,
      assignment: {
        id: assignment.assignment_id,
        selected_at: assignment.selected_at,
        status: assignment.assignment_status,
        problem: {
          id: assignment.problem_id,
          code: assignment.problem_code,
          title: assignment.title,
          description: assignment.description,
          detailed_requirements: assignment.detailed_requirements,
          expected_outcome: assignment.expected_outcome,
          difficulty: assignment.difficulty,
          tags: assignment.tags,
          domain: {
            id: assignment.domain_id,
            name: assignment.domain_name,
            code: assignment.domain_code,
            icon: assignment.domain_icon
          }
        },
        participant: {
          name: assignment.participant_name,
          email: assignment.participant_email,
          phone: assignment.participant_phone,
          college: assignment.college,
          course: assignment.course,
          year: assignment.year,
          team_name: assignment.team_name,
          participant_id: assignment.participant_id
        }
      }
    });
  } catch (err) {
    console.error('Error fetching my-problem:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your selected problem statement.' });
  }
});

module.exports = router;
