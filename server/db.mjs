import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the root directory (one level up from server folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check if environment variables are defined
if (!process.env.TURSO_URL) {
  console.error('CRITICAL ERROR: TURSO_URL is not defined in environment variables');
  console.error('Please check your .env file and ensure TURSO_URL is set');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.error('CRITICAL ERROR: TURSO_AUTH_TOKEN is not defined in environment variables');
  console.error('Please check your .env file and ensure TURSO_AUTH_TOKEN is set');
}

// Log the database URL being used (hide token for security)
console.log('='.repeat(50));
console.log('DATABASE CONNECTION INFO:');
console.log('Database URL:', process.env.TURSO_URL || '❌ NOT SET');
console.log('Token set:', process.env.TURSO_AUTH_TOKEN ? '✅ YES (' + process.env.TURSO_AUTH_TOKEN.length + ' chars)' : '❌ NO');
console.log('='.repeat(50));

const db = createClient({
  url: process.env.TURSO_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Test connection on startup
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);

    if (error.message.includes('auth')) {
      console.error('Authentication failed. Please check your TURSO_AUTH_TOKEN');
    } else if (error.message.includes('DNS') || error.message.includes('network') || error.message.includes('getaddrinfo')) {
      console.error('Network error. Please check your internet connection and TURSO_URL');
    } else if (error.message.includes('database') && error.message.includes('not exist')) {
      console.error('Database does not exist. Please check your TURSO_URL');
    }

    return false;
  }
}

// Export both db and testConnection function
export { db, testConnection };

export default db;
