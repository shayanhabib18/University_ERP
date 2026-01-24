-- Add executive assignment columns to faculties table
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS is_executive BOOLEAN DEFAULT FALSE;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS executive_full_name TEXT;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS executive_email TEXT;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS executive_effective_from DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faculties_is_executive ON faculties(is_executive);
CREATE INDEX IF NOT EXISTS idx_faculties_executive_mode ON faculties(role) WHERE role = 'EXECUTIVE';
