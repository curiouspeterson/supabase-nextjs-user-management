import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-3">
        <div className="animate-in flex flex-col gap-14 opacity-0 max-w-4xl px-3">
          <h1 className="text-3xl font-bold">911 Dispatch Scheduling</h1>
          <p className="text-muted-foreground">
            A comprehensive scheduling solution for 911 dispatch centers, helping manage shifts, time
            off requests, and staffing requirements efficiently.
          </p>
          <div className="w-full flex flex-col md:flex-row gap-8">
            <a
              href="/schedule"
              className="flex-1 text-foreground bg-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg text-center"
            >
              View Schedule
              <div className="text-xs text-muted-foreground mt-1">
                Check your upcoming shifts and schedule
              </div>
            </a>
            <a
              href="/schedule/requests"
              className="flex-1 text-foreground bg-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg text-center"
            >
              Time Off Requests
              <div className="text-xs text-muted-foreground mt-1">
                Submit and manage your time off requests
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
