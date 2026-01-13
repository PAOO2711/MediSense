import postgres from 'postgres';
import 'dotenv/config';
import { readFile } from 'fs/promises';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  console.log('Removing antecedentes_snapshot column...');
  
  const migrationSQL = await readFile('./remove_antecedentes_snapshot.sql', 'utf-8');
  await sql.unsafe(migrationSQL);
  
  console.log('✅ Column removed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  await sql.end();
}
