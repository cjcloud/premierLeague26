// Properly load environment variables
import dotenv from 'dotenv';

// Load environment variables from all possible .env files
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.development' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Database connection setup
// Use environment variable for database connection
// Attempt to get from environment first, then fall back to hardcoded value from .env file
const databaseURL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3za5wATPudVL@ep-jolly-band-ablax6xh-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// No error throwing needed as we have a fallback

const sql = neon(databaseURL);

export const db = drizzle(sql, { schema });

// Database connection initialized

