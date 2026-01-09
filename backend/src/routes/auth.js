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

// LOGIN
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

// FORGOT PASSWORD - Send reset link
router.post('/forgot-password', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  try {
    // Use the standard Supabase password reset flow
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `http://localhost:5173/reset-password`
    });
    
    if (error) throw new Error(error.message);

    console.log(`\n${'='.repeat(60)}`);
    console.log('🔗 PASSWORD RESET EMAIL SENT');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Check your email for the password reset link`);
    console.log('='.repeat(60) + '\n');
    
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// RESET PASSWORD - Update password with new password
router.post('/reset-password', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { password, accessToken } = req.body;
  if (!password || !accessToken) {
    return res.status(400).json({ error: 'Password and accessToken required' });
  }

  try {
    // The access token contains the user ID in the JWT payload
    // Decode it to get the user ID
    const jwtPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    const userId = jwtPayload.sub;
    
    if (!userId) {
      throw new Error('Invalid access token');
    }
    
    // Update the user's password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { password }
    );
    
    if (updateError) throw new Error(updateError.message);
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
