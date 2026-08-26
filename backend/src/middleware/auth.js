import { supabaseAdmin } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const authUser = data.user;

  const [{ data: student }, { data: admin }] = await Promise.all([
    supabaseAdmin.from('students').select('*').eq('auth_user_id', authUser.id).maybeSingle(),
    supabaseAdmin.from('admins').select('*').eq('auth_user_id', authUser.id).maybeSingle(),
  ]);

  if (!student && !admin) {
    return res.status(403).json({ error: 'Account is not provisioned. Contact CMR staff.' });
  }

  req.authUser = authUser;
  req.student = student || null;
  req.admin = admin || null;
  next();
}

export function requireStudent(req, res, next) {
  if (!req.student) {
    return res.status(403).json({ error: 'Student access only' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}
