-- Add approval status columns to student_rst table

-- Add approval_status column
ALTER TABLE student_rst 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- Ensure approved_by exists with correct UUID type
ALTER TABLE student_rst DROP COLUMN IF EXISTS approved_by;
ALTER TABLE student_rst 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES faculties(id);

-- Add approved_at timestamp
ALTER TABLE student_rst 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Ensure rejected_by exists with correct UUID type
ALTER TABLE student_rst DROP COLUMN IF EXISTS rejected_by;
ALTER TABLE student_rst 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES faculties(id);

-- Add rejected_at timestamp
ALTER TABLE student_rst 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Add rejection_reason column
ALTER TABLE student_rst 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add check constraint for valid approval statuses
ALTER TABLE student_rst
ADD CONSTRAINT approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing records to 'pending' if NULL
UPDATE student_rst 
SET approval_status = 'pending' 
WHERE approval_status IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_rst_approval_status 
ON student_rst(approval_status);

CREATE INDEX IF NOT EXISTS idx_student_rst_student_approved 
ON student_rst(student_id, approval_status);
