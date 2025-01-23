const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bedzcvnvktvhggfazsmj.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZHpjdm52a3R2aGdnZmF6c21qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU2MzM5MSwiZXhwIjoyMDUzMTM5MzkxfQ.xWpqijBfSp9JRbmsJXE_tAGtRCIWJsyHBeTNq8MxTMc'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// First names pool
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon'
]

// Last names pool
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
]

// Employee roles with weighted distribution
const employeeRoles = [
  ...Array(30).fill('Dispatcher'),           // 60% Dispatchers
  ...Array(15).fill('Shift Supervisor'),     // 30% Shift Supervisors
  ...Array(5).fill('Management')             // 10% Management
]

// User roles with weighted distribution
const userRoles = [
  ...Array(40).fill('Employee'),             // 80% Regular employees
  ...Array(8).fill('Manager'),               // 16% Managers
  ...Array(2).fill('Admin')                  // 4% Admins
]

// Function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate unique combinations of first and last names
function generateUniqueNames(count: number): Array<{firstName: string; lastName: string; fullName: string}> {
  const names = [];
  const usedCombinations = new Set<string>();
  
  // Shuffle the name arrays
  const shuffledFirstNames = shuffleArray([...firstNames]);
  const shuffledLastNames = shuffleArray([...lastNames]);
  
  for (let i = 0; i < count; i++) {
    let firstName, lastName, fullName;
    do {
      firstName = shuffledFirstNames[i % shuffledFirstNames.length];
      lastName = shuffledLastNames[i % shuffledLastNames.length];
      fullName = `${firstName} ${lastName}`;
    } while (usedCombinations.has(fullName));
    
    usedCombinations.add(fullName);
    names.push({ firstName, lastName, fullName });
  }
  
  return names;
}

async function createUsers() {
  // Generate 50 unique names
  const uniqueNames = generateUniqueNames(50);
  
  // Shuffle roles
  const shuffledEmployeeRoles = shuffleArray([...employeeRoles]);
  const shuffledUserRoles = shuffleArray([...userRoles]);
  
  // Get default shift type ID
  const { data: shiftTypes, error: shiftTypeError } = await supabase
    .from('shift_types')
    .select('id')
    .eq('name', 'Day Shift')
    .limit(1);
    
  if (shiftTypeError) {
    console.error('Error fetching default shift type:', shiftTypeError);
    return;
  }
  
  const defaultShiftTypeId = shiftTypes[0]?.id;
  
  for (let i = 0; i < 50; i++) {
    const { firstName, lastName, fullName } = uniqueNames[i];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dispatch911.test`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          username: username,
          employee_role: shuffledEmployeeRoles[i],
          user_role: shuffledUserRoles[i],
          weekly_hours_scheduled: 40,
          default_shift_type_id: defaultShiftTypeId
        }
      });
      
      if (error) {
        console.error(`Failed to create user ${email}:`, error);
      } else if (data.user) {
        console.log(`Created user ${email} with ID ${data.user.id}`);
        console.log(`Role: ${shuffledEmployeeRoles[i]} (${shuffledUserRoles[i]})`);
      }
    } catch (error) {
      console.error(`Failed to create user ${email}:`, error);
    }
  }
}

createUsers()
