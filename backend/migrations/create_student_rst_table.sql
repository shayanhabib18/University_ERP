-- Create table for storing student RST (Result Summary Table) data
CREATE TABLE IF NOT EXISTS student_rst (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
    rst_data JSONB NOT NULL, -- Stores the components and marks structure
    grade VARCHAR(5), -- Final calculated grade (A, A-, B+, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id) -- One RST per student per course
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_student_rst_student_id ON student_rst(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rst_course_id ON student_rst(course_id);
CREATE INDEX IF NOT EXISTS idx_student_rst_faculty_id ON student_rst(faculty_id);

-- Add comment to table
COMMENT ON TABLE student_rst IS 'Stores Result Summary Table data for each student in each course';
COMMENT ON COLUMN student_rst.rst_data IS 'JSON structure: {components: [{id, name, maxMarks, weightage}], marks: {componentId: value}}';
