-- Add has_courses column to track if manually assigned HOD has courses
ALTER TABLE hods ADD COLUMN IF NOT EXISTS has_courses BOOLEAN DEFAULT FALSE;
