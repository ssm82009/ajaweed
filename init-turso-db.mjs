#!/usr/bin/env node

/**
 * Initialize Turso Database Tables
 * Run this script to create all required tables in Turso database
 * 
 * Usage: node init-turso-db.mjs
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('='.repeat(50));
console.log('Turso Database Initialization');
console.log('='.repeat(50));

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDatabase() {
    try {
        // Test connection first
        console.log('\n1. Testing database connection...');
        await db.execute('SELECT 1');
        console.log('   ✓ Connection successful!');

        console.log('\n2. Creating tables...');

        // Students table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        national_id TEXT UNIQUE,
        grade TEXT,
        class_name TEXT
      )
    `);
        console.log('   ✓ students table');

        // Teachers table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        national_id TEXT UNIQUE,
        subject TEXT
      )
    `);
        console.log('   ✓ teachers table');

        // Notes table
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
        console.log('   ✓ notes table');

        // Honor board table
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
        console.log('   ✓ honor_board table');

        // Attendance table
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
        console.log('   ✓ attendance table');

        // App settings table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
        console.log('   ✓ app_settings table');

        // Exit system tables
        await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);
        console.log('   ✓ exit_users table');

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
        console.log('   ✓ exit_students table');

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
        console.log('   ✓ exit_permissions table');

        await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      )
    `);
        console.log('   ✓ exit_settings table');

        // Visiting system tables
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
        console.log('   ✓ visiting_visitors table');

        await db.execute(`
      CREATE TABLE IF NOT EXISTS visiting_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
        console.log('   ✓ visiting_settings table');

        await db.execute(`
      CREATE TABLE IF NOT EXISTS visiting_admins (
        username TEXT PRIMARY KEY,
        password TEXT
      )
    `);
        console.log('   ✓ visiting_admins table');

        console.log('\n3. Seeding default data...');

        // Exit Admin
        const exitAdmin = await db.execute("SELECT * FROM exit_users WHERE role = 'admin'");
        if (exitAdmin.rows.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await db.execute({
                sql: "INSERT INTO exit_users (username, password, role) VALUES (?, ?, ?)",
                args: ['admin', hash, 'admin']
            });
            console.log('   ✓ Created exit admin user (admin/admin123)');
        }

        // Exit Guard
        const exitGuard = await db.execute("SELECT * FROM exit_users WHERE role = 'guard'");
        if (exitGuard.rows.length === 0) {
            const hash = await bcrypt.hash('guard123', 10);
            await db.execute({
                sql: "INSERT INTO exit_users (username, password, role) VALUES (?, ?, ?)",
                args: ['guard', hash, 'guard']
            });
            console.log('   ✓ Created exit guard user (guard/guard123)');
        }

        // Visiting Admin
        const visitingAdmin = await db.execute("SELECT * FROM visiting_admins WHERE username = 'admin'");
        if (visitingAdmin.rows.length === 0) {
            await db.execute({
                sql: "INSERT INTO visiting_admins (username, password) VALUES (?, ?)",
                args: ['admin', 'admin123']
            });
            console.log('   ✓ Created visiting admin user (admin/admin123)');
        }

        // Default settings
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line1', 'المملكة العربية السعودية')");
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line2', 'وزارة التعليم')");
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line3', 'الإدارة العامة للتعليم بمحافظة جدة')");
        await db.execute("INSERT OR IGNORE INTO exit_settings (key, value) VALUES ('header_line4', 'مدرسة الأجاويد الأولى المتوسطة')");

        await db.execute("INSERT OR IGNORE INTO visiting_settings (key, value) VALUES ('header_title', 'المملكة العربية السعودية\\nوزارة التعليم\\nالإدارة العامة للتعليم بمحافظة جدة\\nمدرسة الأجاويد الأولى المتوسطة')");
        await db.execute("INSERT OR IGNORE INTO visiting_settings (key, value) VALUES ('sms_enabled', 'false')");

        console.log('   ✓ Default settings created');

        console.log('\n' + '='.repeat(50));
        console.log('✓ Database initialization complete!');
        console.log('='.repeat(50));
        console.log('\nNext steps:');
        console.log('1. Restart your server: npm run dev:server');
        console.log('2. Test the notes system at http://localhost:3000');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

initDatabase();
