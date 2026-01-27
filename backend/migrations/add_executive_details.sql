-- Add extra details for executives
ALTER TABLE executives ADD COLUMN IF NOT EXISTS executive_cnic TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS executive_phone TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS executive_address TEXT;

-- Add password and reset token fields for executive authentication
ALTER TABLE executives ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Optional indexes if lookups by CNIC/phone are needed later
CREATE INDEX IF NOT EXISTS idx_executives_cnic ON executives(executive_cnic);
CREATE INDEX IF NOT EXISTS idx_executives_phone ON executives(executive_phone);
CREATE INDEX IF NOT EXISTS idx_executives_reset_token ON executives(reset_token);
CREATE INDEX IF NOT EXISTS idx_executives_auth_user_id ON executives(auth_user_id);
