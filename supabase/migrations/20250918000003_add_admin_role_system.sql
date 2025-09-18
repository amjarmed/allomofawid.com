-- Create role type enum
CREATE TYPE user_role AS ENUM ('user', 'huissier', 'admin');

-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN role user_role NOT NULL DEFAULT 'user';

-- Create policy to prevent regular users from updating roles
CREATE POLICY "Only admins can update roles" ON profiles
FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Create function to verify admin role
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to ensure only admins can view admin-only data
CREATE POLICY "Enable read access for admins" ON documents
FOR SELECT USING (
  is_admin(auth.uid())
);

-- Add RLS to profiles for role protection
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT USING (
  auth.uid() = id
);

-- Create policy to allow admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
FOR SELECT USING (
  is_admin(auth.uid())
);
