// First, import dotenv to ensure environment variables are loaded
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Hard-code the database URL for debugging purposes
// This should be removed in production and replaced with proper environment variable handling
const fallbackDatabaseURL = "postgresql://neondb_owner:npg_3za5wATPudVL@ep-jolly-band-ablax6xh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Log for debugging
console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

// Try to use the environment variable, fall back to hardcoded value if not available
const databaseURL = process.env.DATABASE_URL || fallbackDatabaseURL;

// Make sure we have a database URL
if (!databaseURL) {
  throw new Error('DATABASE_URL is not set and fallback is not available');
}

const sql = neon(databaseURL);

export const db = drizzle(sql, { schema });

console.log('Database connection initialized successfully');

