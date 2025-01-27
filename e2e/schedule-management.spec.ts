import { test, expect } from '@playwright/test'
import { format, addDays } from 'date-fns'

test.describe('Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Login as manager
    await page.fill('input[name="email"]', 'manager@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation to complete
    await expect(page).toHaveURL('/schedules')
  })

  test('should display schedule management interface', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toHaveText('Schedule Management')

    // Check presence of key UI elements
    await expect(page.getByText('Generate Schedule')).toBeVisible()
    await expect(page.getByText('Create Manual Schedule')).toBeVisible()
    await expect(page.getByText('View Statistics')).toBeVisible()
  })

  test('should generate a schedule', async ({ page }) => {
    // Click generate schedule button
    await page.click('text=Generate Schedule')

    // Wait for navigation to generate page
    await expect(page).toHaveURL('/schedules/generate')

    // Fill out generation form
    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(addDays(new Date(), 7), 'yyyy-MM-dd')

    await page.fill('input[name="startDate"]', startDate)
    await page.fill('input[name="endDate"]', endDate)
    await page.fill('input[name="minimumRestHours"]', '10')
    await page.fill('input[name="maximumConsecutiveDays"]', '6')

    // Submit form
    await page.click('button:has-text("Generate Schedule")')

    // Wait for generation to complete
    await expect(page.getByText('Generation Results')).toBeVisible()
    await expect(page.getByText('Total Shifts')).toBeVisible()
    await expect(page.getByText('Total Hours')).toBeVisible()

    // View generated schedule
    await page.click('text=View Schedule')
    await expect(page).toHaveURL('/schedules')
  })

  test('should create a manual schedule', async ({ page }) => {
    // Navigate to new schedule page
    await page.click('text=Create Manual Schedule')
    await expect(page).toHaveURL('/schedules/new')

    // Fill out schedule form
    await page.selectOption('select[name="employeeId"]', { index: 1 })
    await page.selectOption('select[name="shiftId"]', { index: 1 })
    await page.fill('input[name="date"]', format(new Date(), 'yyyy-MM-dd'))
    await page.selectOption('select[name="scheduleStatus"]', 'Draft')

    // Submit form
    await page.click('button:has-text("Create Schedule")')

    // Wait for navigation and check success
    await expect(page).toHaveURL('/schedules')
    await expect(page.getByText('Schedule created successfully')).toBeVisible()
  })

  test('should view schedule statistics', async ({ page }) => {
    // Navigate to statistics page
    await page.click('text=View Statistics')
    await expect(page).toHaveURL('/schedules/stats')

    // Check statistics components
    await expect(page.getByText('Schedule Statistics')).toBeVisible()
    await expect(page.getByText('Total Shifts')).toBeVisible()
    await expect(page.getByText('Total Hours')).toBeVisible()
    await expect(page.getByText('Employee Statistics')).toBeVisible()
    await expect(page.getByText('Pattern Distribution')).toBeVisible()
    await expect(page.getByText('Hours Analysis')).toBeVisible()

    // Test month navigation
    await page.click('text=Previous Month')
    await page.click('text=Next Month')

    // Return to schedule view
    await page.click('text=Back to Schedule')
    await expect(page).toHaveURL('/schedules')
  })

  test('should handle schedule updates', async ({ page }) => {
    // Create a test schedule
    await page.click('text=Create Manual Schedule')
    await page.selectOption('select[name="employeeId"]', { index: 1 })
    await page.selectOption('select[name="shiftId"]', { index: 1 })
    await page.fill('input[name="date"]', format(new Date(), 'yyyy-MM-dd'))
    await page.selectOption('select[name="scheduleStatus"]', 'Draft')
    await page.click('button:has-text("Create Schedule")')
    await expect(page).toHaveURL('/schedules')

    // Find and click the schedule to edit
    await page.click('.schedule-item >> text=Draft')

    // Update schedule status
    await page.selectOption('select[name="scheduleStatus"]', 'Published')
    await page.click('button:has-text("Update Schedule")')

    // Verify update
    await expect(page.getByText('Schedule updated successfully')).toBeVisible()
    await expect(page.getByText('Published')).toBeVisible()
  })

  test('should handle schedule deletion', async ({ page }) => {
    // Create a test schedule
    await page.click('text=Create Manual Schedule')
    await page.selectOption('select[name="employeeId"]', { index: 1 })
    await page.selectOption('select[name="shiftId"]', { index: 1 })
    await page.fill('input[name="date"]', format(new Date(), 'yyyy-MM-dd'))
    await page.selectOption('select[name="scheduleStatus"]', 'Draft')
    await page.click('button:has-text("Create Schedule")')
    await expect(page).toHaveURL('/schedules')

    // Find and delete the schedule
    await page.click('.schedule-item >> text=Draft')
    await page.click('button:has-text("Delete Schedule")')

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Verify deletion
    await expect(page.getByText('Schedule deleted successfully')).toBeVisible()
  })

  test('should enforce role-based access control', async ({ page }) => {
    // Logout
    await page.click('text=Logout')
    await expect(page).toHaveURL('/login')

    // Login as employee
    await page.fill('input[name="email"]', 'employee@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/schedules')

    // Verify restricted access
    await expect(page.getByText('Generate Schedule')).not.toBeVisible()
    await expect(page.getByText('Create Manual Schedule')).not.toBeVisible()
    await expect(page.getByText('View Statistics')).not.toBeVisible()

    // Try to access restricted pages directly
    await page.goto('/schedules/generate')
    await expect(page).toHaveURL('/schedules')

    await page.goto('/schedules/new')
    await expect(page).toHaveURL('/schedules')

    await page.goto('/schedules/stats')
    await expect(page).toHaveURL('/schedules')
  })
}) 