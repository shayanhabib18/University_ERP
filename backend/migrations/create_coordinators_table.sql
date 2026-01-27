-- Migration: Create coordinators table
-- This table stores coordinator assignments for departments

CREATE TABLE IF NOT EXISTS coordinators (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculties(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  coordinator_full_name VARCHAR(255) NOT NULL,
  coordinator_email VARCHAR(255) NOT NULL UNIQUE,
  coordinator_phone VARCHAR(50),
  coordinator_cnic VARCHAR(50),
  coordinator_address TEXT,
  designation VARCHAR(255),
  qualifications TEXT,
  assignment_mode VARCHAR(50) DEFAULT 'manual' CHECK (assignment_mode IN ('select_faculty', 'manual')),
  assigned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(department_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coordinators_department_id ON coordinators(department_id);
CREATE INDEX IF NOT EXISTS idx_coordinators_faculty_id ON coordinators(faculty_id);
CREATE INDEX IF NOT EXISTS idx_coordinators_email ON coordinators(coordinator_email);

-- Add is_coordinator flag to faculties table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='faculties' AND column_name='is_coordinator') THEN
    ALTER TABLE faculties ADD COLUMN is_coordinator BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add auth_user_id to coordinators if needed (for future Auth integration)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='auth_user_id') THEN
    ALTER TABLE coordinators ADD COLUMN auth_user_id UUID;
  END IF;
END $$;

-- Add reset token columns to coordinators table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='reset_token') THEN
    ALTER TABLE coordinators ADD COLUMN reset_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='reset_token_expiry') THEN
    ALTER TABLE coordinators ADD COLUMN reset_token_expiry TIMESTAMP;
  END IF;
END $$;

-- Add trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_coordinators_updated_at ON coordinators;

CREATE OR REPLACE FUNCTION update_coordinators_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coordinators_updated_at
  BEFORE UPDATE ON coordinators
  FOR EACH ROW
  EXECUTE FUNCTION update_coordinators_timestamp();

COMMENT ON TABLE coordinators IS 'Stores coordinator assignments for departments with one coordinator per department';
COMMENT ON COLUMN coordinators.assignment_mode IS 'select_faculty: assigned from existing faculty, manual: manually created';
