import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bedzcvnvktvhggfazsmj.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// First names pool
const firstNames = [
  'John', 'Jane', 'Michael', 'Emily', 'David',
  'Sarah', 'James', 'Emma', 'William', 'Olivia'
]

// Last names pool
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
]

// Roles pool (weighted towards Employee)
const roles = [
  'Employee', 'Employee', 'Employee', 'Employee',
  'Manager', 'Manager',
  'Admin'
]

async function createRandomUser() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const role = roles[Math.floor(Math.random() * roles.length)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`

  try {
    const { data: user, error: signupError } = await supabase.auth.signUp({
      email,
      password: 'password123',
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    })

    if (signupError) throw signupError

    console.log(`Created user: ${email} (${role})`)
    return user
  } catch (error) {
    console.error(`Failed to create user ${email}:`, error)
    return null
  }
}

async function seedUsers(count = 10) {
  console.log(`Creating ${count} random users...`)
  
  const promises = Array(count).fill(null).map(() => createRandomUser())
  const results = await Promise.all(promises)
  
  const successCount = results.filter(Boolean).length
  console.log(`Successfully created ${successCount} users`)
}

// Run the seeding
seedUsers() 