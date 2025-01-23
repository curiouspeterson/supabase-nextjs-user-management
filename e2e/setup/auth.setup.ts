import { test as setup, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Create a Supabase client for authentication
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Sign in with email and password
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  })

  if (error) throw error

  // Navigate to the app and set the auth cookie
  await page.goto('/')
  
  // Set authentication state
  await page.evaluate(({ session }) => {
    window.localStorage.setItem('supabase.auth.token', JSON.stringify(session))
  }, { session: data.session })

  // Save signed-in state to 'storageState'
  await page.context().storageState({ path: authFile })
})

// Export the authentication state for use in tests
export { authFile } 