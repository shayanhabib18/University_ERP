-- Migration: Add missing columns to existing coordinators table
-- Run this if you get "column not found" errors

-- Add phone column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='coordinator_phone') THEN
    ALTER TABLE coordinators ADD COLUMN coordinator_phone VARCHAR(50);
  END IF;
END $$;

-- Add cnic column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='coordinator_cnic') THEN
    ALTER TABLE coordinators ADD COLUMN coordinator_cnic VARCHAR(50);
  END IF;
END $$;

-- Add address column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='coordinator_address') THEN
    ALTER TABLE coordinators ADD COLUMN coordinator_address TEXT;
  END IF;
END $$;

-- Add designation column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='designation') THEN
    ALTER TABLE coordinators ADD COLUMN designation VARCHAR(255);
  END IF;
END $$;

-- Add qualifications column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='coordinators' AND column_name='qualifications') THEN
    ALTER TABLE coordinators ADD COLUMN qualifications TEXT;
  END IF;
END $$;

-- Add unique constraint on department_id if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'coordinators_department_id_key' 
    AND conrelid = 'coordinators'::regclass
  ) THEN
    ALTER TABLE coordinators ADD CONSTRAINT coordinators_department_id_key UNIQUE (department_id);
  END IF;
END $$;

-- Remove NOT NULL constraint from auth_user_id if it exists
DO $$ 
BEGIN
  ALTER TABLE coordinators ALTER COLUMN auth_user_id DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
