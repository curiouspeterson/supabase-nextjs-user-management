import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TimeOffRequest } from '@/lib/types/time-off'
import { redirect } from 'next/navigation'
import TimeOffList from '@/components/TimeOffList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Suspense } from 'react'
import { TimeOffSkeleton } from '@/components/skeletons/TimeOffSkeleton'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Time Off Management | Schedule Master',
  description: 'Manage employee time off requests and approvals',
}

async function getTimeOffData() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) return redirect('/login')

    // Get time off requests with proper access control
    const { data: requests, error: requestError } = await supabase
      .rpc('get_time_off_requests')
      .returns<TimeOffRequest[]>()

    if (requestError) {
      console.error('Error fetching time off requests:', requestError)
      throw new Error('Failed to fetch time off requests')
    }

    return {
      requests: requests || [],
      user
    }
  } catch (error) {
    console.error('Error in getTimeOffData:', error)
    throw error
  }
}

export default async function TimeOffPage() {
  return (
    <ErrorBoundary fallback={<div>Error loading time off requests</div>}>
      <Suspense fallback={<TimeOffSkeleton />}>
        <TimeOffContent />
      </Suspense>
    </ErrorBoundary>
  )
}

async function TimeOffContent() {
  const { requests, user } = await getTimeOffData()

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Off Requests</h1>
      </div>
      
      <TimeOffList 
        requests={requests}
        currentUserId={user.id}
      />
    </div>
  )
} 