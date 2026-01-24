-- Add is_hod column to faculties table
ALTER TABLE faculties ADD COLUMN is_hod BOOLEAN DEFAULT FALSE;

-- Create an index on is_hod for better query performance
CREATE INDEX idx_faculties_is_hod ON faculties(is_hod);

-- Create an index on department_id and is_hod for common queries
CREATE INDEX idx_faculties_dept_hod ON faculties(department_id, is_hod);
