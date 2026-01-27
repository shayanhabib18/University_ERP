-- Create update_timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create executives table (separate from faculties)
CREATE TABLE executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  executive_full_name TEXT,
  executive_email TEXT,
  executive_cnic TEXT,
  executive_phone TEXT,
  executive_address TEXT,
  assignment_mode TEXT CHECK (assignment_mode IN ('select_faculty', 'manual')),
  effective_from DATE,
  password_hash TEXT,
  reset_token TEXT,
  reset_token_expiry TIMESTAMPTZ,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(faculty_id) -- Ensure one faculty can be executive in only one record
);

-- Create index for quick lookups
CREATE INDEX idx_executives_faculty_id ON executives(faculty_id);
CREATE INDEX idx_executives_email ON executives(executive_email);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_executives_timestamp
BEFORE UPDATE ON executives
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add is_executive column to faculties for quick reference
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS is_executive BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_faculties_is_executive ON faculties(is_executive);
