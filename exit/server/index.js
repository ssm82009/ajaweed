const express = require('express');
const cors = require('cors');
const { initDb, getDb } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super_secret_key_change_in_prod';

app.use(cors());
app.use(express.json({ limit: '50mb' })); // For base64 signatures

const upload = multer({ dest: 'uploads/' });

// Middleware for validating JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', username);

    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
    res.json({ token, role: user.role });
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const db = getDb();
    const hash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
});

// Student Import
const XLSX = require('xlsx');

// Student Import
app.post('/api/import-students', authenticateToken, upload.single('file'), async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    console.log('Import request received. File:', req.file);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        console.log('Reading file with XLSX...');
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Get data as array of arrays
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const db = getDb();

        let count = 0;
        // Identify headers
        const headers = data[0].map(h => String(h).trim());
        console.log('Detected headers:', headers);

        const colMap = {
            name: headers.findIndex(h => h.includes('اسم') || h.toLowerCase().includes('name')),
            id_number: headers.findIndex(h => h.includes('هوية') || h.includes('الهوية') || h.toLowerCase().includes('id')),
            grade: headers.findIndex(h => h.includes('صف') || h.includes('الصف') || h.toLowerCase().includes('grade')),
            class_name: headers.findIndex(h => h.includes('فصل') || h.includes('الفصل') || h.toLowerCase().includes('class')),
            mobile: headers.findIndex(h => h.includes('جوال') || h.includes('الجوال') || h.toLowerCase().includes('mobile')),
        };

        console.log('Column Mapping:', colMap);

        // Check if mandatory columns are found
        if (colMap.name === -1 || colMap.id_number === -1) {
            throw new Error('لم يتم العثور على الأعمدة المطلوبة (اسم الطالب، رقم الهوية). تأكد من صحة مسميات الأعمدة.');
        }

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const name = colMap.name !== -1 ? row[colMap.name] : '';
            const id_number = colMap.id_number !== -1 ? row[colMap.id_number] : '';
            const grade = colMap.grade !== -1 ? row[colMap.grade] : '';
            const class_name = colMap.class_name !== -1 ? row[colMap.class_name] : '';
            const mobile = colMap.mobile !== -1 ? row[colMap.mobile] : '';

            if (id_number && name) {
                await db.run(`INSERT INTO students (id_number, name, grade, class_name, mobile) 
                    VALUES (?, ?, ?, ?, ?) 
                    ON CONFLICT(id_number) DO UPDATE SET 
                    name=excluded.name, grade=excluded.grade, class_name=excluded.class_name, mobile=excluded.mobile`,
                    [String(id_number), String(name), String(grade), String(class_name), String(mobile)])
                    .then(() => count++)
                    .catch(err => console.error('Import row error', err));
            }
        }

        // Cleanup
        fs.unlinkSync(req.file.path);
        res.json({ message: `تمت العملية بنجاح. تم استيراد بيانات ${count} طالب.` });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

// Search Students
// Get Filters for Search
app.get('/api/students/filters', authenticateToken, async (req, res) => {
    const db = getDb();
    const grades = await db.all('SELECT DISTINCT grade FROM students WHERE grade IS NOT NULL ORDER BY grade');
    const classes = await db.all('SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL ORDER BY class_name');
    res.json({ grades: grades.map(g => g.grade), classes: classes.map(c => c.class_name) });
});

// Search Students
app.get('/api/students/search', authenticateToken, async (req, res) => {
    const { name, id_number, mobile, grade, class_name } = req.query;
    const db = getDb();

    // If no params, return latest 5000 (effectively all for this scale)
    if (!name && !id_number && !mobile && !grade && !class_name) {
        const students = await db.all('SELECT * FROM students ORDER BY id DESC LIMIT 5000');
        return res.json(students);
    }

    let sql = `SELECT * FROM students WHERE 1=1`;
    const params = [];

    if (name) {
        sql += ` AND name LIKE ?`;
        params.push(`%${name}%`);
    }
    if (id_number) {
        sql += ` AND id_number LIKE ?`; // Partial match for ID? Usually ID is exact, but user asked for "Search". Partial is safer for UX.
        params.push(`%${id_number}%`);
    }
    if (mobile) {
        sql += ` AND mobile LIKE ?`;
        params.push(`%${mobile}%`);
    }
    if (grade) {
        sql += ` AND grade = ?`;
        params.push(grade);
    }
    if (class_name) {
        sql += ` AND class_name = ?`; // Column is class_name
        params.push(class_name);
    }

    sql += ` LIMIT 5000`;

    const students = await db.all(sql, params);
    res.json(students);
});

// Permissions
app.post('/api/permissions', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { student_id, reason, departure_with, officer_name, signature_data } = req.body;
    const db = getDb();

    await db.run(
        `INSERT INTO permissions (student_id, reason, departure_with, officer_name, signature_data, status) 
     VALUES (?, ?, ?, ?, ?, 'pending')`,
        [student_id, reason, departure_with, officer_name, signature_data]
    );
    res.json({ message: 'Permission created' });
});

app.get('/api/permissions', authenticateToken, async (req, res) => {
    const { date } = req.query; // '2023-10-27'
    const db = getDb();

    let sql = `
    SELECT p.*, s.name as student_name, s.grade, s.class_name 
    FROM permissions p 
    JOIN students s ON p.student_id = s.id
  `;
    const params = [];

    if (date) {
        sql += ` WHERE date(p.created_at) = ?`;
        params.push(date);
    } else {
        // Default to today
        sql += ` WHERE date(p.created_at) = date('now', 'localtime')`;
    }

    sql += ` ORDER BY p.created_at DESC`;

    const permissions = await db.all(sql, params);
    res.json(permissions);
});

app.put('/api/permissions/:id/confirm', authenticateToken, async (req, res) => {
    if (req.user.role !== 'guard') return res.sendStatus(403);
    const db = getDb();
    const { id } = req.params;

    await db.run(`UPDATE permissions SET status = 'confirmed', exit_time = CURRENT_TIMESTAMP WHERE id = ?`, id);
    res.json({ message: 'Confirmed' });
});

// Reports
app.get('/api/student/:id_number/history', authenticateToken, async (req, res) => {
    const { id_number } = req.params;
    const db = getDb();

    const student = await db.get('SELECT * FROM students WHERE id_number = ?', id_number);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const permissions = await db.all(`
    SELECT * FROM permissions WHERE student_id = ? ORDER BY created_at DESC
  `, student.id);

    res.json({ student, permissions });
});

// Settings
app.get('/api/settings', async (req, res) => {
    const db = getDb();
    const settings = await db.all('SELECT key, value FROM settings');
    const result = {};
    settings.forEach(s => result[s.key] = s.value);
    res.json(result);
});

app.post('/api/settings', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const db = getDb();
    const updates = req.body;
    console.log('Received settings update:', updates);

    try {
        for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === null) continue;
            await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
        }
        res.json({ message: 'Settings updated' });
    } catch (err) {
        console.error('Settings update error:', err);
        res.status(500).json({ message: 'Error saving settings' });
    }
});

// 404 debug handler
app.use((req, res, next) => {
    console.log(`[DEBUG] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Start Server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
