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

// ==================== ADMIN LOGIN ====================
// POST /admin/login
// Login with email and password
router.post('/login', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Step 2: Verify user is an admin
    const { data: adminRecord, error: adminError } = await supabaseClient
      .from('admins')
      .select('id, email, name, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminRecord) {
      console.error('Admin verification failed:', adminError?.message || 'Not an admin');
      return res.status(403).json({ error: 'User is not an authorized admin' });
    }

    // Step 3: Return success with tokens and admin info
    res.json({
      success: true,
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      admin: {
        id: adminRecord.id,
        email: adminRecord.email,
        name: adminRecord.name,
        role: adminRecord.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// ==================== VERIFY ADMIN ROLE ====================
// POST /admin/verify
// Verify if the current user is an admin
router.post('/verify', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user is in admins table
    const { data: adminRecord, error: adminError } = await supabaseClient
      .from('admins')
      .select('id, email, name, role, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminRecord) {
      return res.status(403).json({ error: 'User is not an authorized admin' });
    }

    res.json({
      success: true,
      admin: {
        id: adminRecord.id,
        email: adminRecord.email,
        name: adminRecord.name,
        role: adminRecord.role,
      },
    });
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
});

// ==================== ADMIN LOGOUT ====================
// POST /admin/logout
// Invalidate session (frontend deletes token)
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully. Please delete the token from storage.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed: ' + err.message });
  }
});

// ==================== PASSWORD RESET FOR ADMIN ====================
// POST /admin/forgot-password
// Send password reset link to admin email
router.post('/forgot-password', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // Verify admin exists
    const { data: adminRecord, error: adminError } = await supabaseClient
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminRecord) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true, 
        message: 'If this email is registered, you will receive a password reset link.' 
      });
    }

    // Send password reset email (Supabase rate limits this to 1 per 60 seconds)
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `http://localhost:5173/admin/reset-password`
    });

    if (error) throw new Error(error.message);

    console.log(`\n${'='.repeat(60)}`);
    console.log('✉️  ADMIN PASSWORD RESET EMAIL');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log('Admin will receive password reset link');
    console.log('Note: Supabase rate limits to 1 email per 60 seconds');
    console.log('='.repeat(60) + '\n');

    res.json({ 
      success: true, 
      message: 'If this email is registered, you will receive a password reset link.' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send reset link: ' + err.message });
  }
});

// ==================== RESET PASSWORD FOR ADMIN ====================
// POST /admin/reset-password
// Update admin password using recovery token
router.post('/reset-password', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { accessToken, password } = req.body;
  if (!accessToken || !password) {
    return res.status(400).json({ error: 'Access token and password required' });
  }

  try {
    // Decode token to get user ID
    const jwtPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    const userId = jwtPayload.sub;
    
    if (!userId) {
      throw new Error('Invalid access token');
    }

    // Verify this user is an admin
    const { data: adminRecord, error: adminError } = await supabaseClient
      .from('admins')
      .select('id')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (adminError || !adminRecord) {
      return res.status(403).json({ error: 'User is not an authorized admin' });
    }

    // Update password
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { password }
    );
    
    if (updateError) throw new Error(updateError.message);
    
    console.log(`✅ Admin password reset for user: ${userId}`);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
