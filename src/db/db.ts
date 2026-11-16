import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const filename = process.env.DATABASE_URL || 'groundwork.db';
fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });

const sqlite = new Database(filename);
export const db = drizzle(sqlite, { schema });
