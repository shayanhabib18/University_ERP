-- Add HOD manual assignment columns to faculties table
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS hod_full_name TEXT;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS hod_email TEXT;
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS assignment_mode TEXT CHECK (assignment_mode IN ('select_faculty', 'manual'));
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS effective_from DATE;

-- Add index for HOD lookups
CREATE INDEX IF NOT EXISTS idx_faculties_hod_mode ON faculties(assignment_mode, is_hod);
