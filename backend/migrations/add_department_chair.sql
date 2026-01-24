-- Add department_chair column to departments table
ALTER TABLE departments ADD COLUMN department_chair UUID REFERENCES faculties(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_departments_chair ON departments(department_chair);
