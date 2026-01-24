-- Create junction table for assigning courses to faculty
CREATE TABLE IF NOT EXISTS faculty_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (faculty_id, course_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_faculty_courses_faculty ON faculty_courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_courses_course ON faculty_courses(course_id);
