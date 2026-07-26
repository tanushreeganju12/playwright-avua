import { test, expect } from '@playwright/test';

test('dump step 1', async ({ page }) => {
  await page.goto('/employer-login', { waitUntil: 'domcontentloaded' });

  // Login
  const passwordTab = page.getByRole('button', { name: 'Password' }).first();
  await passwordTab.click();
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(/\/employer\/dashboard/i, { timeout: 15000 });

  const postJobButton = page.getByRole('button', { name: /Post a Job/i }).first();
  await postJobButton.click();

  await page.waitForURL(/\/employer\/contract-job-post/i, { timeout: 15000 });
  await page.waitForTimeout(5000); // Wait for form to load

  const bodyText = await page.locator('body').innerText();
  console.log('---TEXT---');
  console.log(bodyText);
});
