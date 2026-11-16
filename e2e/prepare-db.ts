import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const dbFile = path.resolve('e2e/.data/groundwork.db');

fs.rmSync(path.dirname(dbFile), { recursive: true, force: true });
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

execSync('npx drizzle-kit migrate', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: `file:${dbFile}` },
});

execSync('npm run db:seed', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: dbFile },
});
