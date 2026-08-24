const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT = 'npodbukpprsjcjyrwrcv';
const PW = 'Jaggadaku@420';
const REGION = 'ap-south-1';

async function runMigrations() {
  const client = new Client({
    host: `aws-0-${REGION}.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${PROJECT}`,
    password: PW,
    database: 'postgres',
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Running: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await client.query(sql);
      console.log(`  ✓ Done\n`);
    } catch (e) {
      console.log(`  ⚠ ${e.message.substring(0, 120)}\n`);
    }
  }

  await client.end();
  console.log('All migrations complete');
}

runMigrations().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
