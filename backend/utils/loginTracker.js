import supabase from "../model/supabaseClient.js";

/**
 * Helper function to log login activity
 * Call this after successful authentication
 */
export const trackLoginActivity = async (userData, req, loginStatus = 'success') => {
  try {
    const { user_id, user_type, user_email, user_name } = userData;

    if (!user_id || !user_type) {
      console.warn("⚠️ Incomplete login tracking data:", userData);
      return;
    }

    // Get IP address and user agent from request
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;

    const { error } = await supabase
      .from("login_activities")
      .insert([{
        user_id,
        user_type,
        user_email,
        user_name,
        ip_address,
        user_agent,
        login_status: loginStatus,
        login_timestamp: new Date().toISOString(),
      }]);

    if (error) {
      console.error("❌ Failed to log login activity:", error.message);
    } else {
      console.log(`✅ Login activity logged: ${user_type} - ${user_email}`);
    }
  } catch (error) {
    console.error("❌ Error in trackLoginActivity:", error);
  }
};
