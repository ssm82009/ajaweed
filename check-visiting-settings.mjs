import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
    const res = await db.execute("SELECT * FROM visiting_settings WHERE key IN ('sms_api_key', 'sms_sender', 'sms_enabled')");
    console.log(res.rows);
}
run();
