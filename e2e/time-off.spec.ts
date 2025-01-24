import { test, expect } from '@playwright/test'
import { authFile } from './setup/auth.setup'

test.describe('Time Off Management', () => {
  test.use({ storageState: authFile })

  test.beforeEach(async ({ page }) => {
    await page.goto('/time-off')
  })

  test('employee can submit a time off request', async ({ page }) => {
    // Click the request time off button
    await page.getByRole('button', { name: /request time off/i }).click()

    // Fill out the form
    await page.getByLabel(/start date/i).fill('2024-03-15')
    await page.getByLabel(/end date/i).fill('2024-03-20')
    await page.getByLabel(/type/i).click()
    await page.getByRole('option', { name: /vacation/i }).click()
    await page.getByLabel(/notes/i).fill('Spring break vacation')

    // Submit the form
    await page.getByRole('button', { name: /submit/i }).click()

    // Verify success message
    await expect(page.getByText(/request has been submitted/i)).toBeVisible()

    // Verify request appears in the list
    await expect(page.getByText('Spring break vacation')).toBeVisible()
    await expect(page.getByText('Mar 15, 2024 - Mar 20, 2024')).toBeVisible()
    await expect(page.getByText('Pending')).toBeVisible()
  })

  test('manager can approve a time off request', async ({ page }) => {
    // Switch to manager view
    await page.goto('/dashboard/time-off')

    // Find a pending request
    const pendingRequest = page.getByRole('article').filter({ hasText: 'Pending' }).first()
    await expect(pendingRequest).toBeVisible()

    // Click approve button
    await pendingRequest.getByRole('button', { name: /approve/i }).click()

    // Add notes
    await page.getByLabel(/notes/i).fill('Approved as requested')
    await page.getByRole('button', { name: /confirm/i }).click()

    // Verify status change
    await expect(pendingRequest.getByText('Approved')).toBeVisible()
    await expect(pendingRequest.getByText('Approved as requested')).toBeVisible()
  })

  test('manager can deny a time off request', async ({ page }) => {
    // Switch to manager view
    await page.goto('/dashboard/time-off')

    // Find a pending request
    const pendingRequest = page.getByRole('article').filter({ hasText: 'Pending' }).first()
    await expect(pendingRequest).toBeVisible()

    // Click deny button
    await pendingRequest.getByRole('button', { name: /deny/i }).click()

    // Add notes
    await page.getByLabel(/notes/i).fill('Insufficient staffing for this period')
    await page.getByRole('button', { name: /confirm/i }).click()

    // Verify status change
    await expect(pendingRequest.getByText('Denied')).toBeVisible()
    await expect(pendingRequest.getByText('Insufficient staffing for this period')).toBeVisible()
  })

  test('employee can view their time off history', async ({ page }) => {
    // Verify tabs are present
    await expect(page.getByRole('tab', { name: /pending/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /approved/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /denied/i })).toBeVisible()

    // Switch to approved tab
    await page.getByRole('tab', { name: /approved/i }).click()
    await expect(page.getByText(/approved/i)).toBeVisible()

    // Switch to denied tab
    await page.getByRole('tab', { name: /denied/i }).click()
    await expect(page.getByText(/denied/i)).toBeVisible()
  })

  test('validates time off request form', async ({ page }) => {
    // Click the request time off button
    await page.getByRole('button', { name: /request time off/i }).click()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /submit/i }).click()

    // Verify validation messages
    await expect(page.getByText(/start date is required/i)).toBeVisible()
    await expect(page.getByText(/end date is required/i)).toBeVisible()
    await expect(page.getByText(/type is required/i)).toBeVisible()

    // Fill invalid dates
    await page.getByLabel(/start date/i).fill('2024-03-20')
    await page.getByLabel(/end date/i).fill('2024-03-15')

    // Verify date validation
    await expect(page.getByText(/end date must be after start date/i)).toBeVisible()
  })

  test('handles unauthorized access to manager functions', async ({ page }) => {
    // Try to access manager page directly
    await page.goto('/dashboard/time-off')

    // Should be redirected or shown access denied
    await expect(page.getByText(/you do not have permission/i)).toBeVisible()
  })

  test('maintains accessibility standards', async ({ page }) => {
    // Test main page landmarks
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()

    // Test dialog accessibility
    await page.getByRole('button', { name: /request time off/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // Test form labels
    const form = dialog.getByRole('form')
    await expect(form.getByLabel(/start date/i)).toBeVisible()
    await expect(form.getByLabel(/end date/i)).toBeVisible()
    await expect(form.getByLabel(/type/i)).toBeVisible()
    await expect(form.getByLabel(/notes/i)).toBeVisible()

    // Test focus management
    await expect(dialog).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(form.getByLabel(/start date/i)).toBeFocused()
  })

  test('handles network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/api/time-off/**', route => route.abort())

    // Try to submit a request
    await page.getByRole('button', { name: /request time off/i }).click()
    await page.getByLabel(/start date/i).fill('2024-03-15')
    await page.getByLabel(/end date/i).fill('2024-03-20')
    await page.getByLabel(/type/i).click()
    await page.getByRole('option', { name: /vacation/i }).click()
    await page.getByRole('button', { name: /submit/i }).click()

    // Verify error message
    await expect(page.getByText(/failed to submit request/i)).toBeVisible()
    await expect(page.getByText(/please try again/i)).toBeVisible()
  })
}) 