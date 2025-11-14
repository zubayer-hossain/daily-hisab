import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show login page with Google sign in button', async ({ page }) => {
    await page.goto('/login');
    
    // Check for app title
    await expect(page.locator('text=দৈনিক হিসাব')).toBeVisible();
    await expect(page.locator('text=Daily Hisab')).toBeVisible();
    
    // Check for Google sign in button
    await expect(page.locator('text=গুগল দিয়ে সাইন ইন করুন')).toBeVisible();
  });

  test('should redirect authenticated users from login to dashboard', async ({ page }) => {
    // This test would require mocking authentication
    // In a real scenario, you'd set up authenticated session cookies
  });
});

