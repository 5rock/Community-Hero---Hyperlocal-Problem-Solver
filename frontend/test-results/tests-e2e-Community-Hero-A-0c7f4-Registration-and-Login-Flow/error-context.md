# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e.spec.ts >> Community Hero AI E2E >> User Registration and Login Flow
- Location: tests\e2e.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - img [ref=e9]
        - generic [ref=e12]: Community Hero AI
      - heading "Start Improving Your City Today" [level=1] [ref=e13]:
        - text: Start Improving
        - text: Your City Today
      - paragraph [ref=e14]: Become a verified Community Hero. Report issues, earn trust points, and track real-time resolution powered by AI.
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - img [ref=e18]
          - generic [ref=e20]: Issues Resolved
        - generic [ref=e21]: 14,284
      - generic [ref=e22]:
        - generic [ref=e23]:
          - img [ref=e24]
          - generic [ref=e29]: Active Heroes
        - generic [ref=e30]: 2,851
  - generic [ref=e32]:
    - generic [ref=e33]:
      - heading "Create an account" [level=2] [ref=e34]
      - paragraph [ref=e35]: Join the platform and make an impact
    - generic [ref=e36]: An error occurred during registration
    - generic [ref=e37]:
      - generic [ref=e38]:
        - text: Full Name
        - textbox "John Doe" [ref=e39]: Test Citizen
      - generic [ref=e40]:
        - text: Email Address
        - textbox "name@example.com" [ref=e41]: citizen_1782787272801@example.com
      - generic [ref=e42]:
        - generic [ref=e43]:
          - text: Password
          - textbox "••••••••" [ref=e44]: StrongP@ssw0rd123
        - button [ref=e45] [cursor=pointer]:
          - img [ref=e46]
        - generic [ref=e55]:
          - generic [ref=e56]:
            - img [ref=e57]
            - text: At least 8 characters
          - generic [ref=e60]:
            - img [ref=e61]
            - text: Contains a number
          - generic [ref=e64]:
            - img [ref=e65]
            - text: Contains uppercase letter
          - generic [ref=e68]:
            - img [ref=e69]
            - text: Contains special character
      - generic [ref=e72]:
        - generic [ref=e73]:
          - text: Confirm Password
          - textbox "••••••••" [ref=e74]: StrongP@ssw0rd123
        - button [ref=e75] [cursor=pointer]:
          - img [ref=e76]
      - generic [ref=e80] [cursor=pointer]:
        - checkbox "I agree to the Terms & Conditions and Privacy Policy." [checked] [ref=e81]
        - generic [ref=e82]:
          - text: I agree to the
          - link "Terms & Conditions" [ref=e83]:
            - /url: /terms
          - text: and
          - link "Privacy Policy" [ref=e84]:
            - /url: /privacy
          - text: .
      - button "Create Account" [ref=e85] [cursor=pointer]
    - generic [ref=e86]:
      - text: Already have an account?
      - link "Sign in here" [ref=e87] [cursor=pointer]:
        - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Community Hero AI E2E', () => {
  4  |   const timestamp = Date.now()
  5  |   const testEmail = `citizen_${timestamp}@example.com`
  6  |   const testPassword = 'StrongP@ssw0rd123'
  7  | 
  8  |   test('User Registration and Login Flow', async ({ page }) => {
  9  |     // 1. Landing Page
  10 |     await page.goto('http://localhost:5173')
  11 | 
  12 |     // 2. Navigation to Signup
  13 |     await page.click('text=Get Started')
  14 |     await expect(page).toHaveURL(/.*signup/)
  15 | 
  16 |     // 3. Signup Form
  17 |     await page.fill('input[name="full_name"]', 'Test Citizen')
  18 |     await page.fill('input[name="email"]', testEmail)
  19 |     await page.fill('input[name="password"]', testPassword)
  20 |     await page.fill('input[name="confirm_password"]', testPassword)
  21 |     await page.check('input[name="agree_terms"]')
  22 |     await page.click('button[type="submit"]')
  23 | 
  24 |     // Should redirect to dashboard on successful signup (or login page depending on flow)
> 25 |     await page.waitForURL(/.*dashboard|login/)
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  26 |     if (page.url().includes('login')) {
  27 |       await page.fill('input[name="email"]', testEmail)
  28 |       await page.fill('input[name="password"]', testPassword)
  29 |       await page.click('button[type="submit"]')
  30 |       await page.waitForURL(/.*dashboard/)
  31 |     }
  32 | 
  33 |     // 4. Verify Dashboard
  34 |     // Just looking for text that might appear
  35 |     await expect(page.locator('body')).toContainText(/Dashboard|Report/)
  36 | 
  37 |     // 5. Logout
  38 |     if (await page.locator('text=Logout').isVisible()) {
  39 |       await page.click('text=Logout')
  40 |     }
  41 |   })
  42 | })
  43 | 
```