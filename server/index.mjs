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
app.get('/api/students', (req, res) => {
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

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

app.post('/api/student/login', (req, res) => {
    const { national_id } = req.body;
    db.get("SELECT * FROM students WHERE national_id = ?", [national_id], (err, row) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (row) res.json({ "message": "success", "data": row });
        else res.status(404).json({ "error": "Student not found" });
    });
});

// Import Students
app.post('/api/upload-students', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        let successCount = 0;

        const insertStmt = db.prepare(`INSERT OR REPLACE INTO students (name, national_id, grade, class_name) VALUES (?, ?, ?, ?)`);
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            data.forEach((row) => {
                let values = Object.values(row);
                let name = row['اسم الطالب'] || values[0];
                let national_id = row['رقم الهوية'] || values[1];
                let grade = row['الصف'] || values[2];
                let class_name = row['الفصل'] || values[3];
                if (name && national_id) {
                    insertStmt.run(name, national_id, grade, class_name, (err) => {
                        if (!err) successCount++;
                    });
                }
            });
            db.run("COMMIT", () => {
                fs.unlinkSync(req.file.path);
                res.json({ message: 'Processing complete', success: successCount });
            });
        });
        insertStmt.finalize();
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

/* ================= TEACHERS ================= */
app.post('/api/teacher/login', (req, res) => {
    const { national_id } = req.body;
    db.get("SELECT * FROM teachers WHERE national_id = ?", [national_id], (err, row) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (row) res.json({ "message": "success", "data": row });
        else res.status(404).json({ "error": "Teacher not found" });
    });
});

// Import Teachers
app.post('/api/upload-teachers', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        let successCount = 0;

        const insertStmt = db.prepare(`INSERT OR REPLACE INTO teachers (name, national_id, subject) VALUES (?, ?, ?)`);
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            data.forEach((row) => {
                // "اسم المعلم", "رقم الهوية", "مادة التدريس"
                let values = Object.values(row);
                let name = row['اسم المعلم'] || values[0];
                let national_id = row['رقم الهوية'] || values[1];
                let subject = row['مادة التدريس'] || values[2];

                if (name && national_id) {
                    insertStmt.run(name, national_id, subject, (err) => {
                        if (!err) successCount++;
                    });
                }
            });
            db.run("COMMIT", () => {
                fs.unlinkSync(req.file.path);
                res.json({ message: 'Processing complete', success: successCount });
            });
        });
        insertStmt.finalize();
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

/* ================= NOTES & MESSAGING ================= */
// Create Note/Star/Message
app.post('/api/notes', (req, res) => {
    const { student_id, teacher_id, sender_type, type, sentiment, content } = req.body;
    db.run(`INSERT INTO notes (student_id, teacher_id, sender_type, type, sentiment, content) VALUES (?, ?, ?, ?, ?, ?)`,
        [student_id, teacher_id, sender_type, type, sentiment, content],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "data": { id: this.lastID } });
        }
    );
});

// Get Notes for Student
app.get('/api/notes/student/:id', (req, res) => {
    const sql = `
        SELECT 
            notes.*, 
            teachers.name as teacher_name, 
            teachers.subject as teacher_subject 
        FROM notes 
        LEFT JOIN teachers ON notes.teacher_id = teachers.id 
        WHERE notes.student_id = ? 
        ORDER BY notes.created_at DESC`;

    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

// Mark Note as Read
app.post('/api/notes/read/:id', (req, res) => {
    db.run(`UPDATE notes SET is_read = 1 WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "changes": this.changes });
    });
});

// Get Notes Sent by Teacher (for dashboard)
app.get('/api/notes/teacher/:id', (req, res) => {
    const sql = `
        SELECT 
            notes.*, 
            students.name as student_name 
        FROM notes 
        JOIN students ON notes.student_id = students.id
        WHERE notes.teacher_id = ? 
        ORDER BY notes.created_at DESC`;

    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

// Admin All Notes View
app.get('/api/admin/notes', (req, res) => {
    const sql = `
        SELECT 
            notes.*, 
            students.name as student_name,
            teachers.name as teacher_name
        FROM notes 
        LEFT JOIN students ON notes.student_id = students.id
        LEFT JOIN teachers ON notes.teacher_id = teachers.id
        ORDER BY notes.created_at DESC LIMIT 100`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});


/* ================= HONOR BOARD ================= */
// Serve static files in production and uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/honor', (req, res) => {
    db.all("SELECT * FROM honor_board ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

app.post('/api/honor', upload.single('image'), (req, res) => {
    const { title, description, category } = req.body;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(`INSERT INTO honor_board (title, description, category, image_path, date) VALUES (?, ?, ?, ?, ?)`,
        [title, description, category, image_path, new Date().toISOString()],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "data": { id: this.lastID } });
        });
});

app.post('/api/honor/delete/:id', (req, res) => {
    db.run(`DELETE FROM honor_board WHERE id = ?`, req.params.id, function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "deleted", changes: this.changes });
    });
});

/* ================= ATTENDANCE ================= */

// Helper to get settings
const getSetting = (key) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT value FROM app_settings WHERE key = ?", [key], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.value : null);
        });
    });
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

app.post('/api/attendance/settings', (req, res) => {
    const { password, threshold } = req.body;
    db.serialize(() => {
        if (password) db.run("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('attendance_password', ?)", [password]);
        if (threshold) db.run("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('late_threshold', ?)", [threshold]);
        res.json({ success: true });
    });
});

app.get('/api/attendance/student/:nid', (req, res) => {
    const nid = req.params.nid;

    // First get student info
    db.get("SELECT * FROM students WHERE national_id = ?", [nid], (err, student) => {
        if (err || !student) return res.status(404).json({ error: "Student not found" });

        // Get attendance records
        db.all("SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC", [student.id], (err, records) => {
            if (err) return res.status(500).json({ error: err.message });

            // Calculate Scores
            // Early (+3), Late (+1), Absent (-1)
            let totalPoints = 0;
            records.forEach(r => {
                totalPoints += (r.points || 0);
            });

            res.json({
                student,
                records,
                stats: {
                    totalPoints
                }
            });
        });
    });
});

app.post('/api/attendance/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const threshold = await getSetting('late_threshold') || '07:30';
        const workbook = XLSX.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        db.all("SELECT id, national_id FROM students", [], (err, allStudents) => {
            if (err) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: err.message });
            }

            const studentMap = new Map();
            allStudents.forEach(s => studentMap.set(s.national_id, s.id));

            const datesInFile = new Set();
            const presentStudentsByDate = new Map();

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const stmt = db.prepare(`INSERT OR REPLACE INTO attendance (student_id, date, time, status, points) VALUES (?, ?, ?, ?, ?)`);
                const insertStudentStmt = db.prepare(`INSERT INTO students (name, grade, class_name, national_id) VALUES (?, ?, ?, ?)`);

                const manualDate = req.body.date;

                data.forEach(row => {
                    const values = Object.values(row);
                    let name = row['اسم الطالب'] || values[0];
                    let grade = row['الصف'] || values[1];
                    let className = row['الفصل'] || values[2];
                    let nid = row['رقم الهوية'] || row['National ID'] || values[3];
                    let dateRaw = row['التاريخ'] || row['Date'] || values[4];
                    let timeRaw = row['وقت الوصول'] || row['Time'] || values[5];

                    if (!nid) return;
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

                    if (!dateStr || !timeStr) return;

                    let sid = studentMap.get(nidStr);
                    if (!sid && name) {
                        try {
                            const info = insertStudentStmt.run(name, grade || '', className || '', nidStr);
                            sid = info.lastInsertRowid;
                            studentMap.set(nidStr, sid);
                        } catch (err) { }
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
                        stmt.run(sid, dateStr, timeStr, status, points);
                    }
                });

                stmt.finalize();
                insertStudentStmt.finalize();

                datesInFile.forEach(date => {
                    const presentSet = presentStudentsByDate.get(date);
                    const absentStmt = db.prepare(`INSERT OR IGNORE INTO attendance (student_id, date, time, status, points) VALUES (?, ?, ?, ?, ?)`);
                    allStudents.forEach(s => {
                        if (!presentSet.has(s.id)) {
                            absentStmt.run(s.id, date, '-', 'absent', -1);
                        }
                    });
                    absentStmt.finalize();
                });

                db.run("COMMIT", () => {
                    if (req.file) fs.unlinkSync(req.file.path);
                    res.json({ success: true, datesProcessed: Array.from(datesInFile) });
                });
            });
        });
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

