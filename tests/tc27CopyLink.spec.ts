import { test, expect } from '@playwright/test';

test.use({
  storageState: { cookies: [], origins: [] },
  permissions: ['clipboard-read', 'clipboard-write']
});

test('TC27 - Copy Link functionality for unauthenticated user', async ({ page }) => {
  // Step 1: Navigate directly to /jobs
  console.log('Navigating to job openings board...');
  await page.goto('/jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Step 2: Search for the "Production Operator" job
  console.log('Searching for "Production Operator" job...');
  const searchInput = page.getByPlaceholder(/Job title, skill or company/i).first();
  await expect(searchInput).toBeVisible({ timeout: 15000 });
  await searchInput.fill('Production Operator');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);

  // Step 3: Click "View Job" on the first card
  console.log('Clicking "View job" on the first matching card...');
  const viewJobBtn = page.getByRole('link', { name: /View job/i })
    .or(page.getByRole('button', { name: /View job/i }))
    .or(page.locator('text=View job'))
    .first();

  await expect(viewJobBtn).toBeVisible({ timeout: 15000 });
  await viewJobBtn.click();
  await page.waitForTimeout(3000);

  // Step 4: Click "Copy Link" on the job details page
  console.log('Clicking "Copy Link"...');
  const copyLinkBtn = page.locator('text=Copy Link').filter({ visible: true }).first()
    .or(page.getByText('Copy Link').filter({ visible: true }).first())
    .first();

  await expect(copyLinkBtn).toBeVisible({ timeout: 15000 });
  await copyLinkBtn.click();
  await page.waitForTimeout(2000);

  // Step 5: Read clipboard and verify it matches the current URL
  console.log('Reading clipboard content...');
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  console.log(`Copied Clipboard URL: ${clipboardText}`);

  const currentUrl = page.url();
  console.log(`Current page URL: ${currentUrl}`);

  // Assert that clipboard contains a valid jobs details link
  expect(clipboardText).toContain('demo.avua.online/jobs/');
  expect(clipboardText).toEqual(currentUrl);

  // Take screenshot of success state
  await page.screenshot({ path: 'screenshots/tc27_copied_success.png', fullPage: true });
  console.log('TC27 successfully completed and verified!');
});
