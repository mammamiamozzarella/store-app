import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    const dir = path.join(__dirname, './migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
        const sql = fs.readFileSync(path.join(dir, file), 'utf8');
        console.log(`Running ${file}...`);
        await pool.query(sql);
        console.log(`Done ${file}`);
    }
}

runMigrations()
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
