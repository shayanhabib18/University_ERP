-- Create login_activities table to track user logins

CREATE TABLE IF NOT EXISTS login_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL, -- 'student', 'faculty', 'dept_chair', 'coordinator', 'executive', 'admin'
  user_email TEXT,
  user_name TEXT,
  login_timestamp TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  login_status TEXT DEFAULT 'success', -- 'success', 'failed'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_login_activities_user_id ON login_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activities_user_type ON login_activities(user_type);
CREATE INDEX IF NOT EXISTS idx_login_activities_timestamp ON login_activities(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_activities_created_at ON login_activities(created_at DESC);
