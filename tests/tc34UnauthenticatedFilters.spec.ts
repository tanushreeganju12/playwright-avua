import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC34 - Unauthenticated user filters jobs on the public openings board', async ({ page }) => {
  // Step 1: Navigate directly to /jobs
  console.log('Navigating to job openings board...');
  await page.goto('/jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Locate the "Refine search" button
  const refineSearchBtn = page.getByRole('button', { name: 'Refine search', exact: true });
  await expect(refineSearchBtn).toBeVisible({ timeout: 15000 });

  // Step 2: Apply "Last week" Date Posted filter and refine
  console.log('Filtering by Date Posted: Last week...');
  const lastWeekBtn = page.getByRole('button', { name: 'Last week', exact: true });
  await expect(lastWeekBtn).toBeVisible({ timeout: 15000 });
  await lastWeekBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(2000);

  // Step 3: Apply "Full time" Job Preference filter and refine
  console.log('Filtering by Job Preference: Full time...');
  const fullTimeBtn = page.getByRole('button', { name: 'Full time', exact: true });
  await expect(fullTimeBtn).toBeVisible({ timeout: 15000 });
  await fullTimeBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(2000);

  // Step 4: Apply "Part time" Job Preference filter and refine
  console.log('Filtering by Job Preference: Part time...');
  const partTimeBtn = page.getByRole('button', { name: 'Part time', exact: true });
  await expect(partTimeBtn).toBeVisible({ timeout: 15000 });
  await partTimeBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(2000);

  // Step 5: Apply "Remote" Employment Model filter and refine
  console.log('Filtering by Employment Model: Remote...');
  const remoteBtn = page.getByRole('button', { name: 'Remote', exact: true });
  await expect(remoteBtn).toBeVisible({ timeout: 15000 });
  await remoteBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(2000);

  // Step 6: Apply "Hybrid" Employment Model filter and refine
  console.log('Filtering by Employment Model: Hybrid...');
  const hybridBtn = page.getByRole('button', { name: 'Hybrid', exact: true });
  await expect(hybridBtn).toBeVisible({ timeout: 15000 });
  await hybridBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(2000);

  // Step 7: Apply "On-site" Employment Model filter and refine
  console.log('Filtering by Employment Model: On-site...');
  const onsiteBtn = page.getByRole('button', { name: 'On-site', exact: true });
  await expect(onsiteBtn).toBeVisible({ timeout: 15000 });
  await onsiteBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(2000);

  // Step 8: Apply "Last month" Date Posted filter and refine
  console.log('Filtering by Date Posted: Last month...');
  const lastMonthBtn = page.getByRole('button', { name: 'Last month', exact: true });
  await expect(lastMonthBtn).toBeVisible({ timeout: 15000 });
  await lastMonthBtn.click();
  await refineSearchBtn.click();
  await page.waitForTimeout(3000);

  // Assert that job cards are still displayed on the board
  console.log('Verifying that filtered jobs list is visible...');
  const jobCard = page.locator('.job-card, [class*="job-card"], li, div').filter({ hasText: /View job/i }).first();
  await expect(jobCard).toBeVisible({ timeout: 15000 });

  // Take screenshot of filtered board
  await page.screenshot({ path: 'screenshots/tc34_unauthenticated_jobs_filters.png', fullPage: true });
  console.log('TC34 successfully completed and verified!');
});
