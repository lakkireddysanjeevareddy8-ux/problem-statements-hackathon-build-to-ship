const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'hackathon_super_secret_jwt_key_2026_change_in_production';

function authenticateToken(req, res, next) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare(`
      SELECT id, niat_id, auth_provider, auth_provider_user_id, name, email, profile_photo_url, role,
             phone, college, course, year, team_name, participant_id, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access forbidden: Administrator privileges required.' });
  }
  next();
}

function requireParticipant(req, res, next) {
  if (!req.user || req.user.role !== 'PARTICIPANT') {
    return res.status(403).json({ success: false, message: 'Access forbidden: Participant privileges required.' });
  }
  next();
}

function getAuthorizedAdminEmails() {
  const envList = process.env.ADMIN_EMAILS || '';
  const singleAdmin = process.env.ADMIN_EMAIL || 'admin@hackathon.org';
  const combined = `${envList},${singleAdmin}`;
  return combined
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireParticipant,
  getAuthorizedAdminEmails,
  JWT_SECRET
};

