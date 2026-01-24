import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';
import db from './db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for file upload
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ================= STUDENTS ================= */
app.get('/api/students', async (req, res) => {
    const { query, class_name, grade } = req.query;
    let sql = "SELECT * FROM students WHERE 1=1";
    let params = [];

    if (query) {
        sql += " AND (name LIKE ? OR national_id LIKE ?)";
        params.push(`%${query}%`, `%${query}%`);
    }
    if (class_name) {
        sql += " AND class_name = ?";
        params.push(class_name);
    }
    if (grade) {
        sql += " AND grade = ?";
        params.push(grade);
    }

    try {
        const result = await db.execute({ sql, args: params });
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.post('/api/student/login', async (req, res) => {
    const { national_id } = req.body;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM students WHERE national_id = ?",
            args: [national_id]
        });
        if (result.rows.length > 0) res.json({ "message": "success", "data": result.rows[0] });
        else res.status(404).json({ "error": "Student not found" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Import Students
app.post('/api/upload-students', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        let successCount = 0;

        const statements = [];
        data.forEach((row) => {
            let values = Object.values(row);
            let name = row['اسم الطالب'] || values[0];
            let national_id = row['رقم الهوية'] || values[1];
            let grade = row['الصف'] || values[2];
            let class_name = row['الفصل'] || values[3];
            if (name && national_id) {
                statements.push({
                    sql: `INSERT OR REPLACE INTO students (name, national_id, grade, class_name) VALUES (?, ?, ?, ?)`,
                    args: [name, national_id, grade, class_name]
                });
            }
        });

        if (statements.length > 0) {
            await db.batch(statements, "write");
            successCount = statements.length;
        }

        fs.unlinkSync(req.file.path);
        res.json({ message: 'Processing complete', success: successCount });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

/* ================= TEACHERS ================= */
app.post('/api/teacher/login', async (req, res) => {
    const { national_id } = req.body;
    try {
        const result = await db.execute({
            sql: "SELECT * FROM teachers WHERE national_id = ?",
            args: [national_id]
        });
        if (result.rows.length > 0) res.json({ "message": "success", "data": result.rows[0] });
        else res.status(404).json({ "error": "Teacher not found" });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Import Teachers
app.post('/api/upload-teachers', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        let successCount = 0;

        const statements = [];
        data.forEach((row) => {
            let values = Object.values(row);
            let name = row['اسم المعلم'] || values[0];
            let national_id = row['رقم الهوية'] || values[1];
            let subject = row['مادة التدريس'] || values[2];

            if (name && national_id) {
                statements.push({
                    sql: `INSERT OR REPLACE INTO teachers (name, national_id, subject) VALUES (?, ?, ?)`,
                    args: [name, national_id, subject]
                });
            }
        });

        if (statements.length > 0) {
            await db.batch(statements, "write");
            successCount = statements.length;
        }

        fs.unlinkSync(req.file.path);
        res.json({ message: 'Processing complete', success: successCount });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

/* ================= NOTES & MESSAGING ================= */
// Create Note/Star/Message
app.post('/api/notes', async (req, res) => {
    const { student_id, teacher_id, sender_type, type, sentiment, content } = req.body;
    try {
        const result = await db.execute({
            sql: `INSERT INTO notes (student_id, teacher_id, sender_type, type, sentiment, content) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [student_id, teacher_id, sender_type, type, sentiment, content]
        });
        res.json({ "message": "success", "data": { id: Number(result.lastInsertRowid) } });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get Notes for Student
app.get('/api/notes/student/:id', async (req, res) => {
    const sql = `
        SELECT 
            notes.*, 
            teachers.name as teacher_name, 
            teachers.subject as teacher_subject 
        FROM notes 
        LEFT JOIN teachers ON notes.teacher_id = teachers.id 
        WHERE notes.student_id = ? 
        ORDER BY notes.created_at DESC`;

    try {
        const result = await db.execute({ sql, args: [req.params.id] });
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Mark Note as Read
app.post('/api/notes/read/:id', async (req, res) => {
    try {
        const result = await db.execute({
            sql: `UPDATE notes SET is_read = 1 WHERE id = ?`,
            args: [req.params.id]
        });
        res.json({ "message": "success", "changes": result.rowsAffected });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Get Notes Sent by Teacher (for dashboard)
app.get('/api/notes/teacher/:id', async (req, res) => {
    const sql = `
        SELECT 
            notes.*, 
            students.name as student_name 
        FROM notes 
        JOIN students ON notes.student_id = students.id
        WHERE notes.teacher_id = ? 
        ORDER BY notes.created_at DESC`;

    try {
        const result = await db.execute({ sql, args: [req.params.id] });
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// Admin All Notes View
app.get('/api/admin/notes', async (req, res) => {
    const sql = `
        SELECT 
            notes.*, 
            students.name as student_name,
            teachers.name as teacher_name
        FROM notes 
        LEFT JOIN students ON notes.student_id = students.id
        LEFT JOIN teachers ON notes.teacher_id = teachers.id
        ORDER BY notes.created_at DESC LIMIT 100`;

    try {
        const result = await db.execute(sql);
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});


/* ================= HONOR BOARD ================= */
// Serve static files in production and uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/honor', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM honor_board ORDER BY id DESC");
        res.json({ "message": "success", "data": result.rows });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.post('/api/honor', upload.single('image'), async (req, res) => {
    const { title, description, category } = req.body;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const result = await db.execute({
            sql: `INSERT INTO honor_board (title, description, category, image_path, date) VALUES (?, ?, ?, ?, ?)`,
            args: [title, description, category, image_path, new Date().toISOString()]
        });
        res.json({ "message": "success", "data": { id: Number(result.lastInsertRowid) } });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

app.post('/api/honor/delete/:id', async (req, res) => {
    try {
        const result = await db.execute({
            sql: `DELETE FROM honor_board WHERE id = ?`,
            args: [req.params.id]
        });
        res.json({ "message": "deleted", changes: result.rowsAffected });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

/* ================= ATTENDANCE ================= */

// Helper to get settings
const getSetting = async (key) => {
    try {
        const result = await db.execute({
            sql: "SELECT value FROM app_settings WHERE key = ?",
            args: [key]
        });
        return result.rows.length > 0 ? result.rows[0].value : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

app.post('/api/attendance/login', async (req, res) => {
    const { password } = req.body;
    try {
        const storedPass = await getSetting('attendance_password');
        if (password === storedPass) res.json({ success: true });
        else res.status(401).json({ error: 'Incorrect password' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/attendance/settings', async (req, res) => {
    try {
        const threshold = await getSetting('late_threshold') || '07:30';
        res.json({ threshold });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/attendance/settings', async (req, res) => {
    const { password, threshold } = req.body;
    try {
        const statements = [];
        if (password) {
            statements.push({
                sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('attendance_password', ?)",
                args: [password]
            });
        }
        if (threshold) {
            statements.push({
                sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('late_threshold', ?)",
                args: [threshold]
            });
        }
        if (statements.length > 0) {
            await db.batch(statements, "write");
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/attendance/student/:nid', async (req, res) => {
    const nid = req.params.nid;

    try {
        // First get student info
        const studentResult = await db.execute({
            sql: "SELECT * FROM students WHERE national_id = ?",
            args: [nid]
        });

        if (studentResult.rows.length === 0) return res.status(404).json({ error: "Student not found" });
        const student = studentResult.rows[0];

        // Get attendance records
        const attendanceResult = await db.execute({
            sql: "SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC",
            args: [student.id]
        });
        const records = attendanceResult.rows;

        // Calculate Scores
        let totalPoints = 0;
        records.forEach(r => {
            totalPoints += (Number(r.points) || 0);
        });

        res.json({
            student,
            records,
            stats: {
                totalPoints
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const threshold = await getSetting('late_threshold') || '07:30';
        const workbook = XLSX.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        const studentsResult = await db.execute("SELECT id, national_id FROM students");
        const allStudents = studentsResult.rows;

        const studentMap = new Map();
        allStudents.forEach(s => studentMap.set(String(s.national_id), s.id));

        const datesInFile = new Set();
        const presentStudentsByDate = new Map();

        const attendanceStatements = [];
        const newStudentStatements = [];

        const manualDate = req.body.date;

        for (const row of data) {
            const values = Object.values(row);
            let name = row['اسم الطالب'] || values[0];
            let grade = row['الصف'] || values[1];
            let className = row['الفصل'] || values[2];
            let nid = row['رقم الهوية'] || row['National ID'] || values[3];
            let dateRaw = row['التاريخ'] || row['Date'] || values[4];
            let timeRaw = row['وقت الوصول'] || row['Time'] || values[5];

            if (!nid) continue;
            let nidStr = String(nid).trim();

            let dateStr = manualDate;
            if (!dateStr) {
                if (dateRaw instanceof Date) dateStr = dateRaw.toISOString().split('T')[0];
                else if (typeof dateRaw === 'string') dateStr = dateRaw.trim();
            }

            let timeStr = timeRaw;
            if (timeRaw instanceof Date) {
                timeStr = timeRaw.toTimeString().slice(0, 5);
            } else if (typeof timeRaw === 'number') {
                const totalSeconds = Math.floor(timeRaw * 24 * 60 * 60);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            } else if (typeof timeRaw === 'string') {
                timeStr = timeRaw.trim();
                if (timeStr.match(/^\d{1,2}:\d{2}/)) {
                    const parts = timeStr.split(':');
                    timeStr = `${String(parts[0]).padStart(2, '0')}:${parts[1]}`;
                }
                timeStr = timeStr.slice(0, 5);
            }

            if (!dateStr || !timeStr) continue;

            let sid = studentMap.get(nidStr);
            if (!sid && name) {
                // We'll insert students first or batch them
                // For simplicity in conversion, we assume students exist or we add them individually here (slow but safe)
                try {
                    const insertRes = await db.execute({
                        sql: `INSERT INTO students (name, grade, class_name, national_id) VALUES (?, ?, ?, ?)`,
                        args: [name, grade || '', className || '', nidStr]
                    });
                    sid = Number(insertRes.lastInsertRowid);
                    studentMap.set(nidStr, sid);
                } catch (err) {
                    // might already exist
                    const check = await db.execute({ sql: "SELECT id FROM students WHERE national_id = ?", args: [nidStr] });
                    if (check.rows.length > 0) sid = check.rows[0].id;
                }
            }

            if (sid) {
                datesInFile.add(dateStr);
                if (!presentStudentsByDate.has(dateStr)) presentStudentsByDate.set(dateStr, new Set());
                presentStudentsByDate.get(dateStr).add(sid);

                let status = 'early';
                let points = 3;
                if (timeStr > threshold) {
                    status = 'late';
                    points = 1;
                }
                attendanceStatements.push({
                    sql: `INSERT OR REPLACE INTO attendance (student_id, date, time, status, points) VALUES (?, ?, ?, ?, ?)`,
                    args: [sid, dateStr, timeStr, status, points]
                });
            }
        }

        // Add absent records
        datesInFile.forEach(date => {
            const presentSet = presentStudentsByDate.get(date);
            allStudents.forEach(s => {
                if (!presentSet.has(s.id)) {
                    attendanceStatements.push({
                        sql: `INSERT OR IGNORE INTO attendance (student_id, date, time, status, points) VALUES (?, ?, ?, ?, ?)`,
                        args: [s.id, date, '-', 'absent', -1]
                    });
                }
            });
        });

        if (attendanceStatements.length > 0) {
            // Batching in chunks if too large (Turso has limits)
            const chunkSize = 50;
            for (let i = 0; i < attendanceStatements.length; i += chunkSize) {
                await db.batch(attendanceStatements.slice(i, i + chunkSize), "write");
            }
        }

        if (req.file) fs.unlinkSync(req.file.path);
        res.json({ success: true, datesProcessed: Array.from(datesInFile) });

    } catch (e) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: e.message });
    }
});

// Final fallback and listen
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
