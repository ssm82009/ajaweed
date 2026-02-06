const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Database Setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Visitors Table
        db.run(`CREATE TABLE IF NOT EXISTS visitors (
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
    )`);

        // Settings Table
        db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

        // Admin Table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
        username TEXT PRIMARY KEY,
        password TEXT
    )`);

        // Creates default admin if not exists
        db.get("SELECT * FROM admins WHERE username = 'admin'", (err, row) => {
            if (err) console.error("Error checking admin:", err);
            if (!row) {
                db.run("INSERT INTO admins (username, password) VALUES ('admin', 'admin123')", (err) => {
                    if (err) console.error("Error creating admin:", err);
                });
            }
        });

        // Seed default settings
        const defaultDefaults = {
            'header_title': 'المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم بمحافظة جدة\nمدرسة الأجاويد الأولى المتوسطة',
            'sms_api_key': '',
            'sms_sender': 'ALJAWAD',
            'sms_enabled': 'false'
        };

        Object.entries(defaultDefaults).forEach(([key, val]) => {
            db.run("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", [key, val], (err) => {
                if (err) console.error("Error inserting setting:", err);
            });
        });
    });
}

// Helper to get IP
const getIp = (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

// --- ROUTES ---

// 1. Settings (Public Read for Header)
app.get('/api/settings/public', (req, res) => {
    db.get("SELECT value FROM settings WHERE key = 'header_title'", (err, row) => {
        res.json({ header_title: row ? row.value : '' });
    });
});

// 2. Send OTP (SMS Integration)
const otpStore = new Map(); // Mobile -> { code, expires }

app.post('/api/send-otp', (req, res) => {
    const { mobile_number } = req.body;
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP
    otpStore.set(mobile_number, { code, expires: Date.now() + 300000 }); // 5 mins

    // Get SMS Settings
    db.all("SELECT * FROM settings WHERE key IN ('sms_api_key', 'sms_sender', 'sms_enabled')", (err, rows) => {
        if (err) {
            console.error('Settings error:', err);
            return res.json({ success: true, message: 'Simulated (Error reading settings)', debug_code: code });
        }

        const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});

        if (settings.sms_enabled === 'true' && settings.sms_api_key) {
            const message = `رمز التحقق الخاص بك هو: ${code}`;
            const encodedMsg = encodeURIComponent(message);
            // Using Almadar generic pattern or the one provided by user docs (assumed)
            const url = `http://api.almadar.net.sa/sms/sms.aspx?apikey=${settings.sms_api_key}&message=${encodedMsg}&sender=${settings.sms_sender || 'ALJAWAD'}&numbers=${mobile_number}`;

            axios.get(url)
                .then(response => {
                    console.log('SMS Sent:', response.data);
                    // Check if response actually indicates success if possible, but for now assume 200 is OK.
                    res.json({ success: true, message: 'SMS Sent' });
                })
                .catch(error => {
                    console.error('SMS Error:', error.message);
                    res.json({ success: true, message: 'SMS Failed', debug_code: code });
                });
        } else {
            res.json({ success: true, message: 'Simulation Mode', debug_code: code });
        }
    });
});

app.post('/api/verify-otp', (req, res) => {
    const { mobile_number, code } = req.body;
    const record = otpStore.get(mobile_number);

    // Allow debug/bypass if specific code pattern? No.
    // Allow simulation code verification

    if (record && record.code === code && Date.now() < record.expires) {
        otpStore.delete(mobile_number);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Invalid code' });
    }
});

// 3. Visitor Check-in
app.post('/api/check-in', (req, res) => {
    const { visitor_name, id_number, mobile_number, reason, signature } = req.body;
    const ip_address = getIp(req);

    // Use ID as serial number (1, 2, 3...)
    db.run(`INSERT INTO visitors (visitor_name, id_number, mobile_number, reason, signature, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
        [visitor_name, id_number, mobile_number, reason, signature, ip_address],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
                return;
            }

            const id = this.lastID;
            // Set serial_number to id
            db.run(`UPDATE visitors SET serial_number = ? WHERE id = ?`, [id, id]);

            res.json({
                message: 'Check-in successful',
                id: id,
                serial_number: id,
                ip_address
            });
        });
});

// Check Out via IP
app.post('/api/check-out-ip', (req, res) => {
    const ip_address = getIp(req);
    const findQuery = `SELECT * FROM visitors WHERE ip_address = ? AND check_out_time IS NULL ORDER BY id DESC LIMIT 1`;
    db.get(findQuery, [ip_address], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ message: 'No active visit found' });
        }
        db.run(`UPDATE visitors SET check_out_time = CURRENT_TIMESTAMP WHERE id = ?`, [row.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Check-out successful', serial_number: row.serial_number });
        });
    });
});

// --- ADMIN API ---

// Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM admins WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (row) res.json({ success: true, token: 'dummy-token' });
        else res.json({ success: false });
    });
});

// Get Settings
app.get('/api/admin/settings', (req, res) => {
    db.all("SELECT * FROM settings", (err, rows) => {
        const settings = rows ? rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) : {};
        res.json(settings);
    });
});

// Update Settings
app.post('/api/admin/settings', (req, res) => {
    const settings = req.body;
    if (!settings) return res.status(400).json({ error: 'No data' });

    db.serialize(() => {
        const stmt = db.prepare("REPLACE INTO settings (key, value) VALUES (?, ?)");
        Object.entries(settings).forEach(([key, value]) => {
            stmt.run(key, value);
        });
        stmt.finalize();
        res.json({ success: true });
    });
});

// Get Visits (with filters)
app.get('/api/admin/visits', (req, res) => {
    const { date } = req.query; // YYYY-MM-DD
    let query = "SELECT * FROM visitors";
    let params = [];

    if (date) {
        // SQLite date function
        query += " WHERE date(check_in_time) = ?";
        params.push(date);
    }

    query += " ORDER BY id ASC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
