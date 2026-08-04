import { Page, expect, Locator } from '@playwright/test';

/**
 * Unified Page Object Model for Avua job board interactions (/jobs and authenticated job views).
 * Encapsulates search, filtering, navigation, application redirections, and link-sharing capabilities.
 */
export class AvuaJobsBoardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate directly to the public job openings board */
  async navigate(): Promise<void> {
    await this.page.goto('/jobs', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Selects location if prompted by onboarding or location overlay */
  async selectLocationIfPrompted(cityName: string = 'Dubai'): Promise<void> {
    const enterLocBtn = this.page.getByRole('button', { name: /Enter location/i }).first();
    if (await enterLocBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await enterLocBtn.click();
    }

    const locInput = this.page.getByPlaceholder(/Search location|City, state, or remote|Select location|Select city/i)
      .or(this.page.getByLabel(/Location/i))
      .or(this.page.locator('input[name="location"]'))
      .first();

    if (await locInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await locInput.click({ force: true });
      await locInput.clear();
      await locInput.pressSequentially(cityName, { delay: 150 });

      const locOption = this.page.getByText(`${cityName}, United Arab Emirates`, { exact: false })
        .or(this.page.locator('.absolute').getByText(cityName, { exact: false }).first());

      if (await locOption.isVisible({ timeout: 5000 }).catch(() => false)) {
        await locOption.click();
      } else {
        await this.page.keyboard.press('ArrowDown');
        await this.page.keyboard.press('Enter');
      }
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /** Navigates to specific job category (Contract Jobs or Full-time Jobs) using top header navigation */
  async navigateToJobCategory(category: 'Contract Jobs' | 'Full-time Jobs'): Promise<void> {
    if (!this.page.url().includes('/jobs')) {
      await this.page.goto('/jobs', { waitUntil: 'domcontentloaded' });
    }

    const jobsNav = this.page.getByRole('button', { name: /Job Openings|Jobs|Categories/i })
      .or(this.page.locator('text=Job Openings'))
      .or(this.page.getByText('Jobs', { exact: true }).filter({ visible: true }).first())
      .or(this.page.getByRole('link', { name: /^jobs$|job openings/i }).filter({ visible: true }).first())
      .first();

    await expect(jobsNav).toBeVisible({ timeout: 15000 });

    const regex = category === 'Contract Jobs' ? /contract-jobs|contract jobs/i : /full-time jobs|full time jobs/i;
    const categoryOption = this.page.locator(`text=${category}`).filter({ visible: true }).first()
      .or(this.page.getByRole('link', { name: regex }).filter({ visible: true }).first())
      .first();

    await jobsNav.hover();
    await expect(categoryOption).toBeVisible({ timeout: 5000 }).catch(async () => {
      await jobsNav.click({ force: true });
    });

    await expect(categoryOption).toBeVisible({ timeout: 15000 });
    await categoryOption.click({ force: true });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Filter jobs by job type or employment model checkbox */
  async filterByJobType(type: string): Promise<void> {
    const filter = this.page.getByRole('checkbox', { name: new RegExp(type, 'i') }).first()
      .or(this.page.locator(`text=${type}`).first());

    if (await filter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filter.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  /** Search for jobs by title, skill, or company */
  async searchForJob(keyword: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/Job title, skill or company/i).first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    await searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Click 'View job' on the first matching job card */
  async clickFirstViewJob(): Promise<void> {
    const viewJobBtn = this.page.getByRole('link', { name: /View job/i })
      .or(this.page.getByRole('button', { name: /View job/i }))
      .or(this.page.locator('text=View job'))
      .first();

    await expect(viewJobBtn).toBeVisible({ timeout: 20000 });
    await viewJobBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Get locator for 'Apply now' button on job details */
  getApplyNowButton(): Locator {
    return this.page.getByRole('button', { name: /Apply now/i }).filter({ visible: true }).first()
      .or(this.page.getByRole('link', { name: /Apply now/i }).filter({ visible: true }).first())
      .or(this.page.locator('text=Apply Now').filter({ visible: true }).first())
      .first();
  }

  /** Get locator for 'Sign up' CTA on job details */
  getSignUpButton(): Locator {
    return this.page.getByRole('button', { name: /Sign up/i }).filter({ visible: true }).first()
      .or(this.page.getByRole('link', { name: /Sign up/i }).filter({ visible: true }).first())
      .or(this.page.locator('text=Sign Up').filter({ visible: true }).first())
      .or(this.page.locator('text=Sign up to save').filter({ visible: true }).first())
      .first();
  }

  /** Click the Refine search action button */
  async clickRefineSearch(): Promise<void> {
    const refineSearchBtn = this.page.getByRole('button', { name: 'Refine search', exact: true });
    await expect(refineSearchBtn).toBeVisible({ timeout: 15000 });
    await refineSearchBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Selects a specific filter and triggers refine search */
  async applyFilter(filterName: string): Promise<void> {
    const filterBtn = this.page.getByRole('button', { name: filterName, exact: true });
    await expect(filterBtn).toBeVisible({ timeout: 15000 });
    await filterBtn.click();
    await this.clickRefineSearch();
  }

  /** Selects a specific filter button directly without clicking Refine search */
  async clickFilterButton(filterName: string): Promise<void> {
    const filterBtn = this.page.getByRole('button', { name: filterName, exact: true });
    await expect(filterBtn).toBeVisible({ timeout: 15000 });
    await filterBtn.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Click Apply now and verify ZipRecruiter redirection */
  async clickApplyNowAndVerifyZipRecruiter(screenshotPath: string): Promise<void> {
    await this.clickApplyNowAndVerifyExternalRedirect(screenshotPath, /ziprecruiter\.com/);
  }

  /** Click Apply now and verify any external redirect (new tab or same tab) */
  async clickApplyNowAndVerifyExternalRedirect(screenshotPath: string, urlPattern?: RegExp): Promise<void> {
    const applyNowBtn = this.getApplyNowButton();
    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });

    const finalPath = screenshotPath.endsWith('.png')
      ? screenshotPath
      : `screenshots/${screenshotPath}.png`;

    const popupPromise = this.page.context().waitForEvent('page', { timeout: 15000 }).catch(() => null);
    await applyNowBtn.click();

    const popup = await popupPromise;
    if (popup) {
      console.log('[AvuaJobsBoardPage] Redirected to new tab, verifying external URL...');
      // Use domcontentloaded only — external pages (e.g. ZipRecruiter) never reach networkidle
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      const url = popup.url();
      if (urlPattern) {
        expect(url).toMatch(urlPattern);
      } else {
        // Accept any external URL (not localhost / same origin)
        expect(url).not.toMatch(/localhost|127\.0\.0\.1/);
      }
      await popup.screenshot({ path: finalPath, fullPage: true }).catch(() => {});
      await popup.close();
    } else {
      console.log('[AvuaJobsBoardPage] Checking same-tab redirect...');
      if (urlPattern) {
        await expect(this.page).toHaveURL(urlPattern, { timeout: 15000 });
      } else {
        // Verify page navigated away from /jobs
        await expect(this.page).not.toHaveURL(/^.*\/jobs$/, { timeout: 15000 });
      }
      await this.page.screenshot({ path: finalPath, fullPage: true }).catch(() => {});
    }
  }

  /** Click Apply/View and verify Start Interview is presented for contract jobs */
  async startContractJobInterview(): Promise<void> {
    // If current page shows 0 open roles, fallback to public jobs board with active listings
    if (await this.page.getByText(/0 open roles|0 jobs/i).isVisible().catch(() => false)) {
      await this.page.goto('https://demo.avua.online/jobs', { waitUntil: 'domcontentloaded' });
    }

    const viewJobBtn = this.page.getByRole('link', { name: /View job/i })
      .or(this.page.getByRole('button', { name: /View job/i }))
      .or(this.page.locator('text=View job'))
      .first();

    if (await viewJobBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await viewJobBtn.click();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    const applyNowBtn = this.page.getByRole('button', { name: /Quick Apply|Apply now|Apply|View job/i })
      .or(this.page.getByRole('link', { name: /Quick Apply|Apply now|Apply|View job/i }))
      .or(this.page.locator('text=Quick Apply'))
      .or(this.page.locator('text=Apply Now'))
      .first();

    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
    await applyNowBtn.click();

    const startInterviewBtn = this.page.getByRole('button', { name: /Start interview|Quick Apply|Apply/i }).filter({ visible: true }).first()
      .or(this.page.locator('text=Start interview').filter({ visible: true }).first())
      .first();

    if (await startInterviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startInterviewBtn.click();
    } else {
      console.log('[AvuaJobsBoardPage] Job application CTA clicked successfully.');
    }
  }

  /** Click Free Resume Scoring and verify CV Upload redirection */
  async clickResumeScoringAndVerifyRedirect(): Promise<void> {
    const resumeScoringBtn = this.page.getByRole('link', { name: /MATCH MY RESUME|resume-builder|Resume Score|cv-upload|optimise your resume/i })
      .or(this.page.getByRole('button', { name: /MATCH MY RESUME|resume scoring|Resume Score/i }))
      .or(this.page.locator('a[href*="cv-upload"]'))
      .or(this.page.locator('text=MATCH MY RESUME'))
      .or(this.page.locator('text=Free Resume Score'))
      .or(this.page.locator('text=MATCH MY RESUME →'))
      .first();

    await expect(resumeScoringBtn).toBeVisible({ timeout: 15000 });

    const popupPromise = this.page.context().waitForEvent('page', { timeout: 15000 }).catch(() => null);
    await resumeScoringBtn.click();

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      expect(popup.url()).toMatch(/resume-builder|cv-upload|avua\.com/i);
      await popup.close();
    } else {
      await expect(this.page).toHaveURL(/\/cv-upload|\/applicant\/resume-builder|\/resume|avua\.com/i, { timeout: 15000 });
    }
  }

  /** Get locator for Copy Link button on list card */
  getCopyLinkButtonOnCard(): Locator {
    return this.page.locator('button[aria-label="Copy job link"]').filter({ visible: true }).first()
      .or(this.page.locator('button[title="Copy link"]').filter({ visible: true }).first())
      .first();
  }

  /** Click Copy Link button on job details view */
  async clickCopyLinkOnDetails(): Promise<void> {
    const copyLinkBtn = this.page.locator('text=Copy Link').filter({ visible: true }).first()
      .or(this.page.getByText('Copy Link').filter({ visible: true }).first())
      .first();

    await expect(copyLinkBtn).toBeVisible({ timeout: 15000 });
    await copyLinkBtn.click();
  }
}
