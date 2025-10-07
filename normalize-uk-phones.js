#!/usr/bin/env node
import mysql from 'mysql2/promise';

const {
  MYSQL_HOST = 'hypertec-renewals-mysql.mysql.database.azure.com',
  MYSQL_USER = 'hypertecadmin',
  MYSQL_PASSWORD,
  MYSQL_DATABASE = 'hypertec_renewals',
  MYSQL_PORT = '3306',
} = process.env;

const APPLY = process.argv.includes('--apply');

function normalizeToUkE164(raw) {
  if (!raw) return raw;
  let p = String(raw).trim();
  // strip common formatting
  p = p.replace(/[\s\-()]/g, '');

  // already +44...
  if (p.startsWith('+44')) return p;

  // 0044...
  if (p.startsWith('0044')) return '+44' + p.slice(4);

  // 44..........
  if (/^44\d+$/u.test(p)) return '+' + p;

  // 0........ (UK national)
  if (/^0\d{9,}$/u.test(p)) return '+44' + p.slice(1);

  // leave others as-is
  return p;
}

async function main() {
  if (!MYSQL_PASSWORD) {
    console.error('MYSQL_PASSWORD env var is required');
    process.exit(1);
  }

  const pool = await mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: Number(MYSQL_PORT),
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 5,
  });

  const conn = await pool.getConnection();
  try {
    // probe columns
    const [cols] = await conn.query(
      "SHOW COLUMNS FROM companies LIKE 'phone'"
    );
    if (cols.length === 0) {
      console.error("companies.phone doesn't exist. Aborting.");
      process.exit(2);
    }

    console.log('Fetching companies with phone...');
    const [rows] = await conn.query('SELECT id, name, phone FROM companies');

    const changes = [];
    for (const r of rows) {
      const current = r.phone;
      const normalized = normalizeToUkE164(current);
      if (normalized && normalized !== current) {
        changes.push({ id: r.id, name: r.name, before: current, after: normalized });
      }
    }

    console.log(`Found ${changes.length} phone numbers to normalize.`);
    for (const c of changes.slice(0, 20)) {
      console.log(`- ${c.id} ${c.name}: '${c.before}' -> '${c.after}'`);
    }
    if (changes.length > 20) console.log(`...and ${changes.length - 20} more`);

    if (!APPLY) {
      console.log('Dry-run complete. Re-run with --apply to write changes.');
      return;
    }

    console.log('Applying updates...');
    await conn.beginTransaction();
    // optional backup column
    await conn.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone_backup VARCHAR(64)");

    for (const c of changes) {
      await conn.query(
        'UPDATE companies SET phone_backup = phone, phone = ? WHERE id = ?',
        [c.after, c.id]
      );
    }
    await conn.commit();
    console.log('Updates committed.');
  } catch (err) {
    console.error('Error:', err.message);
    try { await conn.rollback(); } catch {}
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

main();


