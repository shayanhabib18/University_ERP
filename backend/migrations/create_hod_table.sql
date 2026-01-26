-- Create dedicated HOD (Head of Department) table
CREATE TABLE IF NOT EXISTS hods (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
  
  -- For manual HOD entries (when person is not yet a faculty)
  hod_full_name TEXT,
  hod_email TEXT,
  
  -- For when HOD is created from faculty list
  assignment_mode TEXT CHECK (assignment_mode IN ('select_faculty', 'manual')),
  
  -- Effective date for HOD assignment
  effective_from DATE,
  
  -- Status tracking
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  
  -- Reset token for initial password setup (for manual entries)
  reset_token TEXT,
  reset_token_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(department_id) -- Only one active HOD per department
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_hods_department_id ON hods(department_id);
CREATE INDEX IF NOT EXISTS idx_hods_faculty_id ON hods(faculty_id);
CREATE INDEX IF NOT EXISTS idx_hods_status ON hods(status);

-- Make designation nullable in faculties table
ALTER TABLE faculties ALTER COLUMN designation DROP NOT NULL;
