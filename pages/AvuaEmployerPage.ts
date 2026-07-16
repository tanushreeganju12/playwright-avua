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
    this.reviewButton = page.getByRole('button', { name: /Review/i }).first();
    this.publishButton = page.getByRole('button', { name: /Publish/i }).first();
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
    await expect(this.page).toHaveURL(/\/employer\/contract-job-post/i);
    await expect(this.jobTitleInput).toBeVisible({ timeout: 10000 });
  }

  async fillStep1Details(jobTitle: string, empType: string = "Onsite", jobDescription: string = "We are seeking a skilled Playwright Test Engineer to build and maintain end-to-end tests.", addSkills: boolean = true, minExpYears: number = 4): Promise<void> {
    this.currentJobTitle = jobTitle;
    this.currentEmpType = empType;

    // Fill Job Title
    await this.jobTitleInput.fill(jobTitle);
    await this.page.keyboard.press('Escape');
    
    // Wait for the dropdown suggestion text to appear and click it if available
    const suggestion = this.page.locator(`text="${jobTitle}"`).last();
    if (await suggestion.isVisible({ timeout: 1500 }).catch(() => false)) {
      await suggestion.click();
    }

    // Job Description
    const descInput = this.page.locator('.ql-editor').first();
    await expect(descInput).toBeVisible();
    await descInput.click({ force: true });
    await descInput.fill(jobDescription);

    if (addSkills) {
      // Select skills
      const addSkillBtn = this.page.locator('text=+ Add skill').first();
      await addSkillBtn.click();

      const skillsInput = this.page.getByPlaceholder(/Enter skills/i).first();
      await expect(skillsInput).toBeVisible();
      await skillsInput.click();
      await skillsInput.fill('Playwright');
      await this.page.keyboard.press('Enter');
      
      const skillDropdown = this.page.locator('text="Playwright"').last();
      if (await skillDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
         await skillDropdown.click();
      }
    }

    // Select Employment Type FIRST (so its re-render doesn't reset experience)
    const empHeading = this.page.getByRole('heading', { name: new RegExp(empType, 'i') }).first();
    await expect(empHeading).toBeVisible();
    await empHeading.evaluate((el) => {
      if (el.parentElement) {
        el.parentElement.click();
      } else {
        (el as HTMLElement).click();
      }
    });

    // Experience Minimum: fill AFTER employment type click to avoid re-render reset
    const minExp = this.page.locator('input[type="number"]').first();
    await expect(minExp).toBeVisible();
    await minExp.click({ clickCount: 3 }); 
    await minExp.type(minExpYears.toString());
    await minExp.blur();

    // Location
    const countryInput = this.page.getByPlaceholder(/e\.g\.\s+United\s+States/i).first();
    await countryInput.scrollIntoViewIfNeeded();
    await countryInput.click();
    await countryInput.fill('');
    await countryInput.pressSequentially('United States', { delay: 50 });
    
    // Wait for the dropdown suggestion text to appear and click it
    const countryOption = this.page.locator('div.cursor-pointer').filter({ hasText: /^United States$/ }).last();
    await expect(countryOption).toBeVisible({ timeout: 5000 });
    await countryOption.click();
    
    // Wait for cities to load from backend based on Country selection
    await this.page.waitForTimeout(3000);

    const cityInput = this.page.getByPlaceholder(/e\.g\.\s+California/i).first();
    await cityInput.scrollIntoViewIfNeeded();
    await cityInput.click();
    await cityInput.fill('');
    await cityInput.pressSequentially('New York', { delay: 50 });
    
    const cityOption = this.page.locator('div.cursor-pointer').filter({ hasText: /New York/ }).first();
    await expect(cityOption).toBeVisible({ timeout: 5000 });
    await cityOption.click();

    const langSelect = this.page.getByText('Select Language').first();
    if (await langSelect.isVisible()) {
      await langSelect.click({ force: true });
      await this.page.getByText('English', { exact: true }).first().click({ force: true });
    }
  }

  async proceedToStep2(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).first().click();
    const paymentDetailsHeading = this.page.getByRole('heading', { name: /Payment Details/i }).first();
    await paymentDetailsHeading.waitFor({ state: 'visible', timeout: 20000 });
  }

  async proceedToStep3(): Promise<void> {
    await expect(this.reviewButton).toBeVisible();
    await this.reviewButton.click();
    await expect(this.publishButton).toBeVisible({ timeout: 15000 });
  }

  async publishJob(): Promise<void> {
    await this.publishButton.click();
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
      ? { currency: 'USD', frequency: 'Hourly', amount: '5000', engagementModel: 'IC', contractLength: '6', startDate: 'auto' } as typeof options
      : options;
    const { currency, frequency, amount, engagementModel, contractLength, startDate, scopeOfWork, language, technicalRatio } = finalOptions;

    console.log('--- fillStep2Details options:', finalOptions);

    const paymentHeading = this.page.getByRole('heading', { name: /Payment Details/i }).first();
    await expect(paymentHeading).toBeVisible({ timeout: 10000 });
    // Wait for React to hydrate and attach event listeners
    await this.page.waitForTimeout(2000);

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

    // ── Step D: Payment frequency — after engagement model so IC re-render can't wipe it ──
    //           Filled before contractLength/startDate because it may trigger a scope-section re-render
    if (frequency) {
      await expect(async () => {
        const freqLabel = this.page.getByText('Payment frequency').first();
        await freqLabel.scrollIntoViewIfNeeded();
        const freqContainer = freqLabel.locator('..');
        await freqContainer.click({ force: true });
        await this.page.waitForTimeout(800);

        // Click the matching option
        let freqOption = this.page.getByText(frequency, { exact: true }).last();
        if (!await freqOption.isVisible().catch(() => false)) {
          freqOption = this.page.locator(`[id*="react-select"], [class*="option"], li`).filter({ hasText: frequency }).first();
        }
        await freqOption.waitFor({ state: 'visible', timeout: 5000 });
        await freqOption.click();
        await this.page.waitForTimeout(500);

        // Verify the dropdown now reflects the selected value
        const freqInput = this.page.locator('input[placeholder*="payment frequency"]').first();
        await expect(freqInput).toHaveValue(frequency, { timeout: 3000 });
      }).toPass({ timeout: 20000 });
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
      const startDateLabel = this.page.getByText('Contract Start Date').first();
      await startDateLabel.scrollIntoViewIfNeeded();

      const startDateContainer = this.page.locator('div[aria-label*="Contract Start Date"]').first();
      await startDateContainer.click({ force: true });
      await this.page.waitForTimeout(1000);

      // Click the first non-disabled calendar day button (future-proof — no hardcoded date)
      const firstEnabledDay = this.page.locator(
        'button[class*="rounded-lg"][class*="aspect-square"]:not([disabled]):not([class*="cursor-not-allowed"])'
      ).first();
      await firstEnabledDay.waitFor({ state: 'visible', timeout: 5000 });
      await firstEnabledDay.click();
      await this.page.waitForTimeout(500);
    }

    // Wait for all React state updates to finish settling before Review is clicked
    await this.page.waitForTimeout(1000);
  }
}
