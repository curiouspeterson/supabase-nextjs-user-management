import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  // Check role access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['Manager', 'Admin'].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
          <p>Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  return <DashboardContent />
} 