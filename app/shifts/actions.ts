'use server'

import { revalidatePath } from 'next/cache'

/**
 * Server action to reset the shifts error state and refresh the page data
 */
export async function resetShiftsError() {
  // Revalidate the shifts page to refresh the data
  revalidatePath('/shifts')
} 