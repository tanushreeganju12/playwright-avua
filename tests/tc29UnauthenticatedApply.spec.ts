import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC29 - Unauthenticated user full-time job apply redirect to ZipRecruiter', async ({ page }) => {
  // Step 1: Navigate to /jobs
  console.log('Navigating to job openings board...');
  await page.goto('/jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Step 2: Open full-time jobs filter or select the first full-time job card
  console.log('Filtering for Full-time jobs...');
  const fullTimeFilter = page.getByRole('checkbox', { name: /Full time/i }).first()
    .or(page.locator('text=Full time').first());

  if (await fullTimeFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
    await fullTimeFilter.click();
    await page.waitForTimeout(3000);
  }

  // Step 3: Click View job
  console.log('Clicking "View job" on the first card...');
  const viewJobBtn = page.getByRole('link', { name: /View job/i })
    .or(page.getByRole('button', { name: /View job/i }))
    .or(page.locator('text=View job'))
    .first();

  await expect(viewJobBtn).toBeVisible({ timeout: 15000 });
  await viewJobBtn.click();
  await page.waitForTimeout(3000);

  // Step 4: Verify two buttons are displayed: Apply now and Sign up
  console.log('Verifying "Apply Now" and "Sign Up" buttons are displayed...');
  const applyNowBtn = page.getByRole('button', { name: /Apply now/i }).filter({ visible: true }).first()
    .or(page.getByRole('link', { name: /Apply now/i }).filter({ visible: true }).first())
    .or(page.locator('text=Apply Now').filter({ visible: true }).first())
    .first();

  const signUpBtn = page.getByRole('button', { name: /Sign up/i }).filter({ visible: true }).first()
    .or(page.getByRole('link', { name: /Sign up/i }).filter({ visible: true }).first())
    .or(page.locator('text=Sign Up').filter({ visible: true }).first())
    .or(page.locator('text=Sign up to save').filter({ visible: true }).first())
    .first();

  await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
  await expect(signUpBtn).toBeVisible({ timeout: 15000 });
  console.log('Both buttons verified successfully!');

  // Step 5: Click Apply now and verify redirect to ZipRecruiter
  console.log('Clicking Apply now and listening for redirect...');
  
  // Listen for tab popup or main page navigation redirect
  const popupPromise = page.context().waitForEvent('page', { timeout: 10000 }).catch(() => null);
  await applyNowBtn.click();

  const popup = await popupPromise;
  if (popup) {
    console.log('Redirect opened in a new tab. Waiting for page to load...');
    await popup.waitForLoadState('domcontentloaded');
    // Wait 6 seconds to let ZipRecruiter fully render
    await popup.waitForTimeout(6000);
    const url = popup.url();
    console.log('New tab URL:', url);
    expect(url).toContain('ziprecruiter.com');
    await popup.screenshot({ path: `screenshots/tc29_ziprecruiter_new_tab.png`, fullPage: true });
    await popup.close();
  } else {
    console.log('No new tab opened. Checking redirect on current page...');
    await page.waitForTimeout(10000);
    const url = page.url();
    console.log('Current page URL:', url);
    expect(url).toContain('ziprecruiter.com');
    await page.screenshot({ path: `screenshots/tc29_ziprecruiter_redirect.png`, fullPage: true });
  }

  console.log('Successfully verified redirect to ZipRecruiter for unauthenticated user!');
});
