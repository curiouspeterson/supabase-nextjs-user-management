-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create user_organizations table
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, org_id)
);

-- Add email field to profiles if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to"
ON organizations FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- User organizations policies
CREATE POLICY "Users can view their organization memberships"
ON user_organizations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Profiles policies
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow managers to read profiles in their organization
CREATE POLICY "Managers can read org profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.role IN ('manager', 'admin')
    AND EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.user_id = profiles.id
      AND uo2.org_id = uo.org_id
    )
  )
  OR auth.uid() = id  -- Always allow users to read their own profile
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role to create profiles
CREATE POLICY "Service role can create profiles"
ON profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to manage all profiles
CREATE POLICY "Service role can manage profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create default organization for testing
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Organization', 'default-org')
ON CONFLICT DO NOTHING;

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'Employee');
  
  -- Add user to default organization
  INSERT INTO user_organizations (user_id, org_id, role)
  VALUES (NEW.id, '00000000-0000-0000-0000-000000000000', 'member');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 