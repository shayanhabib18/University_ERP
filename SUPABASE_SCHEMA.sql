-- 1) Enable UUID generation (once)
create extension if not exists pgcrypto;

-- 2) DROP existing app tables (irreversible)
drop table if exists courses cascade;
drop table if exists semesters cascade;
drop table if exists departments cascade;

-- 3) RECREATE schema (UUIDs + constraints)

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  status text default 'ACTIVE',
  created_at timestamptz default now()
);

create table semesters (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete cascade,
  number int not null check (number between 1 and 12),
  created_at timestamptz default now(),
  unique (department_id, number)  -- prevents duplicate semester numbers per dept
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references semesters(id) on delete cascade,
  name text not null,
  code text not null unique,
  credit_hours int not null check (credit_hours between 1 and 6),
  pre_req text,
  created_at timestamptz default now()
);

-- 4) Helpful indexes (optional)
create index if not exists idx_semesters_department on semesters(department_id);
create index if not exists idx_courses_semester on courses(semester_id);

create table faculties (
  id uuid primary key default gen_random_uuid(),

  -- Personal Info
  name text not null,
  designation text not null,
  qualification text not null,
  specialization text,

  -- Contact Info
  email text not null unique,
  phone text not null,
  cnic text not null unique,
  address text,

  -- Professional Info
  experience integer check (experience >= 0),
  joining_date date,

  -- Relations
  department_id uuid not null references departments(id) on delete cascade,

  -- ERP / Status
  status text default 'ACTIVE',
  role text default 'FACULTY',
  must_change_password boolean default true,

  -- Audit
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table faculty_documents (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid references faculties(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  uploaded_at timestamptz default now()
);


CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(50),
  cnic VARCHAR(50) UNIQUE NOT NULL,
  
  -- Academic Information
  roll_number VARCHAR(100) NOT NULL UNIQUE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  joining_session VARCHAR(50),
  joining_date DATE,
  
  -- Contact Information
  university_email VARCHAR(255) NOT NULL UNIQUE,
  personal_email VARCHAR(255),
  student_phone VARCHAR(20),
  parent_phone VARCHAR(20),
  
  -- Address Information
  permanent_address TEXT,
  current_address TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, graduated, suspended
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACADEMIC RECORDS TABLE (Attendance, grades, performance)
CREATE TABLE academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  academic_year VARCHAR(10),
  
  -- Performance Metrics
  attendance DECIMAL(5, 2), -- Percentage (0-100)
  gpa DECIMAL(3, 2),
  overall_grade VARCHAR(2), -- A, B, C, D, F
  total_credit_hours INTEGER,
  earned_credit_hours INTEGER,
  
  -- Additional Info
  remarks TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(student_id, semester, academic_year)
);

CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  
  document_type VARCHAR(100), -- transcript, certificate, cnic, photo, etc.
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- Supabase storage URL
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),
  
  uploaded_by UUID, -- User ID who uploaded
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
