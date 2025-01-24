import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface Profile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  website: string | null;
}

interface Employee {
  id: string;
  employee_role: 'Dispatcher' | 'Shift Supervisor' | 'Management';
  user_role: 'Employee' | 'Manager' | 'Admin';
  weekly_hours_scheduled: number;
  default_shift_type_id: string;
}

async function verifyUsers() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    if (error) throw error

    console.log(`Found ${users.users.length} users:`)
    users.users.forEach(user => {
      console.log(`- ${user.email} (${user.user_metadata?.role || 'No role'})`)
    })
  } catch (error) {
    console.error('Error verifying users:', error)
  }
}

verifyUsers() 