const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
    const db = await open({
        filename: './gym.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        );

        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            join_date TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            fee REAL DEFAULT 0,
            plan_months INTEGER DEFAULT 1,
            plan_days INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `);

    // Add fee column if it doesn't exist
    try {
        await db.exec('ALTER TABLE members ADD COLUMN fee REAL DEFAULT 0;');
    } catch (e) {
        // Ignore error if column already exists
    }

    try {
        await db.exec('ALTER TABLE members ADD COLUMN plan_months INTEGER DEFAULT 1;');
        await db.exec('ALTER TABLE members ADD COLUMN plan_days INTEGER DEFAULT 0;');
    } catch (e) {
        // Ignore errors if columns already exist
    }

    try {
        await db.exec('ALTER TABLE members ADD COLUMN amount_paid REAL DEFAULT 0;');
    } catch (e) {
        // Ignore
    }

    try {
        await db.exec('ALTER TABLE members ADD COLUMN last_reminded_at TEXT DEFAULT NULL;');
    } catch (e) {
        // Ignore
    }

    // Set default currency if not exists
    const currencySetting = await db.get("SELECT * FROM settings WHERE key = 'currency'");
    if (!currencySetting) {
        await db.run("INSERT INTO settings (key, value) VALUES ('currency', 'INR')");
    }

    // Create default admin if not exists
    const admin = await db.get('SELECT * FROM admin_users WHERE username = ?', ['admin']);
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run('INSERT INTO admin_users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
        console.log('Created default admin: admin / admin123');
    }

    return db;
}

module.exports = initializeDatabase;
