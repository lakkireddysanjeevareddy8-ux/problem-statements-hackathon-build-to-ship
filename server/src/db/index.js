const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../../data/hackathon.db');
const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);

// Ensure directory exists
const dir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(resolvedDbPath);

// Enable WAL mode for concurrent read/write and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// Safely migrate existing users table if columns don't exist yet in an existing database
try {
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (tableCheck) {
    try { db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'local'"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN auth_provider_user_id TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN profile_photo_url TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN participant_id TEXT"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN niat_id TEXT"); } catch (e) {}
  }
} catch (e) {}

// Initialize schema
const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schemaSql);

try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider ON users(auth_provider, auth_provider_user_id) WHERE auth_provider_user_id IS NOT NULL"); } catch (e) {}
try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_participant_id ON users(participant_id) WHERE participant_id IS NOT NULL"); } catch (e) {}
try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_niat_id ON users(niat_id) WHERE niat_id IS NOT NULL"); } catch (e) {}

// Helper to generate stable, unique sequential Participant IDs: USER_001, USER_002, etc.
function getNextParticipantId() {
  const maxRow = db.prepare(`
    SELECT participant_id FROM users
    WHERE participant_id LIKE 'USER_%'
    ORDER BY id DESC LIMIT 50
  `).all();

  let maxNum = 0;
  for (const row of maxRow) {
    if (row.participant_id) {
      const match = row.participant_id.match(/^USER_(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  let nextNum = maxNum + 1;
  let candidate = `USER_${String(nextNum).padStart(3, '0')}`;
  while (db.prepare('SELECT id FROM users WHERE participant_id = ?').get(candidate)) {
    nextNum++;
    candidate = `USER_${String(nextNum).padStart(3, '0')}`;
  }
  return candidate;
}

db.getNextParticipantId = getNextParticipantId;

// Initialize default system settings if not present
const getSetting = db.prepare('SELECT value FROM system_settings WHERE key = ?');
const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');

if (!getSetting.get('selection_status')) {
  insertSetting.run('selection_status', 'OPEN');
}
if (!getSetting.get('selection_start_time')) {
  insertSetting.run('selection_start_time', '');
}
if (!getSetting.get('selection_end_time')) {
  insertSetting.run('selection_end_time', '');
}
if (!getSetting.get('hackathon_title')) {
  insertSetting.run('hackathon_title', 'HACKATHON 2026');
}

module.exports = db;

