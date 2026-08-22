// Bulk-loads the student roster from a CSV file (columns: studentNumber,name,email).
// Usage: npm run import-students -- path/to/roster.csv
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { supabaseAdmin } from '../src/config/supabase.js';

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());
  return lines
    .filter(Boolean)
    .map((line) => {
      const cells = line.split(',').map((c) => c.trim());
      return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
    });
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: npm run import-students -- path/to/roster.csv');
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(path, 'utf8')).map((r) => ({
    student_number: r.studentNumber,
    name: r.name,
    email: r.email,
  }));

  if (rows.length === 0) {
    console.error('No rows found in CSV.');
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin.from('students').upsert(rows, { onConflict: 'email' }).select('id');
  if (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }

  console.log(`Imported/updated ${data.length} students.`);
}

main();
