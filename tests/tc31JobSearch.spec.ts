import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC31 - Search for jobs on the job openings board', async ({ page }) => {
  // Step 1: Navigate directly to /jobs
  console.log('Navigating to job openings board...');
  await page.goto('/jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Step 2: Locate search input and type "electrician"
  console.log('Searching for "electrician"...');
  const searchInput = page.getByPlaceholder(/Job title, skill or company/i).first();
  await expect(searchInput).toBeVisible({ timeout: 15000 });
  await searchInput.fill('electrician');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);

  // Step 3: Verify that electrician jobs are displayed in results
  console.log('Verifying search results contain electrician jobs...');
  
  // Locate job cards or headings containing "Electrician"
  const jobTitleMatches = page.getByRole('heading', { name: /Electrician/i })
    .or(page.locator('text=Electrician'))
    .or(page.locator('text=electrician'))
    .filter({ visible: true });

  await expect(jobTitleMatches.first()).toBeVisible({ timeout: 15000 });
  console.log('Electrician job matches were successfully found and displayed!');

  // Take a screenshot of the search results page
  await page.screenshot({ path: 'screenshots/tc31_search_results.png', fullPage: true });
  console.log('TC31 successfully completed and verified!');
});
