'use server'

import { revalidatePath } from 'next/cache'

export async function resetTimeOffError() {
  revalidatePath('/dashboard/time-off')
} 