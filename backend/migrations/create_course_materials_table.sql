-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  size VARCHAR(50),
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on course_id for faster queries
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);

-- Add comment for documentation
COMMENT ON TABLE course_materials IS 'Stores course materials/files uploaded by faculty for student access';
COMMENT ON COLUMN course_materials.course_id IS 'Foreign key reference to courses table';
COMMENT ON COLUMN course_materials.file_path IS 'Relative or absolute path to the uploaded file';
