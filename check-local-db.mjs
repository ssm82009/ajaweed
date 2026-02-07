import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./server/school.db', (err) => {
    if (err) {
        console.error("Local SB error:", err.message);
        return;
    }
    console.log("Connected to server/school.db");
});

db.serialize(() => {
    db.get("SELECT count(*) as count FROM honor_board", [], (err, row) => {
        if (err) {
            console.error("Query error:", err.message);
            return;
        }
        console.log("Local Rows Count:", row ? row.count : 0);
    });

    db.get("SELECT * FROM honor_board LIMIT 1", [], (err, row) => {
        if (err) {
            console.error(err);
        }
        console.log("Local Sample:", row);
    });
});
