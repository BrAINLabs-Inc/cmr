// Turns an EXISTING Supabase Auth user (e.g. one you created by hand in the
// Supabase Dashboard → Authentication) into a CMR admin, by UID.
//
// Usage:
//   npm run link-admin -- --uid <auth-user-uuid> [--name "Your Name"] [--role admin|research]
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
  const { uid, name, role = 'admin' } = parseArgs();

  if (!uid) {
    console.error('Usage: npm run link-admin -- --uid <auth-user-uuid> [--name "Your Name"] [--role admin|research]');
    process.exit(1);
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(uid);
  if (userError || !userData?.user) {
    console.error('No auth user found with that UID:', userError?.message ?? 'not found');
    process.exit(1);
  }
  const email = userData.user.email;
  if (!email) {
    console.error('That auth user has no email on file; admins requires one.');
    process.exit(1);
  }

  const { data: existingAdmin } = await supabaseAdmin.from('admins').select('id').eq('auth_user_id', uid).maybeSingle();
  if (existingAdmin) {
    console.error(`This UID is already linked to an admin (${email}).`);
    process.exit(1);
  }

  const { error: insertError } = await supabaseAdmin.from('admins').insert({
    email,
    name: name || null,
    role,
    auth_user_id: uid,
  });

  if (insertError) {
    console.error('Failed to insert admin row:', insertError.message);
    process.exit(1);
  }

  console.log(`Linked ${email} (uid ${uid}) as admin (role: ${role}).`);
}

main();
