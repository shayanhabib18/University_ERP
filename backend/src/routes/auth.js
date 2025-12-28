import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Lazy init: create client only when route is called
const getSupabaseClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
};

router.post('/login', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured. Set env in backend/.env' });
  
  const { email, password } = req.body;
  
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) return res.status(400).json({ error: error.message });
  
  res.json({
    access_token: data.session.access_token,
    user: data.user,
  });
});

export default router;
