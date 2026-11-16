import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const dbFile = path.resolve('tests/.data/api.db');

export default function setup() {
  fs.rmSync(dbFile, { force: true });
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  const sqlite = new Database(dbFile);
  const db = drizzle(sqlite);
  migrate(db, { migrationsFolder: path.resolve('src/db/migrations') });
  sqlite.close();
}
