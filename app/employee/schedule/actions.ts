'use server'

import { revalidatePath } from 'next/cache'

export async function resetScheduleError() {
  revalidatePath('/employee/schedule')
} 