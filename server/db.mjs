import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root directory (one level up from server folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.TURSO_URL) {
  console.error('CRITICAL ERROR: TURSO_URL is not defined in environment variables');
}

const db = createClient({
  url: process.env.TURSO_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export default db;
