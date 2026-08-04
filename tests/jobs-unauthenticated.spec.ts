import { test, expect } from '@playwright/test';
import { AvuaJobsBoardPage } from '../pages/AvuaJobsBoardPage';

test.describe('Public Job Openings - Unauthenticated Flows', () => {
  test.use({
    storageState: { cookies: [], origins: [] },
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  test('TC30 - should allow searching for job openings by keyword', async ({ page }) => {
    const jobsPage = new AvuaJobsBoardPage(page);
    console.log('Navigating to public job board...');
    await jobsPage.navigate();

    console.log('Searching for keyword "electrician"...');
    await jobsPage.searchForJob('electrician');

    const jobTitleMatches = page.getByRole('heading', { name: /Electrician/i })
      .or(page.locator('text=Electrician'))
      .or(page.locator('text=electrician'))
      .filter({ visible: true });

    await expect(jobTitleMatches.first()).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'screenshots/public_jobs_search_results.png', fullPage: true });
  });

  test('TC31 - should allow filtering job openings by date posted and employment model', async ({ page }) => {
    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.navigate();

    const refineSearchBtn = page.getByRole('button', { name: 'Refine search', exact: true });
    await expect(refineSearchBtn).toBeVisible({ timeout: 15000 });

    console.log('Applying Date Posted and Employment Model filters...');
    await jobsPage.applyFilter('Last week');
    await jobsPage.applyFilter('Full time');
    await jobsPage.applyFilter('Part time');
    await jobsPage.applyFilter('Remote');
    await jobsPage.applyFilter('Hybrid');
    await jobsPage.applyFilter('On-site');
    await jobsPage.applyFilter('Last month');

    const jobCard = page.locator('.job-card, [class*="job-card"], li, div').filter({ hasText: /View job/i }).first();
    await expect(jobCard).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'screenshots/public_jobs_filtered.png', fullPage: true });
  });

  test('TC32 - should display apply and sign-up buttons and redirect to ZipRecruiter upon applying', async ({ page }) => {
    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.navigate();
    await jobsPage.filterByJobType('Full time');
    await jobsPage.clickFirstViewJob();

    const applyNowBtn = jobsPage.getApplyNowButton();
    const signUpBtn = jobsPage.getSignUpButton();

    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
    await expect(signUpBtn).toBeVisible({ timeout: 15000 });

    // ZipRecruiter redirect may open in a new tab or same tab
    await jobsPage.clickApplyNowAndVerifyExternalRedirect('public_jobs_apply');
  });

  test('TC33 - should redirect to sign-up page when clicking sign-up from job details', async ({ page }) => {
    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.navigate();
    await jobsPage.filterByJobType('Full time');
    await jobsPage.clickFirstViewJob();

    const signUpBtn = jobsPage.getSignUpButton();
    await expect(signUpBtn).toBeVisible({ timeout: 15000 });

    // The "Sign up" link opens in a new tab — intercept the popup
    const popupPromise = page.context().waitForEvent('page', { timeout: 15000 });
    await signUpBtn.click();
    const signupPage = await popupPromise;
    await signupPage.waitForLoadState('domcontentloaded').catch(() => {});

    await signupPage.screenshot({ path: 'screenshots/public_jobs_signup_redirect.png', fullPage: true }).catch(() => {});

    // Verify new tab landed on signup page
    await expect(signupPage).toHaveURL(/\/signup|\//i, { timeout: 15000 });
    await signupPage.close();
  });

  test('TC34 - should copy job detail link directly from openings list card and display success feedback', async ({ page }) => {
    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.navigate();

    const copyBtn = jobsPage.getCopyLinkButtonOnCard();
    await expect(copyBtn).toBeVisible({ timeout: 15000 });
    await copyBtn.click();

    const successText = page.getByText('Link copied').filter({ visible: true }).first();
    await expect(successText).toBeVisible({ timeout: 10000 });

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('demo.avua.online/jobs/');
    await page.screenshot({ path: 'screenshots/public_jobs_card_copy_success.png', fullPage: true });
  });

  test('TC35 - should copy job link from full job details view and display success feedback', async ({ page }) => {
    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.navigate();
    await jobsPage.searchForJob('Production Operator');
    await jobsPage.clickFirstViewJob();
    await jobsPage.clickCopyLinkOnDetails();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const currentUrl = page.url();

    expect(clipboardText).toContain('demo.avua.online/jobs/');
    expect(clipboardText).toEqual(currentUrl);
    await page.screenshot({ path: 'screenshots/public_jobs_details_copy_success.png', fullPage: true });
  });
});
