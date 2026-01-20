-- Add auth_user_id column to link Supabase Auth users
ALTER TABLE faculties
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add reset token columns for password setup flow
ALTER TABLE faculties
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_faculties_auth_user_id ON faculties(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_faculties_reset_token ON faculties(reset_token);
