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
  async fillStep2Details(currency: string = 'USD', freq: string = 'Hourly', amount: string = '5000'): Promise<void> {
    // Wait for step 2 to be visible
    const paymentHeading = this.page.getByRole('heading', { name: /Payment Details/i }).first();
    await expect(paymentHeading).toBeVisible({ timeout: 10000 });

    // Currency
    const currencyInput = this.page.getByText('Currency').locator('..').locator('input').first();
    if (await currencyInput.isVisible().catch(() => false)) {
      const val = await currencyInput.inputValue();
      if (!val.includes(currency)) {
        await currencyInput.click();
        await this.page.locator('div').filter({ hasText: new RegExp(`^${currency}$`) }).first().click();
        await this.page.waitForTimeout(300);
      }
    }

    // Payment Frequency
    const freqInputContainer = this.page.getByPlaceholder(/Select payment frequency/i).locator('..').locator('..').first();
    await freqInputContainer.scrollIntoViewIfNeeded();
    await freqInputContainer.click({ force: true });
    await this.page.waitForTimeout(1000);
    const freqOption = this.page.getByText(freq, { exact: true }).last();
    await expect(freqOption).toBeVisible({ timeout: 5000 });
    await freqOption.click({ force: true });
    await this.page.waitForTimeout(300);

    // Amount
    const amountInput = this.page.getByPlaceholder(/Enter Amount/i).first();
    if (await amountInput.isVisible()) {
      await amountInput.fill(amount);
    }
    await this.page.waitForTimeout(500);

    // Contractor engagement model (IC)
    const icCard = this.page.getByText('Independent contractor (IC)').first();
    await icCard.scrollIntoViewIfNeeded();
    await icCard.click();

    // Contract Length
    const lengthInput = this.page.getByPlaceholder(/Enter Contract Length/i).first();
    if (await lengthInput.isVisible()) {
      await lengthInput.fill('6');
    }

    // Contract Start Date (e.g. 15 / 08 / 2026)
    const dateBtn = this.page.getByRole('button', { name: /Contract Start Date/i }).first();
    if (await dateBtn.isVisible()) {
      await dateBtn.scrollIntoViewIfNeeded();
      await dateBtn.click();
      await this.page.waitForTimeout(500);
      // Just click any day, like 25
      const day25 = this.page.getByText('25', { exact: true }).last();
      await day25.click();
    }
    await this.page.waitForTimeout(500);
  }
}
