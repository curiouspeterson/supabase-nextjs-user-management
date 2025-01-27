-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role for authorization (e.g., user, admin)';
