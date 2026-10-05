const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const { authenticateToken, JWT_SECRET, getAuthorizedAdminEmails } = require('../middleware/auth');
const { logAudit } = require('../services/audit.service');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');


// POST /api/auth/admin-login
// Section 3 & 4: Admin login using authorized email address
router.post('/admin-login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter an admin email address.'
      });
    }

    // Section 6: Normalize email (trim whitespace, convert to lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    const authorizedEmails = getAuthorizedAdminEmails();

    // Section 4: If email is NOT in the authorized admin list
    if (!authorizedEmails.includes(normalizedEmail)) {
      return res.status(403).json({
        success: false,
        message: 'This email is not authorized for administrator access.'
      });
    }

    // Section 4: If email IS in authorized admin list -> Create/login admin account with role = ADMIN
    let adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (adminUser) {
      if (adminUser.role !== 'ADMIN') {
        db.prepare("UPDATE users SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminUser.id);
        adminUser.role = 'ADMIN';
      }
    } else {
      const derivedName = normalizedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      const insertResult = db.prepare(`
        INSERT INTO users (name, email, password_hash, role, auth_provider, auth_provider_user_id)
        VALUES (?, ?, 'ADMIN_AUTH_NO_PASSWORD', 'ADMIN', 'admin_email', ?)
      `).run(derivedName, normalizedEmail, normalizedEmail);

      adminUser = db.prepare('SELECT * FROM users WHERE id = ?').get(insertResult.lastInsertRowid);
    }

    // Section 7: Issue secure admin session containing ADMIN role
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

    logAudit(adminUser.id, 'ADMIN_LOGIN_AUTHORIZED_EMAIL', 'USER', adminUser.id, { email: normalizedEmail }, req);

    const safeUser = {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: 'ADMIN',
      created_at: adminUser.created_at,
      updated_at: adminUser.updated_at
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during admin login.'
    });
  }
});

// Deprecated Google Sign-In endpoint retained for API compatibility
router.post('/google', async (req, res) => {
  try {
    const { credential, googleId, email, name, picture } = req.body;

    let googleSub = null;
    let googleEmail = null;
    let googleName = null;
    let googlePicture = null;

    if (credential) {
      if (typeof credential === 'object') {
        googleSub = credential.sub || credential.id || credential.googleId;
        googleEmail = credential.email;
        googleName = credential.name;
        googlePicture = credential.picture || credential.avatar;
      } else if (typeof credential === 'string') {
        // 1. If Google Client ID is configured, verify with Google Auth Library
        if (process.env.GOOGLE_CLIENT_ID) {
          try {
            const ticket = await googleClient.verifyIdToken({
              idToken: credential,
              audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            googleSub = payload.sub;
            googleEmail = payload.email;
            googleName = payload.name;
            googlePicture = payload.picture;
          } catch (verifyErr) {
            console.warn('Google verifyIdToken verification failed, falling back to payload decode:', verifyErr.message);
          }
        }

        // 2. If verification was not possible or in local/test/demo mode, decode JWT payload safely
        if (!googleSub) {
          try {
            const parts = credential.split('.');
            if (parts.length >= 2) {
              const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
              googleSub = decodedPayload.sub || decodedPayload.id;
              googleEmail = decodedPayload.email;
              googleName = decodedPayload.name;
              googlePicture = decodedPayload.picture;
            }
          } catch (decodeErr) {
            console.error('Failed to decode credential:', decodeErr);
          }
        }
      }
    }

    // 3. Fallback to direct parameters if provided (e.g. from local test / simulated Google flow)
    if (!googleSub && googleId) {
      googleSub = googleId;
      googleEmail = email;
      googleName = name;
      googlePicture = picture;
    }

    if (!googleSub || !googleEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google authentication credential. Missing user ID or email.'
      });
    }

    const cleanEmail = googleEmail.trim().toLowerCase();

    // STEP A: Lookup by stable Google user ID (THE PRIMARY IDENTITY CRITERIA)
    let user = db.prepare(`
      SELECT id, auth_provider, auth_provider_user_id, name, email, profile_photo_url, role,
             phone, college, course, year, team_name, participant_id, created_at, updated_at
      FROM users
      WHERE auth_provider = 'google' AND auth_provider_user_id = ?
    `).get(googleSub);

    // STEP B: If not found by Google sub, check by email to link existing account
    if (!user) {
      const existingByEmail = db.prepare(`
        SELECT id, auth_provider, auth_provider_user_id, name, email, profile_photo_url, role,
               phone, college, course, year, team_name, participant_id, created_at, updated_at
        FROM users WHERE email = ?
      `).get(cleanEmail);

      if (existingByEmail) {
        db.prepare(`
          UPDATE users
          SET auth_provider = 'google',
              auth_provider_user_id = ?,
              profile_photo_url = COALESCE(?, profile_photo_url),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(googleSub, googlePicture || null, existingByEmail.id);

        user = db.prepare(`
          SELECT id, auth_provider, auth_provider_user_id, name, email, profile_photo_url, role,
                 phone, college, course, year, team_name, participant_id, created_at, updated_at
          FROM users WHERE id = ?
        `).get(existingByEmail.id);
      }
    }

    // STEP C: If still not found, CREATE NEW USER with stable USER_00X participant_id
    if (!user) {
      const participantId = db.getNextParticipantId();
      const insertResult = db.prepare(`
        INSERT INTO users (
          auth_provider, auth_provider_user_id, name, email,
          password_hash, profile_photo_url, role, participant_id
        ) VALUES ('google', ?, ?, ?, 'GOOGLE_AUTH_NO_PASSWORD', ?, 'PARTICIPANT', ?)
      `).run(
        googleSub,
        googleName || 'Participant',
        cleanEmail,
        googlePicture || null,
        participantId
      );

      user = db.prepare(`
        SELECT id, auth_provider, auth_provider_user_id, name, email, profile_photo_url, role,
               phone, college, course, year, team_name, participant_id, created_at, updated_at
        FROM users WHERE id = ?
      `).get(insertResult.lastInsertRowid);

      logAudit(user.id, 'USER_REGISTERED_GOOGLE', 'USER', user.id, {
        email: cleanEmail,
        google_sub: googleSub,
        participant_id: participantId
      }, req);
    } else {
      // Existing user returning - update avatar if newer provided
      if (googlePicture && user.profile_photo_url !== googlePicture) {
        db.prepare('UPDATE users SET profile_photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(googlePicture, user.id);
        user.profile_photo_url = googlePicture;
      }
      logAudit(user.id, 'USER_LOGIN_GOOGLE', 'USER', user.id, {
        email: cleanEmail,
        google_sub: googleSub
      }, req);
    }

    // STEP D: Retrieve assigned problem statement if already selected
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

    // STEP E: Generate application session token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        participant_id: user.participant_id,
        auth_provider: 'google'
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

    return res.json({
      success: true,
      message: 'Authenticated with Google successfully.',
      token,
      user,
      assignedProblem: assignedProblem || null
    });
  } catch (err) {
    console.error('Google authentication error:', err);
    return res.status(500).json({ success: false, message: 'Google authentication failed. Please try again.' });
  }
});


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

// Login (Supports password-based login and authorized email admin login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // If no password provided, check if authorized admin email (Section 3 & 4)
    if (!password) {
      const authorizedEmails = getAuthorizedAdminEmails();
      if (!authorizedEmails.includes(cleanEmail)) {
        return res.status(403).json({
          success: false,
          message: 'This email is not authorized for administrator access.'
        });
      }

      let adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
      if (adminUser) {
        if (adminUser.role !== 'ADMIN') {
          db.prepare("UPDATE users SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(adminUser.id);
          adminUser.role = 'ADMIN';
        }
      } else {
        const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const insertRes = db.prepare("INSERT INTO users (name, email, password_hash, role, auth_provider) VALUES (?, ?, 'ADMIN_AUTH_NO_PASSWORD', 'ADMIN', 'admin_email')").run(derivedName, cleanEmail);
        adminUser = db.prepare('SELECT * FROM users WHERE id = ?').get(insertRes.lastInsertRowid);
      }

      const token = jwt.sign({ id: adminUser.id, role: 'ADMIN', email: adminUser.email, name: adminUser.name }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'ADMIN' },
        assignedProblem: null
      });
    }
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
