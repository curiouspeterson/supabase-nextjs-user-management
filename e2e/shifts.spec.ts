import { test, expect } from '@playwright/test'

test.describe('Shifts Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the shifts page
    await page.goto('/shifts')
  })

  test('displays shift templates and allows creation of new shifts', async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Shift Templates' })).toBeVisible()
    await expect(page.getByText('Manage your shift templates and schedules')).toBeVisible()

    // Click new shift template button
    await page.getByRole('button', { name: /new shift template/i }).click()

    // Fill out the form
    await page.getByLabel('Name').fill('Night Shift')
    await page.getByLabel('Description').fill('Late night shift')
    await page.getByLabel('Start Time').fill('22:00')
    await page.getByLabel('End Time').fill('06:00')
    await page.getByLabel('Duration Category').selectOption('8 hours')

    // Submit the form
    await page.getByRole('button', { name: /create/i }).click()

    // Verify the new shift appears in the list
    await expect(page.getByText('Night Shift')).toBeVisible()
    await expect(page.getByText('Late night shift')).toBeVisible()
    await expect(page.getByText('10:00 PM - 6:00 AM')).toBeVisible()
  })

  test('allows editing existing shift templates', async ({ page }) => {
    // Wait for the first shift to be visible
    await page.getByText('Early Shift').waitFor()

    // Click edit button on the first shift
    await page.getByRole('button', { name: /edit/i }).first().click()

    // Modify the shift details
    await page.getByLabel('Name').fill('Updated Early Shift')
    await page.getByLabel('Description').fill('Updated description')
    await page.getByLabel('Start Time').fill('06:00')
    await page.getByLabel('End Time').fill('10:00')

    // Save changes
    await page.getByRole('button', { name: /save/i }).click()

    // Verify the updated shift appears in the list
    await expect(page.getByText('Updated Early Shift')).toBeVisible()
    await expect(page.getByText('Updated description')).toBeVisible()
    await expect(page.getByText('6:00 AM - 10:00 AM')).toBeVisible()
  })

  test('allows deleting shift templates', async ({ page }) => {
    // Wait for the first shift to be visible
    await page.getByText('Early Shift').waitFor()

    // Store the number of shifts before deletion
    const initialShiftCount = await page.getByRole('article').count()

    // Click delete button on the first shift
    await page.getByRole('button', { name: /delete/i }).first().click()

    // Confirm deletion in the dialog
    await page.getByRole('button', { name: /confirm/i }).click()

    // Verify the shift was deleted
    const finalShiftCount = await page.getByRole('article').count()
    expect(finalShiftCount).toBe(initialShiftCount - 1)
  })

  test('displays error message when API fails', async ({ page }) => {
    // Intercept API calls and force an error
    await page.route('**/api/shifts**', (route) => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error',
      })
    })

    // Reload the page to trigger the API error
    await page.reload()

    // Verify error message is displayed
    await expect(page.getByText(/error/i)).toBeVisible()
  })

  test('validates form inputs when creating new shifts', async ({ page }) => {
    // Click new shift template button
    await page.getByRole('button', { name: /new shift template/i }).click()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create/i }).click()

    // Verify validation messages
    await expect(page.getByText(/name is required/i)).toBeVisible()
    await expect(page.getByText(/start time is required/i)).toBeVisible()
    await expect(page.getByText(/end time is required/i)).toBeVisible()
  })

  test('handles time validation in shift form', async ({ page }) => {
    // Click new shift template button
    await page.getByRole('button', { name: /new shift template/i }).click()

    // Fill invalid time values
    await page.getByLabel('Start Time').fill('25:00') // Invalid hour
    await page.getByLabel('End Time').fill('10:75') // Invalid minutes

    // Try to submit
    await page.getByRole('button', { name: /create/i }).click()

    // Verify validation messages
    await expect(page.getByText(/invalid time format/i)).toBeVisible()
  })
}) 