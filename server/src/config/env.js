import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: envPath, quiet: true });

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy server/.env.example to server/.env and set your MongoDB Atlas (or local) URI and JWT_SECRET. ` +
        `Expected file: ${envPath}`
    );
  }
}

const appTimeZone = process.env.APP_TIMEZONE || 'UTC';

try {
  Intl.DateTimeFormat('en-US', { timeZone: appTimeZone });
} catch {
  throw new Error(`Invalid APP_TIMEZONE: ${appTimeZone}`);
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_TIMEZONE: appTimeZone,
};
