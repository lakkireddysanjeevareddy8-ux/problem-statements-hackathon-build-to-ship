const db = require('../db');

function logAudit(userId, action, resourceType = null, resourceId = null, details = null, req = null) {
  try {
    let ipAddress = 'unknown';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    }
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || null);

    db.prepare(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId || null, action, resourceType, resourceId ? resourceId.toString() : null, detailsStr, ipAddress);
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

module.exports = {
  logAudit
};
