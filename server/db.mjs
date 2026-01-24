import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'school.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Students Table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    national_id TEXT UNIQUE,
    grade TEXT,
    class_name TEXT
  )`);

  // Teachers Table
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    national_id TEXT UNIQUE,
    subject TEXT
  )`);

  // Notes
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    teacher_id INTEGER, 
    sender_type TEXT, 
    type TEXT,
    sentiment TEXT,  
    content TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(teacher_id) REFERENCES teachers(id)
  )`);

  // Honor Board
  db.run(`CREATE TABLE IF NOT EXISTS honor_board (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    title TEXT,
    category TEXT,
    description TEXT,
    date TEXT,
    image_path TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);

  // Attendance Table
  // status: 'early', 'late', 'absent'
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT, -- YYYY-MM-DD
    time TEXT, -- HH:MM
    status TEXT, 
    points INTEGER,
    UNIQUE(student_id, date)
  )`);

  // Settings Table (Key-Value)
  db.run(`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Initialize Default Settings
  db.run(`INSERT OR REPLACE INTO app_settings (key, value) VALUES ('attendance_password', '1245')`);
  db.run(`INSERT OR IGNORE INTO app_settings (key, value) VALUES ('late_threshold', '07:30')`);
});

export default db;
