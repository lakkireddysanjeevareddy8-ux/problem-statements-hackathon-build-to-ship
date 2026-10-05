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

// Initialize schema
const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schemaSql);

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
