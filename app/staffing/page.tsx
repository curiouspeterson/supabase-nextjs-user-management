import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StaffingRequirementsTable } from './staffing-requirements-table'

export const dynamic = 'force-dynamic'

export default async function StaffingRequirementsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  // Get the current user's role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: employee } = await supabase
    .from('employees')
    .select('user_role')
    .eq('id', user?.id)
    .single()

  const isManager = employee?.user_role === 'Manager' || employee?.user_role === 'Admin'

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Staffing Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffingRequirementsTable isManager={isManager} />
        </CardContent>
      </Card>
    </div>
  )
} 