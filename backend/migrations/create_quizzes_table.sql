-- Migration: Create quizzes and quiz_submissions tables

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS quiz_submissions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- Create quizzes table
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  ai_prompt TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'descriptive', 'mixed')),
  questions JSONB NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  total_questions INTEGER NOT NULL,
  passing_score INTEGER DEFAULT 50,
  is_published BOOLEAN DEFAULT TRUE,
  deadline TIMESTAMP,
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create quiz_submissions table
CREATE TABLE quiz_submissions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  results JSONB,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quiz_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_faculty_id ON quizzes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_student_id ON quiz_submissions(student_id);

-- Add trigger to update updated_at timestamp for quizzes
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;

CREATE OR REPLACE FUNCTION update_quizzes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_quizzes_timestamp();

-- Comments
COMMENT ON TABLE quizzes IS 'Stores AI-generated quizzes created by faculty';
COMMENT ON TABLE quiz_submissions IS 'Stores student quiz submissions with auto-graded results';
COMMENT ON COLUMN quizzes.questions IS 'JSONB array of quiz questions with options and correct answers';
COMMENT ON COLUMN quizzes.ai_prompt IS 'AI prompt used to generate questions';
COMMENT ON COLUMN quizzes.duration_minutes IS 'Quiz duration in minutes';
COMMENT ON COLUMN quizzes.passing_score IS 'Minimum score percentage to pass';
COMMENT ON COLUMN quiz_submissions.results IS 'JSONB array with detailed results for each question';
