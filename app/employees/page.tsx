import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Employees | 911 Dispatch Management',
  description: 'Manage dispatch center employees, roles, and certifications',
}

interface Employee {
  id: string
  name: string
  role: string
  status: string
  shift: string
  certifications: string[]
  hireDate: string
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Dispatcher',
    status: 'Active',
    shift: 'Day Shift Early',
    certifications: ['EMD', 'Fire', 'Police'],
    hireDate: '2020-03-15',
  },
  {
    id: '2',
    name: 'James Wilson',
    role: 'Dispatcher',
    status: 'Active',
    shift: 'Day Shift Early',
    certifications: ['EMD', 'Police'],
    hireDate: '2021-06-22',
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'Supervisor',
    status: 'Active',
    shift: 'Day Shift Early',
    certifications: ['EMD', 'Fire', 'Police', 'CTO'],
    hireDate: '2018-11-30',
  },
  {
    id: '4',
    name: 'Thomas Brown',
    role: 'Dispatcher',
    status: 'Training',
    shift: 'Day Shift',
    certifications: ['EMD'],
    hireDate: '2023-12-01',
  },
  {
    id: '5',
    name: 'Maria Garcia',
    role: 'Senior Dispatcher',
    status: 'Active',
    shift: 'Day Shift',
    certifications: ['EMD', 'Fire', 'Police'],
    hireDate: '2019-08-15',
  },
]

export default function EmployeesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage dispatch center employees, roles, and certifications
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Import</Button>
          <Button>Add Employee</Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Shift</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Certifications</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Hire Date</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-muted/50">
                  <td className="p-3">
                    <div className="font-medium">{employee.name}</div>
                  </td>
                  <td className="p-3 text-sm">{employee.role}</td>
                  <td className="p-3">
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'Training' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employee.status}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{employee.shift}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {employee.certifications.map((cert) => (
                        <div
                          key={cert}
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-800"
                        >
                          {cert}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 