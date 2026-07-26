import { test, expect } from '@playwright/test';

test.use({
  storageState: { cookies: [], origins: [] },
  permissions: ['clipboard-read', 'clipboard-write']
});

test('TC35 - Unauthenticated user copies job link directly from the list card and verifies success indicator', async ({ page }) => {
  // Step 1: Navigate directly to /jobs
  console.log('Navigating to job openings board...');
  await page.goto('/jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Step 2: Locate the first visible copy link button beside the job title in the list
  console.log('Locating first visible copy link button on the card list...');
  const copyBtn = page.locator('button[aria-label="Copy job link"]').filter({ visible: true }).first()
    .or(page.locator('button[title="Copy link"]').filter({ visible: true }).first())
    .first();

  await expect(copyBtn).toBeVisible({ timeout: 15000 });

  // Step 3: Click the copy link button directly on the card
  console.log('Clicking the copy link button on the card...');
  await copyBtn.click();

  // Step 4: Assert that the "Link copied" success text is displayed (in green)
  console.log('Verifying "Link copied" success indicator is visible on screen...');
  const successText = page.getByText('Link copied').filter({ visible: true }).first();
  await expect(successText).toBeVisible({ timeout: 10000 });
  console.log('Success indicator "Link copied" is visible!');

  // Step 5: Read clipboard and verify it contains a valid job URL
  console.log('Reading clipboard content...');
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  console.log(`Copied Clipboard URL: ${clipboardText}`);

  expect(clipboardText).toContain('demo.avua.online/jobs/');

  // Take screenshot of success state
  await page.screenshot({ path: 'screenshots/tc35_public_copy_success.png', fullPage: true });
  console.log('TC35 successfully completed and verified!');
});
