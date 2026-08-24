const { Client } = require('pg');

const PROJECT_REF = 'npodbukpprscjcywrcv';
const DB_PASSWORD = 'Jaggadaku@420';

const configs = [
  // Transaction pooler on us-east-1 (likely region based on timeout behavior)
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${PROJECT_REF}` },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: `postgres.${PROJECT_REF}` },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres' },
  // Direct DB connections
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: `postgres.${PROJECT_REF}` },
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres' },
];

(async () => {
  for (const config of configs) {
    try {
      console.log(`Trying: ${config.user}@${config.host}:${config.port}...`);
      const client = new Client({
        host: config.host,
        port: config.port,
        user: config.user,
        password: DB_PASSWORD,
        database: 'postgres',
        connectionTimeoutMillis: 8000,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      const res = await client.query('SELECT current_database(), current_user');
      console.log(`SUCCESS! DB: ${res.rows[0].current_database}, User: ${res.rows[0].current_user}`);
      await client.end();
      
      // Print the working connection string (with encoded password)
      const encodedPw = encodeURIComponent(DB_PASSWORD);
      console.log(`\nConnection string: postgresql://${config.user}:${encodedPw}@${config.host}:${config.port}/postgres`);
      process.exit(0);
    } catch (e) {
      console.log(`  Failed: ${e.message.substring(0, 100)}`);
    }
  }
  console.log('\nNone worked.');
  process.exit(1);
})();
