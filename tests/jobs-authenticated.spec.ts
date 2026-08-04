import { test, expect } from '@playwright/test';
import { AvuaJobsBoardPage } from '../pages/AvuaJobsBoardPage';
import { registerAndVerifyApplicant } from '../utils/applicantAuthHelper';

test.describe('@email Authenticated Applicant - Job Application & Filtering Flows', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC36 - should complete applicant onboarding and initiate a contract job AI interview', async ({ page }) => {
    test.setTimeout(900000);
    await registerAndVerifyApplicant(page, 'int');

    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.selectLocationIfPrompted('Dubai');
    await page.goto('https://demo.avua.online/jobs', { waitUntil: 'domcontentloaded' });
    await jobsPage.startContractJobInterview();
    console.log('Contract job AI interview successfully initiated.');
  });

  test('TC37 - should complete applicant onboarding and verify ZipRecruiter redirection for full-time jobs', async ({ page }) => {
    test.setTimeout(900000);
    await registerAndVerifyApplicant(page, 'zip');

    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.selectLocationIfPrompted('Dubai');
    await page.goto('https://demo.avua.online/jobs', { waitUntil: 'domcontentloaded' });
    await jobsPage.clickFirstViewJob();

    const applyNowBtn = jobsPage.getApplyNowButton();
    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
    await jobsPage.clickApplyNowAndVerifyZipRecruiter('auth_fulltime');
  });

  test('TC38 - should complete applicant onboarding and verify free resume scoring redirection', async ({ page }) => {
    test.setTimeout(900000);
    await registerAndVerifyApplicant(page, 'res');

    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.selectLocationIfPrompted('Dubai');
    await page.goto('https://demo.avua.online/jobs', { waitUntil: 'domcontentloaded' });
    await jobsPage.clickFirstViewJob();
    await jobsPage.clickResumeScoringAndVerifyRedirect();
  });

  test('TC39 - should apply employment models and date posted filters on contract jobs dashboard', async ({ page }) => {
    test.setTimeout(900000);
    await registerAndVerifyApplicant(page, 'c_flt');

    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.selectLocationIfPrompted('Dubai');
    await page.goto('https://demo.avua.online/dashboard/contract-jobs', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    console.log('Testing Contract Jobs dashboard filter buttons...');
    await jobsPage.clickFilterButton('Last week');
    await jobsPage.clickFilterButton('Remote');
    await jobsPage.clickFilterButton('Hybrid');
    await jobsPage.clickFilterButton('On-site');
    await jobsPage.clickFilterButton('Last month');
  });

  test('TC40 - should apply employment models and preference filters on full-time opportunities dashboard', async ({ page }) => {
    test.setTimeout(900000);
    await registerAndVerifyApplicant(page, 'f_flt');

    const jobsPage = new AvuaJobsBoardPage(page);
    await jobsPage.selectLocationIfPrompted('Dubai');
    await page.goto('https://demo.avua.online/dashboard/all-opportunities', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    console.log('Testing Full-Time opportunities dashboard filters...');
    await jobsPage.applyFilter('Last week');
    await jobsPage.applyFilter('Full time');
    await jobsPage.applyFilter('Part time');
    await jobsPage.applyFilter('Remote');
    await jobsPage.applyFilter('Hybrid');
    await jobsPage.applyFilter('On-site');
    await jobsPage.applyFilter('Last month');
  });
});
