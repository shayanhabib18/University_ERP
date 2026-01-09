// Legacy admin login controller removed. Use Supabase Auth via backend/src/routes/auth.js instead.
export default function AdminLogin(_req, res) {
  res.status(410).json({ error: "Legacy admin login removed. Use /auth/login via Supabase Auth." });
}

