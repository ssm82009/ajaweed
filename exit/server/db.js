const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

let db;

async function initDb() {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_number TEXT UNIQUE,
      name TEXT,
      grade TEXT,
      class_name TEXT,
      mobile TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      reason TEXT,
      departure_with TEXT,
      officer_name TEXT,
      signature_data TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      FOREIGN KEY(student_id) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('header_line1', 'المملكة العربية السعودية'),
    ('header_line2', 'وزارة التعليم'),
    ('header_line3', 'الإدارة العامة للتعليم بمحافظة جدة'),
    ('header_line4', 'مدرسة الأجاويد الأولى المتوسطة');
  `);

    // Seed users if not exist
    const admin = await db.get('SELECT * FROM users WHERE role = ?', 'admin');
    if (!admin) {
        const hash = await bcrypt.hash('admin123', 10);
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
        console.log('Created admin user: admin / admin123');
    }

    const guard = await db.get('SELECT * FROM users WHERE role = ?', 'guard');
    if (!guard) {
        const hash = await bcrypt.hash('guard123', 10); // Standard password, maybe not needed if only one guard account, but good practice
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['guard', hash, 'guard']);
        console.log('Created guard user: guard / guard123');
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}

module.exports = { initDb, getDb };
