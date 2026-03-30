const Database = require('better-sqlite3');

const db = new Database('gym.db');

// create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

module.exports = db;