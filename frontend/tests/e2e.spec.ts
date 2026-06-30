import { test, expect } from '@playwright/test'

test.describe('Community Hero AI E2E', () => {
  const timestamp = Date.now()
  const testEmail = `citizen_${timestamp}@example.com`
  const testPassword = 'StrongP@ssw0rd123'

  test('User Registration and Login Flow', async ({ page }) => {
    // 1. Landing Page
    await page.goto('http://localhost:5173')

    // 2. Navigation to Signup
    await page.click('text=Get Started')
    await expect(page).toHaveURL(/.*signup/)

    // 3. Signup Form
    await page.fill('input[name="full_name"]', 'Test Citizen')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirm_password"]', testPassword)
    await page.check('input[name="agree_terms"]')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard on successful signup (or login page depending on flow)
    await page.waitForURL(/.*dashboard|login/)
    if (page.url().includes('login')) {
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      await page.waitForURL(/.*dashboard/)
    }

    // 4. Verify Dashboard
    // Just looking for text that might appear
    await expect(page.locator('body')).toContainText(/Dashboard|Report/)

    // 5. Logout
    if (await page.locator('text=Logout').isVisible()) {
      await page.click('text=Logout')
    }
  })
})
