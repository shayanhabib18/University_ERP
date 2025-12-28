-- University ERP Supabase Schema
-- Run this in Supabase SQL Editor (Database > SQL) on your project

-- 1) Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN','TEACHER','STUDENT','FACULTY','DEPARTMENT_CHAIR','COORDINATOR','EXECUTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE joining_session AS ENUM ('Fall','Spring');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_type AS ENUM ('SEMESTER_FREEZE','COURSE_ADD_DROP','FINANCIAL_AID','LEAVE_APPLICATION','RESOURCE_REQUEST','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('PENDING','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Profiles (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role user_role NOT NULL,
  phone text,
  cnic text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  chair_profile_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id bigserial PRIMARY KEY,
  department_id bigint NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  semester int NOT NULL CHECK (semester BETWEEN 1 AND 8),
  crhr smallint NOT NULL CHECK (crhr BETWEEN 1 AND 4),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course prerequisites (many-to-many self reference)
CREATE TABLE IF NOT EXISTS public.course_prerequisites (
  course_id bigint NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  prerequisite_course_id bigint NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, prerequisite_course_id)
);

-- 5) Faculty details (extends profiles)
CREATE TABLE IF NOT EXISTS public.faculty (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  designation text, -- Professor, Associate Professor, Lecturer, etc.
  qualification text,
  specialization text,
  joining_date date,
  experience_years int,
  documents_url text
);

-- 6) Students (extends profiles)
CREATE TABLE IF NOT EXISTS public.students (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  roll_no text UNIQUE NOT NULL,
  father_name text,
  dob date,
  gender text CHECK (gender IN ('Male','Female','Other')),
  guardian_phone text,
  permanent_address text,
  joining_session joining_session,
  joining_date date,
  degree_program text,
  documents_url text
);

-- 7) Semesters for students
CREATE TABLE IF NOT EXISTS public.student_semesters (
  id bigserial PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(profile_id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g. 'Fall 2024'
  number int CHECK (number BETWEEN 1 AND 8),
  year int,
  session joining_session,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, name)
);

-- 8) Student course enrollments and grades
CREATE TABLE IF NOT EXISTS public.student_courses (
  id bigserial PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(profile_id) ON DELETE CASCADE,
  course_id bigint NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id bigint NOT NULL REFERENCES public.student_semesters(id) ON DELETE CASCADE,
  grade text, -- e.g. A, A-, B+, B, C, D, F
  credits smallint NOT NULL, -- redundant for reporting stability
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, course_id, semester_id)
);

-- 9) Requests (students, faculty, coordinator etc.)
CREATE TABLE IF NOT EXISTS public.requests (
  id bigserial PRIMARY KEY,
  requester_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  title text NOT NULL,
  details text,
  visibility jsonb, -- e.g. {"faculty": true, "department_chair": true}
  status request_status DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10) Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  target_audience user_role[] NOT NULL, -- array of roles
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 11) GPA/CGPA Views
-- Letter grade to grade points mapping via CASE
CREATE OR REPLACE VIEW public.v_student_semester_gpa AS
SELECT
  sc.student_id,
  ss.name AS semester_name,
  ROUND(
    CASE WHEN SUM(sc.credits) > 0 THEN
      SUM(
        CASE sc.grade
          WHEN 'A'  THEN 4.0 * sc.credits
          WHEN 'A-' THEN 3.7 * sc.credits
          WHEN 'B+' THEN 3.3 * sc.credits
          WHEN 'B'  THEN 3.0 * sc.credits
          WHEN 'B-' THEN 2.7 * sc.credits
          WHEN 'C+' THEN 2.3 * sc.credits
          WHEN 'C'  THEN 2.0 * sc.credits
          WHEN 'C-' THEN 1.7 * sc.credits
          WHEN 'D'  THEN 1.0 * sc.credits
          ELSE 0.0 * sc.credits
        END
      ) / SUM(sc.credits)
    ELSE NULL END
  , 2) AS gpa,
  SUM(sc.credits) AS total_credits
FROM public.student_courses sc
JOIN public.student_semesters ss ON ss.id = sc.semester_id
GROUP BY sc.student_id, ss.name;

CREATE OR REPLACE VIEW public.v_student_cgpa AS
SELECT
  student_id,
  ROUND(
    CASE WHEN SUM(credits) > 0 THEN SUM(grade_points) / SUM(credits) ELSE NULL END
  , 2) AS cgpa,
  SUM(credits) AS total_credits
FROM (
  SELECT
    sc.student_id,
    sc.credits AS credits,
    CASE sc.grade
      WHEN 'A'  THEN 4.0 * sc.credits
      WHEN 'A-' THEN 3.7 * sc.credits
      WHEN 'B+' THEN 3.3 * sc.credits
      WHEN 'B'  THEN 3.0 * sc.credits
      WHEN 'B-' THEN 2.7 * sc.credits
      WHEN 'C+' THEN 2.3 * sc.credits
      WHEN 'C'  THEN 2.0 * sc.credits
      WHEN 'C-' THEN 1.7 * sc.credits
      WHEN 'D'  THEN 1.0 * sc.credits
      ELSE 0.0 * sc.credits
    END AS grade_points
  FROM public.student_courses sc
) t
GROUP BY student_id;

-- 12) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON public.student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_semester ON public.student_courses(semester_id);

-- 13) Basic RLS (optional when using service role)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS profiles_self_read ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- NOTE: For backend using service role, RLS is bypassed. Keep policies minimal for client reads.
