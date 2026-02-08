#!/usr/bin/env node

/**
 * Debug Database Connection
 * Shows which database we're connecting to
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('='.repeat(50));
console.log('Database Debug Information');
console.log('='.repeat(50));

console.log('\n1. Environment Variables:');
console.log('   TURSO_URL:', process.env.TURSO_URL || '❌ NOT SET');
console.log('   TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN ? '✅ SET (' + process.env.TURSO_AUTH_TOKEN.length + ' chars)' : '❌ NOT SET');

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.log('\n❌ ERROR: Missing environment variables!');
    console.log('   The app cannot connect to Turso database.');
    console.log('\n   Solution:');
    console.log('   - Create .env file in the project root');
    console.log('   - Or set environment variables in cPanel Node.js settings');
    process.exit(1);
}

console.log('\n2. Connecting to database...');
const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkDatabase() {
    try {
        // Get SQLite version
        const version = await db.execute('SELECT sqlite_version() as version');
        console.log('   ✅ Connected to Turso database');
        console.log('   SQLite version:', version.rows[0].version);

        // Check if notes table exists and count rows
        console.log('\n3. Checking notes table:');

        try {
            const count = await db.execute('SELECT COUNT(*) as count FROM notes');
            console.log('   ✅ Notes table exists');
            console.log('   Total rows in notes table:', count.rows[0].count);
        } catch (err) {
            if (err.message.includes('no such table')) {
                console.log('   ❌ Notes table does NOT exist!');
                console.log('   Solution: Run "node init-turso-db.mjs" to create tables');
            } else {
                console.log('   ❌ Error:', err.message);
            }
        }

        // List all tables
        console.log('\n4. All tables in database:');
        const tables = await db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        );

        if (tables.rows.length === 0) {
            console.log('   No tables found!');
        } else {
            tables.rows.forEach(row => {
                console.log('   -', row.name);
            });
        }

        console.log('\n' + '='.repeat(50));
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
        process.exit(1);
    }
}

checkDatabase();
