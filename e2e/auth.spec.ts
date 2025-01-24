import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('successful login', async ({ page }) => {
    // Fill login form
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify redirect to account page
    await expect(page).toHaveURL('/account')

    // Verify user is logged in
    await expect(page.getByText(/account settings/i)).toBeVisible()
    await expect(page.getByText(process.env.TEST_USER_EMAIL!)).toBeVisible()
  })

  test('failed login with invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
    await expect(page).toHaveURL('/error')
  })

  test('successful signup', async ({ page }) => {
    // Generate unique email
    const uniqueEmail = `test${Date.now()}@example.com`

    // Fill signup form
    await page.getByLabel(/email/i).fill(uniqueEmail)
    await page.getByLabel(/password/i).fill('Password123!')
    await page.getByRole('button', { name: /create account/i }).click()

    // Verify redirect to account page
    await expect(page).toHaveURL('/account')

    // Verify user is logged in
    await expect(page.getByText(/account settings/i)).toBeVisible()
    await expect(page.getByText(uniqueEmail)).toBeVisible()
  })

  test('failed signup with existing email', async ({ page }) => {
    // Fill signup form with existing email
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel(/password/i).fill('Password123!')
    await page.getByRole('button', { name: /create account/i }).click()

    // Verify error message
    await expect(page.getByText(/email already exists/i)).toBeVisible()
    await expect(page).toHaveURL('/error')
  })

  test('profile management', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for account page
    await expect(page).toHaveURL('/account')

    // Update profile
    await page.getByLabel(/full name/i).fill('Updated Name')
    await page.getByLabel(/username/i).fill('updateduser')
    await page.getByLabel(/website/i).fill('https://example.com')

    // Verify success message
    await expect(page.getByText(/profile updated/i)).toBeVisible()

    // Refresh page and verify changes persist
    await page.reload()
    await expect(page.getByLabel(/full name/i)).toHaveValue('Updated Name')
    await expect(page.getByLabel(/username/i)).toHaveValue('updateduser')
    await expect(page.getByLabel(/website/i)).toHaveValue('https://example.com')
  })

  test('sign out', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for account page
    await expect(page).toHaveURL('/account')

    // Click sign out
    await page.getByRole('button', { name: /sign out/i }).click()

    // Verify redirect to login page
    await expect(page).toHaveURL('/login')

    // Verify protected route access is blocked
    await page.goto('/account')
    await expect(page).toHaveURL('/login')
  })

  test('maintains accessibility standards', async ({ page }) => {
    // Test login page accessibility
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByRole('form')).toBeVisible()

    // Test form labels
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()

    // Test button roles
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()

    // Test focus management
    await expect(page.getByLabel(/email/i)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByLabel(/password/i)).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused()
  })

  test('handles network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.route('**/auth/v1/**', route => route.abort())

    // Try to login
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!)
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Verify error message
    await expect(page.getByText(/network error/i)).toBeVisible()
    await expect(page).toHaveURL('/error')
  })
}) 