import db from './db.mjs';
import bcrypt from 'bcryptjs';

async function init() {
    console.log('Initializing database tables and seeding...');

    try {
        // Existing tables (assumed)
        await db.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        national_id TEXT UNIQUE,
        grade TEXT,
        class_name TEXT
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        national_id TEXT UNIQUE,
        subject TEXT
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER,
          teacher_id INTEGER,
          sender_type TEXT,
          type TEXT,
          sentiment TEXT,
          content TEXT,
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(student_id) REFERENCES students(id),
          FOREIGN KEY(teacher_id) REFERENCES teachers(id)
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS honor_board (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        category TEXT,
        image_path TEXT,
        date TEXT
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        date TEXT,
        time TEXT,
        status TEXT,
        points INTEGER,
        FOREIGN KEY(student_id) REFERENCES students(id),
        UNIQUE(student_id, date)
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

        // --- EXIT SYSTEM TABLES ---
        await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_number TEXT UNIQUE,
        name TEXT,
        grade TEXT,
        class_name TEXT,
        mobile TEXT
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        reason TEXT,
        departure_with TEXT,
        officer_name TEXT,
        signature_data TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        exit_time DATETIME,
        FOREIGN KEY(student_id) REFERENCES exit_students(id)
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      )
    `);

        // --- VISITING SYSTEM TABLES ---
        await db.execute(`
      CREATE TABLE IF NOT EXISTS visiting_visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_name TEXT,
        id_number TEXT,
        mobile_number TEXT,
        reason TEXT,
        signature TEXT,
        check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        check_out_time DATETIME,
        ip_address TEXT,
        serial_number INTEGER
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS visiting_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

        await db.execute(`
      CREATE TABLE IF NOT EXISTS visiting_admins (
        username TEXT PRIMARY KEY,
        password TEXT
      )
    `);

        // --- SEEDING ---
        // Exit Admin
        const exitAdmin = await db.execute("SELECT * FROM exit_users WHERE role = 'admin'");
        if (exitAdmin.rows.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await db.execute({
                sql: "INSERT INTO exit_users (username, password, role) VALUES (?, ?, ?)",
                args: ['admin', hash, 'admin']
            });
            console.log('Seed: Created exit admin user.');
        }

        const exitGuard = await db.execute("SELECT * FROM exit_users WHERE role = 'guard'");
        if (exitGuard.rows.length === 0) {
            const hash = await bcrypt.hash('guard123', 10);
            await db.execute({
                sql: "INSERT INTO exit_users (username, password, role) VALUES (?, ?, ?)",
                args: ['guard', hash, 'guard']
            });
            console.log('Seed: Created exit guard user.');
        }

        // Visiting Admin
        const visitingAdmin = await db.execute("SELECT * FROM visiting_admins WHERE username = 'admin'");
        if (visitingAdmin.rows.length === 0) {
            await db.execute({
                sql: "INSERT INTO visiting_admins (username, password) VALUES (?, ?)",
                args: ['admin', 'admin123']
            });
            console.log('Seed: Created visiting admin user.');
        }

        // Default settings
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line1', 'المملكة العربية السعودية')");
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line2', 'وزارة التعليم')");
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line3', 'الإدارة العامة للتعليم بمحافظة جدة')");
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line4', 'مدرسة الأجاويد الأولى المتوسطة')");

        await db.execute("INSERT OR IGNORE INTO visiting_settings (key, value) VALUES ('header_title', 'المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم بمحافظة جدة\nمدرسة الأجاويد الأولى المتوسطة')");
        await db.execute("INSERT OR IGNORE INTO visiting_settings (key, value) VALUES ('sms_enabled', 'false')");

        console.log('Database tables initialized and seeded successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

init();
