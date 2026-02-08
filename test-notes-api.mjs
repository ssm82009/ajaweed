#!/usr/bin/env node

/**
 * Test Notes API Endpoints
 * Run this to test if the notes system is working
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('='.repeat(50));
console.log('Testing Notes API');
console.log('='.repeat(50));

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function testNotes() {
    try {
        // 1. Check if notes table exists
        console.log('\n1. Checking notes table...');
        const tables = await db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'"
        );

        if (tables.rows.length === 0) {
            console.log('   ❌ Notes table does NOT exist!');
            console.log('   Solution: Run "node init-turso-db.mjs" to create tables');
            process.exit(1);
        }
        console.log('   ✅ Notes table exists');

        // 2. Count notes
        console.log('\n2. Counting notes...');
        const count = await db.execute('SELECT COUNT(*) as count FROM notes');
        console.log('   Total notes:', count.rows[0].count);

        // 3. Get sample notes
        console.log('\n3. Getting sample notes...');
        const notes = await db.execute('SELECT * FROM notes LIMIT 5');
        console.log('   Sample notes:', notes.rows.length);
        notes.rows.forEach((note, i) => {
            console.log(`   ${i + 1}. ID: ${note.id}, Student ID: ${note.student_id}, Type: ${note.type}`);
        });

        // 4. Check students table
        console.log('\n4. Checking students table...');
        const students = await db.execute('SELECT id, name, national_id FROM students LIMIT 3');
        console.log('   Sample students:', students.rows.length);
        students.rows.forEach((student, i) => {
            console.log(`   ${i + 1}. ID: ${student.id}, Name: ${student.name}, National ID: ${student.national_id}`);
        });

        // 5. Test notes for a specific student
        if (students.rows.length > 0) {
            const studentId = students.rows[0].id;
            console.log(`\n5. Testing notes for student ID ${studentId}...`);

            const studentNotes = await db.execute({
                sql: `
          SELECT 
            notes.*, 
            teachers.name as teacher_name, 
            teachers.subject as teacher_subject 
          FROM notes 
          LEFT JOIN teachers ON notes.teacher_id = teachers.id 
          WHERE notes.student_id = ? 
          ORDER BY notes.created_at DESC
        `,
                args: [studentId]
            });

            console.log(`   Notes found: ${studentNotes.rows.length}`);
            studentNotes.rows.forEach((note, i) => {
                console.log(`   ${i + 1}. Type: ${note.type}, Teacher: ${note.teacher_name || 'N/A'}`);
            });
        }

        // 6. Check teachers table
        console.log('\n6. Checking teachers table...');
        const teachers = await db.execute('SELECT id, name, national_id FROM teachers LIMIT 3');
        console.log('   Sample teachers:', teachers.rows.length);
        teachers.rows.forEach((teacher, i) => {
            console.log(`   ${i + 1}. ID: ${teacher.id}, Name: ${teacher.name}, National ID: ${teacher.national_id}`);
        });

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests passed!');
        console.log('='.repeat(50));
        console.log('\nNext steps:');
        console.log('1. Restart the server: npm run dev:server');
        console.log('2. Test the notes system in the browser');
        console.log('3. If still not working, check browser console for errors');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testNotes();
