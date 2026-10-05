const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken, getAuthorizedAdminEmails } = require('../middleware/auth');
const { logAudit } = require('../services/audit.service');

/**
 * POST /api/participants/login
 * Participant access using Full Name + NIAT ID.
 * Free-tier friendly, no external OAuth dependency, handles 140+ concurrent participants.
 */
router.post('/login', (req, res) => {
  try {
    const { name, niatId, niat_id } = req.body;
    const rawNiatId = niatId || niat_id;

    // Check if an authorized admin email was entered in either field
    const candidateEmail = (rawNiatId && typeof rawNiatId === 'string' && rawNiatId.includes('@'))
      ? rawNiatId.trim().toLowerCase()
      : ((name && typeof name === 'string' && name.includes('@')) ? name.trim().toLowerCase() : null);

    if (candidateEmail) {
      const authorizedEmails = getAuthorizedAdminEmails();
      if (authorizedEmails.includes(candidateEmail)) {
        let adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(candidateEmail);
        if (adminUser) {
          if (adminUser.role !== 'ADMIN') {
            db.prepare("UPDATE users SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminUser.id);
            adminUser.role = 'ADMIN';
          }
        } else {
          const derivedName = candidateEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const insertResult = db.prepare(`
            INSERT INTO users (name, email, password_hash, role, auth_provider, auth_provider_user_id)
            VALUES (?, ?, 'ADMIN_AUTH_NO_PASSWORD', 'ADMIN', 'admin_email', ?)
          `).run(derivedName, candidateEmail, candidateEmail);
          adminUser = db.prepare('SELECT * FROM users WHERE id = ?').get(insertResult.lastInsertRowid);
        }

        const token = jwt.sign(
          {
            id: adminUser.id,
            role: 'ADMIN',
            email: adminUser.email,
            name: adminUser.name
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logAudit(adminUser.id, 'ADMIN_LOGIN_AUTHORIZED_EMAIL', 'USER', adminUser.id, { email: candidateEmail }, req);

        return res.status(200).json({
          success: true,
          isAdmin: true,
          redirect: '/admin',
          message: 'Admin access granted',
          token,
          user: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: 'ADMIN',
            created_at: adminUser.created_at,
            updated_at: adminUser.updated_at
          },
          assignedProblem: null
        });
      }
    }

    // Validate presence of required fields (Section 16)
    if (!name || typeof name !== 'string' || !name.trim() || !rawNiatId || typeof rawNiatId !== 'string' || !rawNiatId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your name and NIAT ID.'
      });
    }

    const normalizedName = name.trim();
    // Normalize NIAT ID: trim whitespace and uppercase (e.g., 'niat003' -> 'NIAT003')
    const normalizedNiatId = rawNiatId.trim().toUpperCase();

    // 1. Search for existing participant by NIAT ID (or participant_id)
    const existingUser = db.prepare(`
      SELECT id, niat_id, name, email, role, phone, college, course, year, team_name,
             participant_id, auth_provider, auth_provider_user_id, created_at, updated_at
      FROM users
      WHERE UPPER(TRIM(niat_id)) = ? OR UPPER(TRIM(participant_id)) = ?
    `).get(normalizedNiatId, normalizedNiatId);

    let user;

    if (existingUser) {
      // 2. Case: NIAT ID already exists
      // Check if submitted name matches registered name (case-insensitive, trimmed)
      const existingNameClean = existingUser.name.trim().toLowerCase();
      const inputNameClean = normalizedName.toLowerCase();

      if (existingNameClean !== inputNameClean) {
        // Return 409 Conflict with specified error message (Section 3 & 16)
        return res.status(409).json({
          success: false,
          code: 'NAME_MISMATCH',
          message: 'This NIAT ID is already registered with a different name. Please contact the organizer.'
        });
      }

      // If name matches, retrieve existing participant account without creating duplicates
      user = existingUser;

      // Ensure niat_id column is populated on existing record if it was null
      if (!user.niat_id) {
        db.prepare('UPDATE users SET niat_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(normalizedNiatId, user.id);
        user.niat_id = normalizedNiatId;
      }

      logAudit(user.id, 'PARTICIPANT_LOGIN', 'USER', user.id, { niat_id: normalizedNiatId }, req);
    } else {
      // 3. Case: NIAT ID does not exist -> Create new participant account (Section 3)
      const deterministicEmail = `${normalizedNiatId.toLowerCase()}@hackathon.niat`;

      // Check if email happens to conflict with legacy user
      let finalEmail = deterministicEmail;
      const emailConflict = db.prepare('SELECT id FROM users WHERE email = ?').get(finalEmail);
      if (emailConflict) {
        finalEmail = `${normalizedNiatId.toLowerCase()}_${Date.now()}@hackathon.niat`;
      }

      const insertResult = db.prepare(`
        INSERT INTO users (
          niat_id, name, email, password_hash, role,
          auth_provider, auth_provider_user_id, participant_id
        ) VALUES (?, ?, ?, 'NIAT_AUTH_NO_PASSWORD', 'PARTICIPANT', 'niat', ?, ?)
      `).run(
        normalizedNiatId,
        normalizedName,
        finalEmail,
        normalizedNiatId,
        normalizedNiatId
      );

      user = db.prepare(`
        SELECT id, niat_id, name, email, role, phone, college, course, year, team_name,
               participant_id, auth_provider, auth_provider_user_id, created_at, updated_at
        FROM users
        WHERE id = ?
      `).get(insertResult.lastInsertRowid);

      logAudit(user.id, 'PARTICIPANT_REGISTERED', 'USER', user.id, { niat_id: normalizedNiatId, name: normalizedName }, req);
    }

    // 4. Retrieve existing problem assignment if any (Section 4 & 12)
    const assignedProblem = db.prepare(`
      SELECT a.id as assignment_id, a.selected_at, a.status as assignment_status,
             p.id as problem_id, p.problem_code, p.title, p.description, p.detailed_requirements,
             p.expected_outcome, p.difficulty, p.tags,
             d.name as domain_name, d.code as domain_code, d.icon as domain_icon
      FROM problem_assignments a
      JOIN problem_statements p ON a.problem_statement_id = p.id
      JOIN domains d ON p.domain_id = d.id
      WHERE a.user_id = ?
    `).get(user.id);

    // 5. Issue JWT session token (Section 4)
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        niat_id: user.niat_id,
        email: user.email,
        participant_id: user.participant_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name} 👋`,
      token,
      user: {
        id: user.id,
        niat_id: user.niat_id,
        name: user.name,
        email: user.email,
        role: user.role,
        participant_id: user.participant_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      assignedProblem: assignedProblem || null
    });
  } catch (err) {
    console.error('Participant login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// GET /api/participants/me - Session check for participant
router.get('/me', authenticateToken, (req, res) => {
  try {
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
    console.error('Participant /me error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

module.exports = router;
