import { createClient } from '@/lib/supabase/client'
import { EmployeeRole, EmployeeStatus } from '@/types/employee'
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '@/types/employee'
import type { Database } from '@/types/supabase'

const supabase = createClient()

type DbEmployeeWithProfile = Database['public']['Tables']['employees']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

/**
 * Map database role to application role
 */
function mapDbRoleToAppRole(dbRole: Database['public']['Enums']['employee_role_enum']): EmployeeRole {
  const roleMap: Record<Database['public']['Enums']['employee_role_enum'], EmployeeRole> = {
    'Dispatcher': EmployeeRole.EMPLOYEE,
    'Shift Supervisor': EmployeeRole.SUPERVISOR,
    'Management': EmployeeRole.MANAGER
  }
  return roleMap[dbRole]
}

/**
 * Map application role to database role
 */
function mapAppRoleToDbRole(appRole: EmployeeRole): Database['public']['Enums']['employee_role_enum'] {
  const roleMap: Record<EmployeeRole, Database['public']['Enums']['employee_role_enum']> = {
    [EmployeeRole.EMPLOYEE]: 'Dispatcher',
    [EmployeeRole.SUPERVISOR]: 'Shift Supervisor',
    [EmployeeRole.MANAGER]: 'Management',
    [EmployeeRole.ADMIN]: 'Management' // Map admin to management in DB
  }
  return roleMap[appRole]
}

/**
 * Transform a database employee to the application type
 */
function transformEmployee(dbEmployee: DbEmployeeWithProfile): Employee {
  const names = dbEmployee.profiles.full_name?.split(' ') || ['', '']
  return {
    id: dbEmployee.id,
    firstName: names[0],
    lastName: names.slice(1).join(' '),
    fullName: dbEmployee.profiles.full_name || '',
    email: dbEmployee.profiles.username || '',
    role: mapDbRoleToAppRole(dbEmployee.employee_role),
    status: EmployeeStatus.ACTIVE, // Default status since it's not in the DB yet
    avatarUrl: dbEmployee.profiles.avatar_url || null,
    createdAt: dbEmployee.created_at,
    updatedAt: dbEmployee.updated_at
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: 'temporary-password', // TODO: Generate secure temporary password
    email_confirm: true
  })

  if (userError) {
    throw new Error(`Failed to create user: ${userError.message}`)
  }

  const userId = userData.user.id

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: `${input.firstName} ${input.lastName}`,
      username: input.email,
    })

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`)
  }

  // Create employee
  const { data: employeeData, error: employeeError } = await supabase
    .from('employees')
    .insert({
      id: userId,
      employee_role: mapAppRoleToDbRole(input.role),
      user_role: 'Employee'
    })
    .select('*, profiles(*)')
    .single()

  if (employeeError) {
    throw new Error(`Failed to create employee: ${employeeError.message}`)
  }

  return transformEmployee(employeeData as DbEmployeeWithProfile)
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<Employee> {
  // Update profile if name or email changed
  if (input.firstName || input.lastName || input.email) {
    const profileUpdates: Record<string, any> = {}
    
    if (input.firstName || input.lastName) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', id)
        .single()
      
      const names = currentProfile?.full_name?.split(' ') || ['', '']
      profileUpdates.full_name = `${input.firstName || names[0]} ${input.lastName || names.slice(1).join(' ')}`
    }
    
    if (input.email) {
      profileUpdates.username = input.email
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', id)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }
  }

  // Update employee if role changed
  if (input.role) {
    const { error: employeeError } = await supabase
      .from('employees')
      .update({ employee_role: mapAppRoleToDbRole(input.role) })
      .eq('id', id)

    if (employeeError) {
      throw new Error(`Failed to update employee: ${employeeError.message}`)
    }
  }

  // Fetch updated employee with profile
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch updated employee: ${error.message}`)
  }

  return transformEmployee(data as DbEmployeeWithProfile)
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  // Delete employee (profile will be deleted via cascade)
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete employee: ${error.message}`)
  }
}

/**
 * Fetch all employees
 */
export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .order('profiles(full_name)')

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }

  return (data || []).map(employee => transformEmployee(employee as DbEmployeeWithProfile))
}

/**
 * Fetch a single employee by ID
 */
export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Row not found
    throw new Error(`Failed to fetch employee: ${error.message}`)
  }

  return data ? transformEmployee(data as DbEmployeeWithProfile) : null
}