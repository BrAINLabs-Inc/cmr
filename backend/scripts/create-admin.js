// Provisions a CMR admin account: creates the Supabase Auth user (if needed)
// and an admins table row. Run once per admin.
//
// Usage:
//   npm run create-admin -- --email admin@cmr.org --password "..." --name "Jane Doe" --role admin
import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase.js';

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function main() {
  const { email, password, name, role = 'admin' } = parseArgs();

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --email you@cmr.org --password "..." --name "Your Name" [--role admin|research]');
    process.exit(1);
  }

  const { data: existingAdmin } = await supabaseAdmin.from('admins').select('id').ilike('email', email).maybeSingle();
  if (existingAdmin) {
    console.error(`An admin with email ${email} already exists.`);
    process.exit(1);
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    console.error('Failed to create auth user:', createError.message);
    process.exit(1);
  }

  const { error: insertError } = await supabaseAdmin.from('admins').insert({
    email,
    name: name || null,
    role,
    auth_user_id: created.user.id,
  });

  if (insertError) {
    console.error('Auth user created but admins row failed:', insertError.message);
    process.exit(1);
  }

  console.log(`Admin account created for ${email} (role: ${role}).`);
}

main();
