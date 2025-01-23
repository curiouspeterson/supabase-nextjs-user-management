const { Client } = require('pg')

type EmployeeRole = 'Dispatcher' | 'Shift Supervisor' | 'Management'
type UserRole = 'Employee' | 'Manager' | 'Admin'

interface Employee {
  id: string
  employee_role: EmployeeRole
  user_role: UserRole
  weekly_hours_scheduled: number
  default_shift_type_id: string
}

interface ShiftType {
  id: string
  name: string
  description: string | null
}

interface Distribution {
  name: string
  count: string
}

const updateEmployeeShifts = async () => {
  const client = new Client({
    connectionString: 'postgres://postgres:postgres@localhost:54322/postgres'
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Get all shift types
    const shiftTypesResult = await client.query('SELECT * FROM shift_types ORDER BY name')
    const shiftTypes = shiftTypesResult.rows
    console.log('Found shift types:', shiftTypes)

    // Get all employees
    const employeesResult = await client.query('SELECT * FROM employees')
    const employees = employeesResult.rows
    console.log('Found employees:', employees.length)

    if (!employees || !shiftTypes || shiftTypes.length === 0) {
      console.error('No employees or shift types found')
      return
    }

    // Distribute employees across shift types
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i]
      const shiftType = shiftTypes[i % shiftTypes.length]
      
      await client.query(
        'UPDATE employees SET default_shift_type_id = $1 WHERE id = $2',
        [shiftType.id, employee.id]
      )
      console.log(`Updated employee ${employee.id} to shift type ${shiftType.name}`)
    }

    // Verify the distribution
    const distributionResult = await client.query(`
      SELECT st.name, COUNT(*) 
      FROM employees e 
      JOIN shift_types st ON e.default_shift_type_id = st.id 
      GROUP BY st.name 
      ORDER BY st.name
    `)
    const distribution = distributionResult.rows

    console.log('\nFinal distribution:')
    distribution.forEach((st: Distribution) => {
      console.log(`${st.name}: ${st.count} employees`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

module.exports = updateEmployeeShifts

if (require.main === module) {
  updateEmployeeShifts().catch(console.error)
} 