import { expect, Locator, Page } from '@playwright/test';

export class AvuaEmployerPage {
  readonly page: Page;
  readonly postJobButton: Locator;
  readonly jobTitleInput: Locator;
  readonly continueButton: Locator;
  readonly reviewButton: Locator;
  readonly publishButton: Locator;
  currentJobTitle: string = "";
  currentEmpType: string = "Onsite";


  constructor(page: Page) {
    this.page = page;
    this.postJobButton = page.getByRole('button', { name: /Post a Job/i }).first();
    this.jobTitleInput = page.getByPlaceholder(/Enter Job Title/i).first();
    this.continueButton = page.getByRole('button', { name: /Continue/i }).first();
    this.reviewButton = page.getByRole('button', { name: /Review|Submit/i }).or(page.locator('button').filter({ hasText: /Review/i })).first();
    this.publishButton = page.getByRole('button', { name: /Publish|Post/i }).or(page.locator('button').filter({ hasText: /Publish/i })).first();
  }

  async login(email: string, pass: string): Promise<void> {
    await this.page.goto('/employer-login', { waitUntil: 'domcontentloaded' });
    
    // Switch to Password tab
    const passwordTab = this.page.getByRole('button', { name: 'Password' }).first();
    await passwordTab.click();

    // Fill fields
    await this.page.getByPlaceholder('you@company.com').fill(email);
    await this.page.getByPlaceholder('Enter your password').fill(pass);
    await this.page.getByRole('button', { name: 'Sign in' }).click();

    await expect(this.page).toHaveURL(/\/employer\/dashboard/i, { timeout: 30000 });
    await expect(this.postJobButton).toBeVisible({ timeout: 30000 });
  }

  async navigateToJobPostPage(): Promise<void> {
    await this.page.goto('/employer/contract-job-post', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('employer-login')) {
      const email = process.env.EMPLOYER_EMAIL || 'pranjil+test@avua.com';
      const pass = process.env.EMPLOYER_PASSWORD || 'Test@123';
      await this.login(email, pass);
      await this.page.goto('/employer/contract-job-post', { waitUntil: 'domcontentloaded' });
    }
    await expect(this.page).toHaveURL(/\/employer\/contract-job-post/i);
    await expect(this.jobTitleInput).toBeVisible({ timeout: 15000 });
  }

  async fillStep1Details(jobTitle: string, empType: string = "Onsite", jobDescription: string = "We are seeking a skilled Playwright Test Engineer to build and maintain end-to-end tests.", addSkills: boolean = true, minExpYears: number = 4): Promise<void> {
    this.currentJobTitle = jobTitle;
    this.currentEmpType = empType;

    // Fill Job Title
    await this.jobTitleInput.fill(jobTitle);

    // Fill Job Summary
    const descInput = this.page.locator('.ql-editor').first();
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.click({ force: true });
      await descInput.fill(jobDescription);
    }

    // Add skills if requested
    if (addSkills) {
      const addSkillBtn = this.page.locator('text=+ Add skill').or(this.page.getByText('+ Add skill')).first();
      if (await addSkillBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addSkillBtn.click({ force: true });
      }

      const skillInput = this.page.getByPlaceholder(/Type a skill|Enter skill/i).first();
      if (await skillInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await skillInput.click();
        await skillInput.fill('Playwright');
        await this.page.keyboard.press('Enter');
        const skillOption = this.page.getByText('Playwright', { exact: true }).first();
        if (await skillOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await skillOption.click();
        }
      }
    }

    // Select Employment Type (Onsite / Hybrid / Remote)
    const empHeading = this.page.getByRole('heading', { name: new RegExp(empType, 'i') })
      .or(this.page.getByText(empType, { exact: true }))
      .first();

    await expect(empHeading).toBeVisible({ timeout: 10000 });
    await empHeading.scrollIntoViewIfNeeded();
    await empHeading.click({ force: true });

    // Experience Minimum
    const minExp = this.page.getByRole('spinbutton').first()
      .or(this.page.locator('input[type="number"]').first())
      .or(this.page.getByPlaceholder('0').first());

    await minExp.scrollIntoViewIfNeeded();
    await expect(minExp).toBeVisible({ timeout: 10000 });
    await minExp.click({ clickCount: 3 }); 
    await minExp.type(minExpYears.toString());
    await minExp.blur();

    // Location
    const countryInput = this.page.getByPlaceholder(/e\.g\.\s+United\s+States/i).first();
    await countryInput.scrollIntoViewIfNeeded();
    await countryInput.click();
    await countryInput.fill('');
    await countryInput.pressSequentially('United States', { delay: 80 });
    await this.page.waitForTimeout(1000);

    await countryInput.press('ArrowDown');
    await this.page.waitForTimeout(300);
    await countryInput.press('Enter');
    await this.page.waitForTimeout(500);

    const countrySuggestion = this.page.locator('div, li, p, span').filter({ hasText: /^United States$/i }).last();
    if (await countrySuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countrySuggestion.click({ force: true }).catch(() => {});
    }
    
    await this.page.waitForTimeout(1000);

    const cityInput = this.page.getByPlaceholder(/e\.g\.\s+California/i).first();
    await cityInput.scrollIntoViewIfNeeded();
    await cityInput.click();
    await cityInput.fill('');
    await cityInput.pressSequentially('New York', { delay: 80 });
    await this.page.waitForTimeout(1000);

    await cityInput.press('ArrowDown');
    await this.page.waitForTimeout(300);
    await cityInput.press('Enter');
    await this.page.waitForTimeout(500);

    const citySuggestion = this.page.locator('div, li, p, span').filter({ hasText: /New York/i }).last();
    if (await citySuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
      await citySuggestion.click({ force: true }).catch(() => {});
    }

    const langSelect = this.page.getByText('Select Language').first();
    if (await langSelect.isVisible().catch(() => false)) {
      await langSelect.click({ force: true });
      await this.page.getByText('English', { exact: true }).first().click({ force: true });
    }
  }

  async proceedToStep2(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).first().click();
    const step2Heading = this.page.getByRole('heading', { name: /Payment/i })
      .or(this.page.getByText(/Payment & Scope|Payment Details|Fixed Rate/i))
      .first();
    await step2Heading.waitFor({ state: 'visible', timeout: 20000 });
  }

  async proceedToStep3(): Promise<void> {
    // Take a debug screenshot before clicking Review so we can see Step 2 state
    await this.page.screenshot({ path: 'screenshots/step2_before_review.png', fullPage: true });
    console.log('[proceedToStep3] Taking screenshot before Review click');

    const reviewBtn = this.page.getByRole('button', { name: /Review|Continue|Submit/i })
      .or(this.page.locator('button').filter({ hasText: /Review|Continue/i }))
      .filter({ visible: true })
      .first();

    await expect(reviewBtn).toBeVisible({ timeout: 15000 });
    await reviewBtn.scrollIntoViewIfNeeded();
    await reviewBtn.click({ force: true });
    console.log('[proceedToStep3] Clicked Review button, waiting for Step 3...');

    // Wait for Step 3 heading OR Publish button to appear
    const step3Indicator = this.page.getByRole('heading', { name: /Review|Job Preview|Preview|Publish/i })
      .or(this.page.getByText(/Review \u0026 Publish|Step 3|Publish Job/i))
      .first();

    try {
      await step3Indicator.waitFor({ state: 'visible', timeout: 20000 });
      console.log('[proceedToStep3] Step 3 visible');
    } catch {
      // Take screenshot to diagnose if still on Step 2 (validation errors)
      await this.page.screenshot({ path: 'screenshots/step3_navigation_failed.png', fullPage: true });
      console.log('[proceedToStep3] Step 3 did not appear, may still be on Step 2 (validation error)');
    }

    const publishBtn = this.page.getByRole('button', { name: /Publish|Post|Submit|Confirm/i })
      .or(this.page.locator('button').filter({ hasText: /Publish|Post|Submit|Confirm/i }))
      .filter({ visible: true })
      .first();

    await expect(publishBtn).toBeVisible({ timeout: 35000 });
  }

  async publishJob(): Promise<void> {
    const publishBtn = this.page.getByRole('button', { name: /Publish|Post|Submit|Confirm/i })
      .or(this.page.locator('button').filter({ hasText: /Publish|Post|Submit|Confirm/i }))
      .filter({ visible: true })
      .first();
    await publishBtn.scrollIntoViewIfNeeded();
    await publishBtn.click({ force: true });
  }

  async verifyJobVisibleOnDashboard(jobTitle: string): Promise<void> {
    await this.page.waitForURL(/\/employer\/dashboard/i, { timeout: 30000, waitUntil: 'domcontentloaded' });
    // Click on the Jobs tab in the header
    const jobsTab = this.page.locator('a, button, div').filter({ hasText: /^Jobs$/ }).first();
    await expect(jobsTab).toBeVisible({ timeout: 15000 });
    await jobsTab.click();
    
    // Verify the job is visible in the list
    const jobRow = this.page.locator(`text="${jobTitle}"`).first();
    await expect(jobRow).toBeVisible({ timeout: 15000 });
  }
  async fillStep2Details(options: {
    currency?: string,
    frequency?: string,
    amount?: string,
    engagementModel?: 'IC' | 'EOR' | 'Undecided',
    contractLength?: string,
    startDate?: string,
    scopeOfWork?: string,
    language?: string,
    technicalRatio?: string
  } = {}): Promise<void> {
    const finalOptions = Object.keys(options).length === 0 
      ? { currency: 'USD', frequency: 'Hourly', amount: '5000', scopeOfWork: 'Detailed contract scope of work for test engineering role.', engagementModel: 'IC', contractLength: '6', startDate: 'auto' } as typeof options
      : options;
    const { currency, frequency, amount, engagementModel, contractLength, startDate, scopeOfWork, language, technicalRatio } = finalOptions;

    console.log('--- fillStep2Details options:', finalOptions);

    const paymentHeading = this.page.getByRole('heading', { name: /Payment/i })
      .or(this.page.getByText(/Payment & Scope|Payment Details|Fixed Rate/i))
      .first();
    await expect(paymentHeading).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    // Wait for React to fully hydrate and attach event listeners
    await this.page.waitForTimeout(3000); 

    // ── Step A: Engagement model first — its re-render resets payment fields, so we fill payment AFTER ──
    if (engagementModel) {
      let optionText = '';
      if (engagementModel === 'IC') optionText = 'Independent contractor (IC)';
      else if (engagementModel === 'EOR') optionText = 'Employer of Record (EOR)';
      else if (engagementModel === 'Undecided') optionText = 'Undecided';
      
      const modelCard = this.page.getByText(optionText).first();
      if (await modelCard.isVisible()) {
          await modelCard.scrollIntoViewIfNeeded();
          await modelCard.click();
          // The first test run (TC1a) can take longer to complete the engagement model
          // API validation/state update, causing a delayed reset of the scope fields.
          // Wait longer here so the reset happens BEFORE we fill the scope fields.
          await this.page.waitForTimeout(3000); 
      }
    }

    // ── Step B: Scope of Work (doesn't reset payment fields) ──
    if (scopeOfWork) {
      const scopeEditor = this.page.locator('.ql-editor').first();
      if (await scopeEditor.isVisible()) {
        await scopeEditor.fill(scopeOfWork);
      } else {
        const fallbackScope = this.page.locator('textarea').first();
        if (await fallbackScope.isVisible()) await fallbackScope.fill(scopeOfWork);
      }
    }

    // ── Step C: Currency (read-only, skip if already correct) ──
    if (currency) {
      const currencyInput = this.page.getByText('Currency').locator('..').locator('input').first();
      if (await currencyInput.isVisible().catch(() => false)) {
        const val = await currencyInput.inputValue();
        if (!val.includes(currency)) {
          await currencyInput.click();
          await this.page.locator('div').filter({ hasText: new RegExp(`^${currency}$`) }).first().click();
          await this.page.waitForTimeout(300);
        }
      }
    }

    // ── Step D: Payment frequency ──
    // The 'Select payment frequency' field is a custom combobox (textbox role).
    // We click it to open the dropdown, then click the option from the list.
    if (frequency) {
      // Try ARIA combobox / textbox with matching placeholder/label
      const freqCombobox = this.page.getByRole('combobox', { name: /payment frequency/i })
        .or(this.page.getByLabel(/payment frequency/i))
        .or(this.page.locator('input[placeholder*="frequency"], input[aria-label*="frequency"]'))
        .first();

      const isComboVisible = await freqCombobox.isVisible({ timeout: 3000 }).catch(() => false);

      if (isComboVisible) {
        await freqCombobox.scrollIntoViewIfNeeded();
        await freqCombobox.click({ force: true });
        await this.page.waitForTimeout(600);

        // Find the dropdown option list item
        const freqOption = this.page.locator('li, div[role="option"], div, span')
          .filter({ hasText: new RegExp(`^${frequency}$`, 'i') })
          .first();

        if (await freqOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await freqOption.click({ force: true });
        } else {
          // Fallback: type + ArrowDown + Enter
          await freqCombobox.fill('');
          await freqCombobox.pressSequentially(frequency.substring(0, 3), { delay: 60 });
          await this.page.waitForTimeout(400);
          await freqCombobox.press('ArrowDown');
          await freqCombobox.press('Enter');
        }
        await this.page.waitForTimeout(500);
      } else {
        // Last resort: find by visible text near 'Payment frequency' label
        const freqContainer = this.page.locator('text=Payment frequency').locator('..').locator('..');
        const freqBtn = freqContainer.getByRole('button').first();
        if (await freqBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await freqBtn.click({ force: true });
          await this.page.waitForTimeout(400);
          const opt = this.page.locator('li, div').filter({ hasText: new RegExp(`^${frequency}$`, 'i') }).first();
          if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
            await opt.click({ force: true });
          }
        }
      }
      await this.page.waitForTimeout(500);
    }

    // ── Step E: Amount — after frequency so both payment fields settle together ──
    if (amount) {
      const amountInput = this.page.getByPlaceholder('Enter Amount').first();
      if (await amountInput.isVisible()) {
        await amountInput.click();
        await amountInput.fill('');
        await amountInput.pressSequentially(amount);
        await amountInput.blur();
      }
      // Extra wait: let any payment-section re-render triggered by amount fully settle
      await this.page.waitForTimeout(1000);
    }

    // ── Step F: Language ──
    if (language) {
      const langSelect = this.page.getByText('Select Language').first();
      if (await langSelect.isVisible()) {
        await langSelect.click();
        await this.page.getByText(language, { exact: true }).first().click();
      }
    }

    // ── Step G: Technical Ratio ──
    if (technicalRatio) {
      const ratioInput = this.page.locator('input[type="number"]').last();
      if (await ratioInput.isVisible()) {
        await ratioInput.click();
        await ratioInput.fill('');
        await ratioInput.pressSequentially(technicalRatio);
        await ratioInput.blur();
      }
    }

    // ── Step H: Contract Length — filled AFTER payment fields so payment re-renders cannot reset it ──
    if (contractLength) {
      const lengthInput = this.page.getByPlaceholder(/Enter Contract Length/i).first();
      await lengthInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
      if (await lengthInput.isVisible()) {
        await lengthInput.click({ force: true });
        await lengthInput.fill(contractLength);
        await lengthInput.blur();
      }
    }

    // ── Step I: Contract Start Date — filled LAST so nothing can reset it afterward ──
    if (startDate) {
      const startDateInput = this.page.getByPlaceholder(/Select date|Contract Start Date|MM\/DD\/YYYY/i)
        .or(this.page.locator('div[aria-label*="Contract Start Date"]'))
        .or(this.page.getByText(/Contract Start Date/i).locator('..'))
        .first();

      if (await startDateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startDateInput.scrollIntoViewIfNeeded();
        await startDateInput.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(500);

        const firstEnabledDay = this.page.locator(
          'button[class*="rounded-lg"][class*="aspect-square"]:not([disabled]):not([class*="cursor-not-allowed"])'
        ).first();

        if (await firstEnabledDay.isVisible({ timeout: 3000 }).catch(() => false)) {
          await firstEnabledDay.click({ force: true }).catch(() => {});
        }
      }
    }

    // Ensure calendar/dropdown popups are closed
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(1000);
  }
}
