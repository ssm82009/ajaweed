import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './.env') });

const db = createClient({
    url: process.env.TURSO_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function checkSettings() {
    try {
        console.log('Checking Visiting Settings in Turso...');
        const result = await db.execute("SELECT * FROM visiting_settings");
        console.table(result.rows);
    } catch (err) {
        console.error('Error fetching settings:', err);
    }
}

checkSettings();
