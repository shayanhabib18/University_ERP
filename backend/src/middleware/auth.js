import jwt from 'jsonwebtoken';

const { SUPABASE_JWT_SECRET } = process.env;

export function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' });
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    req.user = decoded; // contains sub (user id), email, etc.
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const headerRole = req.headers['x-role'];
    const userRole = headerRole || req.user?.user_metadata?.role || req.user?.app_metadata?.role;
    if (!roles.length) return next();
    if (!userRole) return res.status(403).json({ error: 'Role not provided' });
    if (!roles.includes(userRole)) return res.status(403).json({ error: 'Forbidden for role ' + userRole });
    next();
  };
}
