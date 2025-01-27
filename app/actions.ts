'use server'

import { revalidatePath } from 'next/cache'

/**
 * Server action to reset the global error state and refresh the current page
 */
export async function resetGlobalError() {
  // Revalidate the current path to refresh the data
  revalidatePath('/')
} 