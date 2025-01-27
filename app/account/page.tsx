import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AccountForm } from '@/components/account-form'

export default async function Account() {
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

  return <AccountForm />
}
