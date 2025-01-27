'use server'

import { revalidatePath } from 'next/cache'

/**
 * Server action to reset the patterns error state and refresh the page data
 */
export async function resetPatternsError() {
  // Revalidate the patterns page to refresh the data
  revalidatePath('/dashboard/patterns')
} 