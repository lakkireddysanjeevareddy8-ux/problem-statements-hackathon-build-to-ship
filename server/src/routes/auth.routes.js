const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../services/audit.service');

// Register a new participant
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      college,
      course,
      year,
      team_name,
      participant_id
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, college, course, year, team_name, participant_id)
      VALUES (?, ?, ?, 'PARTICIPANT', ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      cleanEmail,
      passwordHash,
      phone ? phone.trim() : null,
      college ? college.trim() : null,
      course ? course.trim() : null,
      year ? year.trim() : null,
      team_name ? team_name.trim() : null,
      participant_id ? participant_id.trim() : null
    );

    const userId = result.lastInsertRowid;

    // Audit log
    logAudit(userId, 'USER_REGISTERED', 'USER', userId, { email: cleanEmail, name }, req);

    // Generate JWT
    const token = jwt.sign({ id: userId, role: 'PARTICIPANT', email: cleanEmail }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const user = db.prepare(`
      SELECT id, name, email, role, phone, college, course, year, team_name, participant_id, created_at
      FROM users WHERE id = ?
    `).get(userId);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare(`
      SELECT id, name, email, password_hash, role, phone, college, course, year, team_name, participant_id, created_at
      FROM users WHERE email = ?
    `).get(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Audit log
    logAudit(user.id, 'USER_LOGIN', 'USER', user.id, { role: user.role }, req);

    // Check if user has an assigned problem
    const assignedProblem = db.prepare(`
      SELECT a.id as assignment_id, a.selected_at, a.status as assignment_status,
             p.id as problem_id, p.problem_code, p.title, p.description, p.difficulty,
             d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      WHERE a.user_id = ?
    `).get(user.id);

    const safeUser = { ...user };
    delete safeUser.password_hash;

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
      assignedProblem: assignedProblem || null
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Get current user session info
router.get('/me', authenticateToken, (req, res) => {
  try {
    // Check if user has an assigned problem
    const assignedProblem = db.prepare(`
      SELECT a.id as assignment_id, a.selected_at, a.status as assignment_status,
             p.id as problem_id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags,
             d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      WHERE a.user_id = ?
    `).get(req.user.id);

    return res.json({
      success: true,
      user: req.user,
      assignedProblem: assignedProblem || null
    });
  } catch (err) {
    console.error('/me error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const userWithHash = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const match = await bcrypt.compare(currentPassword, userWithHash.password_hash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

    logAudit(req.user.id, 'PASSWORD_CHANGED', 'USER', req.user.id, null, req);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

module.exports = router;
