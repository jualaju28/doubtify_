-- Migration: Add role-based signup fields
-- Run against your Supabase/PostgreSQL database

-- Step 1: Add new enum values to user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teaching_assistant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'faculty';

-- Step 2: Add new nullable columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subject_expertise VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects_handled TEXT[];

-- Step 3: Create index on department for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
