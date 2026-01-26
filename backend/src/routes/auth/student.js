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

// ==================== STUDENT LOGIN ====================
// POST /auth/login
// Login with email and password
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

// ==================== STUDENT FORGOT PASSWORD ====================
// POST /auth/forgot-password
// Send password reset link to student email
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

// ==================== STUDENT RESET PASSWORD ====================
// POST /auth/reset-password
// Update password with new password using recovery token
router.post('/reset-password', async (req, res) => {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return res.status(500).json({ error: 'Supabase not configured' });

  const { password, accessToken, token } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    // Path A: Supabase recovery flow using JWT access token
    if (accessToken && typeof accessToken === 'string' && accessToken.includes('.') && accessToken.split('.').length === 3) {
      const payloadPart = accessToken.split('.')[1];
      const decodedJson = Buffer.from(payloadPart, 'base64').toString();
      const jwtPayload = JSON.parse(decodedJson);
      const userId = jwtPayload?.sub;

      if (!userId) {
        throw new Error('Invalid access token');
      }

      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(userId, { password });
      if (updateError) throw new Error(updateError.message);

      return res.json({ success: true, message: 'Password updated successfully' });
    }

    // Path B: Custom reset token flow (manual HOD or faculty invite)
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token required for manual reset flow' });
    }

    const nowIso = new Date().toISOString();

    // Try faculties table first
    const { data: faculty, error: facErr } = await supabaseClient
      .from('faculties')
      .select('id, email, auth_user_id, reset_token_expiry')
      .eq('reset_token', token)
      .gte('reset_token_expiry', nowIso)
      .maybeSingle();

    if (facErr && facErr.code !== 'PGRST116') {
      throw new Error(facErr.message);
    }

    if (faculty?.email) {
      let authUserId = faculty.auth_user_id;
      if (!authUserId) {
        // Create Supabase auth user for this faculty
        const { data: created, error: createErr } = await supabaseClient.auth.admin.createUser({
          email: faculty.email,
          password,
          email_confirm: true,
        });
        if (createErr) throw new Error(createErr.message);
        authUserId = created.user?.id;

        // Persist auth_user_id and clear reset token
        await supabaseClient
          .from('faculties')
          .update({ auth_user_id: authUserId, reset_token: null, reset_token_expiry: null })
          .eq('id', faculty.id);
      } else {
        // Update existing user's password
        const { error: updateErr } = await supabaseClient.auth.admin.updateUserById(authUserId, { password });
        if (updateErr) throw new Error(updateErr.message);

        // Clear reset token
        await supabaseClient
          .from('faculties')
          .update({ reset_token: null, reset_token_expiry: null })
          .eq('id', faculty.id);
      }

      return res.json({ success: true, message: 'Password updated successfully' });
    }

    // Fallback: Check hods table (manual HOD entries)
    const { data: hod, error: hodErr } = await supabaseClient
      .from('hods')
      .select('id, hod_email, hod_full_name, department_id, reset_token_expiry')
      .eq('reset_token', token)
      .gte('reset_token_expiry', nowIso)
      .maybeSingle();

    if (hodErr && hodErr.code !== 'PGRST116') {
      throw new Error(hodErr.message);
    }

    if (hod?.hod_email) {
      // Create Supabase user for HOD email or update if exists
      const { data: userLookup } = await supabaseClient.auth.admin.listUsers();
      const existing = userLookup?.users?.find(u => u.email === hod.hod_email);

      let authUserId;
      if (!existing) {
        const { data: created, error: createErr } = await supabaseClient.auth.admin.createUser({
          email: hod.hod_email,
          password,
          email_confirm: true,
        });
        if (createErr) throw new Error(createErr.message);
        authUserId = created.user?.id;
      } else {
        const { error: updateErr } = await supabaseClient.auth.admin.updateUserById(existing.id, { password });
        if (updateErr) throw new Error(updateErr.message);
        authUserId = existing.id;
      }

      // Create corresponding faculty record for this manually assigned HOD
      const { data: existingFaculty } = await supabaseClient
        .from('faculties')
        .select('id')
        .eq('email', hod.hod_email)
        .maybeSingle();

      if (!existingFaculty && hod.department_id) {
        // Create faculty record for manual HOD
        const { error: facultyErr } = await supabaseClient
          .from('faculties')
          .insert([{
            name: hod.hod_full_name || hod.hod_email.split('@')[0],
            email: hod.hod_email,
            department_id: hod.department_id,
            designation: 'Department Chair',
            role: 'HOD',
            auth_user_id: authUserId,
            is_hod: true,
          }]);

        if (facultyErr) {
          console.error('❌ Error creating faculty record for manual HOD:', facultyErr.message);
        } else {
          console.log(`✅ Created faculty record for manual HOD: ${hod.hod_email}`);
        }
      }

      // Clear reset token in hods
      await supabaseClient
        .from('hods')
        .update({ reset_token: null, reset_token_expiry: null })
        .eq('id', hod.id);

      // Update department_chair field with the HOD's auth_user_id
      if (hod.department_id && authUserId) {
        const { error: deptUpdateErr } = await supabaseClient
          .from('departments')
          .update({ department_chair: authUserId })
          .eq('id', hod.department_id);
        
        if (deptUpdateErr) {
          console.error(`❌ Error updating department_chair:`, deptUpdateErr.message);
        } else {
          console.log(`✅ Updated department_chair for department ${hod.department_id} with UUID: ${authUserId}`);
        }
      }

      return res.json({ success: true, message: 'Password updated successfully' });
    }

    return res.status(400).json({ error: 'Invalid or expired reset token' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
