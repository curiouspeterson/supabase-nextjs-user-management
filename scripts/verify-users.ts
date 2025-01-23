const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bedzcvnvktvhggfazsmj.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZHpjdm52a3R2aGdnZmF6c21qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU2MzM5MSwiZXhwIjoyMDUzMTM5MzkxfQ.xWpqijBfSp9JRbmsJXE_tAGtRCIWJsyHBeTNq8MxTMc'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

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
  // Check profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    console.log(`Found ${profiles.length} profiles`);
    console.log('Sample profile:', profiles[0]);
  }

  // Check employees
  const { data: employees, error: employeeError } = await supabase
    .from('employees')
    .select('*');
  
  if (employeeError) {
    console.error('Error fetching employees:', employeeError);
  } else {
    console.log(`\nFound ${employees.length} employees`);
    console.log('Sample employee:', employees[0]);
    
    // Count by role
    const employeeRoleCounts = (employees as Employee[]).reduce((acc: Record<string, number>, emp: Employee) => {
      acc[emp.employee_role] = (acc[emp.employee_role] || 0) + 1;
      return acc;
    }, {});
    
    const userRoleCounts = (employees as Employee[]).reduce((acc: Record<string, number>, emp: Employee) => {
      acc[emp.user_role] = (acc[emp.user_role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nEmployee role distribution:', employeeRoleCounts);
    console.log('User role distribution:', userRoleCounts);
  }
}

verifyUsers() 