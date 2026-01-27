import supabase from "../model/supabaseClient.js";

// Log a login activity
export const logLoginActivity = async (req, res) => {
  try {
    const { user_id, user_type, user_email, user_name, login_status = 'success' } = req.body;

    if (!user_id || !user_type) {
      return res.status(400).json({ error: "user_id and user_type are required" });
    }

    // Get IP address and user agent from request
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;

    const { data, error } = await supabase
      .from("login_activities")
      .insert([{
        user_id,
        user_type,
        user_email,
        user_name,
        ip_address,
        user_agent,
        login_status,
        login_timestamp: new Date().toISOString(),
      }])
      .select();

    if (error) {
      console.error("Failed to log login activity:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Login activity logged",
      data: data[0],
    });
  } catch (error) {
    console.error("Error logging login activity:", error);
    res.status(500).json({
      error: "Failed to log login activity",
      message: error.message,
    });
  }
};

// Get login activities with filters and aggregations
export const getLoginActivities = async (req, res) => {
  try {
    const { 
      user_type, 
      days = 30, 
      limit = 100,
      group_by = null // 'day', 'hour', 'user_type'
    } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = supabase
      .from("login_activities")
      .select("*")
      .gte("login_timestamp", startDate.toISOString())
      .order("login_timestamp", { ascending: false });

    if (user_type) {
      query = query.eq("user_type", user_type);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching login activities:", error);
    res.status(500).json({
      error: "Failed to fetch login activities",
      message: error.message,
    });
  }
};

// Get login heatmap data (aggregated by day and hour)
export const getLoginHeatmapData = async (req, res) => {
  try {
    const { days = 30, user_type = null } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = supabase
      .from("login_activities")
      .select("login_timestamp, user_type, login_status")
      .gte("login_timestamp", startDate.toISOString())
      .eq("login_status", "success");

    if (user_type) {
      query = query.eq("user_type", user_type);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Process data into heatmap format
    // Group by day of week (0-6) and hour (0-23)
    const heatmapData = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize heatmap structure
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        heatmapData[key] = {
          day: daysOfWeek[day],
          dayIndex: day,
          hour: hour,
          count: 0,
        };
      }
    }

    // Aggregate login counts
    (data || []).forEach(activity => {
      const timestamp = new Date(activity.login_timestamp);
      const day = timestamp.getDay(); // 0-6
      const hour = timestamp.getHours(); // 0-23
      const key = `${day}-${hour}`;
      
      if (heatmapData[key]) {
        heatmapData[key].count += 1;
      }
    });

    // Convert to array format
    const heatmapArray = Object.values(heatmapData);

    // Calculate statistics
    const totalLogins = (data || []).length;
    const uniqueUsers = new Set((data || []).map(d => d.user_type)).size;

    res.json({
      success: true,
      totalLogins,
      uniqueUsers,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      heatmapData: heatmapArray,
    });
  } catch (error) {
    console.error("Error generating heatmap data:", error);
    res.status(500).json({
      error: "Failed to generate heatmap data",
      message: error.message,
    });
  }
};

// Get login statistics summary
export const getLoginStatistics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data, error } = await supabase
      .from("login_activities")
      .select("user_type, login_status, login_timestamp")
      .gte("login_timestamp", startDate.toISOString());

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Calculate statistics
    const stats = {
      totalLogins: data?.length || 0,
      successfulLogins: (data || []).filter(d => d.login_status === 'success').length,
      failedLogins: (data || []).filter(d => d.login_status === 'failed').length,
      byUserType: {},
    };

    // Group by user type
    (data || []).forEach(activity => {
      if (!stats.byUserType[activity.user_type]) {
        stats.byUserType[activity.user_type] = {
          total: 0,
          success: 0,
          failed: 0,
        };
      }
      stats.byUserType[activity.user_type].total += 1;
      if (activity.login_status === 'success') {
        stats.byUserType[activity.user_type].success += 1;
      } else {
        stats.byUserType[activity.user_type].failed += 1;
      }
    });

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching login statistics:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
};
