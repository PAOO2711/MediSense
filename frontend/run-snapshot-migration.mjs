import postgres from 'postgres';
import 'dotenv/config';
import { readFile } from 'fs/promises';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  console.log('Adding antecedentes_snapshot column...');
  
  const migrationSQL = await readFile('./add_antecedentes_snapshot.sql', 'utf-8');
  await sql.unsafe(migrationSQL);
  
  console.log('✅ Migration completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  await sql.end();
}
