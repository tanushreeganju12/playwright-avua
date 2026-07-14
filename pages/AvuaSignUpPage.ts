import { expect, Locator, Page } from '@playwright/test';

export class AvuaSignUpPage {
  readonly page: Page;

  // Using role+name because this is the most stable and accessible CTA locator on the home page.
  readonly exploreJobOpportunitiesLink: Locator;
  // Using role+name because the sign-up entry action is expected to be surfaced as a button-like CTA.
  readonly signUpButton: Locator;
  // Using role+name first to target the visible upload action users click before file selection.
  readonly uploadResumeButton: Locator;
  // Using CSS file-input locator because resume upload commonly uses a hidden native input.
  readonly resumeFileInput: Locator;
  // Using label-based locator because this field is expected to be explicitly labeled after AI prefill.
  readonly jobTitleInput: Locator;
  // Using label-based locator because email is a standard, accessible form field.
  readonly emailInput: Locator;
  // Using label-based combobox locator because nationality is usually implemented as a custom dropdown.
  readonly nationalityDropdown: Locator;
  // Using role+name because this is the primary submit action for account creation.
  readonly createMyAccountButton: Locator;
  // Using text-based locator because confirmation is rendered as a status message containing dynamic email.
  readonly signInLinkSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.exploreJobOpportunitiesLink = page.getByRole('link', {
      name: /Explore Job Opportunities/i,
    });
    this.signUpButton = page.getByRole('button', { name: /Sign Up/i });
    this.uploadResumeButton = page.getByRole('button', { name: /Upload Resume/i });
    this.resumeFileInput = page.locator('input[type="file"]');
    this.jobTitleInput = page
      .getByLabel(/Job Title\*?|Current Job Title|Role/i)
      .or(page.getByRole('textbox', { name: /Job Title\*?/i }))
      .or(page.getByPlaceholder(/Job Title|Current Job Title|Role/i))
      .first();
    this.emailInput = page
      .getByLabel(/Email Address\*?|Email\*?/i)
      .or(page.getByRole('textbox', { name: /Email Address\*?/i }))
      .or(page.getByPlaceholder(/Email|Email Address/i))
      .first();
    this.nationalityDropdown = page
      .getByLabel(/Nationality\*?/i)
      .or(page.getByRole('combobox', { name: /Nationality/i }))
      .or(page.getByPlaceholder(/Search nationality/i))
      .or(page.getByRole('textbox', { name: /Search nationality/i }))
      .first();
    this.createMyAccountButton = page
      .getByRole('button', { name: /Create My Account|Create Account|Proceed to Dashboard/i })
      .or(page.getByText(/Create my account|Create My Account|Create Account|Proceed to Dashboard/i))
      .first();
    this.signInLinkSuccessMessage = page
      .getByRole('heading', {
        name: /we(?:['’]| ha)?ve sent a secur(?:e|ed)\s+sign[\-‑–—]?in link to/i,
      })
      .or(
        page.getByText(/we(?:['’]| ha)?ve sent a secur(?:e|ed)\s+sign[\-‑–—]?in link to/i, {
          exact: false,
        }),
      )
      .first();
  }

  async gotoHomePage(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async goToApplicantSignUpPage(): Promise<void> {
    await this.gotoHomePage();

    // Keep scenario intent (home -> explore), but fallback to direct route if responsive nav hides CTA.
    if (await this.exploreJobOpportunitiesLink.first().isVisible()) {
      await this.exploreJobOpportunitiesLink.first().click();
    } else {
      await this.page.goto('/applicant', { waitUntil: 'domcontentloaded' });
    }

    if (await this.signUpButton.first().isVisible()) {
      await this.signUpButton.first().click();
    } else {
      await this.page.goto('/signup', { waitUntil: 'domcontentloaded' });
    }

    await expect(this.page).toHaveURL(/\/signup/i);
  }

  async uploadResume(filePath: string): Promise<void> {
    if (await this.uploadResumeButton.first().isVisible()) {
      await this.uploadResumeButton.first().click();
    }
    await this.resumeFileInput.first().setInputFiles(filePath);
  }

  async waitForAiPrefill(): Promise<void> {
    // Step 1: Wait for both loading states to disappear before asserting the form is ready.
    // The app shows two sequential loaders after upload:
    //   (a) "Processing Your Document..." — server-side parse
    //   (b) "Analyzing your resume and pre-filling details…" — AI prefill
    // Racing directly against createMyAccountButton causes a 45 s timeout when AI is slow.
    await this.page
      .getByText(/Analyzing your resume/i)
      .waitFor({ state: 'hidden', timeout: 90000 })
      .catch(() => {
        // Loader may never appear (e.g. instant response) — not a failure.
      });

    // Step 2: Now assert the fully-rendered form and submit CTA are present.
    await expect(this.createMyAccountButton).toBeVisible({ timeout: 30000 });
    await expect(this.jobTitleInput).toBeVisible({ timeout: 30000 });
    await expect(this.jobTitleInput).toBeEnabled({ timeout: 30000 });

    // Step 3: Confirm AI actually prefilled at least one core field.
    await expect
      .poll(
        async () => {
          const jobTitleLen = (await this.jobTitleInput.inputValue().catch(() => '')).trim().length;
          const emailLen = (await this.emailInput.inputValue().catch(() => '')).trim().length;
          return Math.max(jobTitleLen, emailLen);
        },
        {
          timeout: 15000,
          message: 'Expected at least one key field (Job Title or Email) to be prefilled by AI resume analysis.',
        },
      )
      .toBeGreaterThan(0);
  }

  async fillJobTitle(jobTitle: string): Promise<void> {
    await this.jobTitleInput.fill(jobTitle);
  }

  async selectNationality(nationality: string): Promise<void> {
    try {
      const natPlaceholder = this.page.getByPlaceholder(/Search nationality/i).first();
      // Increase timeout because this component might fetch data and render late
      await natPlaceholder.click({ force: true, timeout: 15000 });
      
      // Type the nationality using keyboard which sends events to the active element
      await this.page.keyboard.type(nationality, { delay: 150 });
      await this.page.waitForTimeout(1000);
      
      // Use keyboard to select the first highlighted item
      await this.page.keyboard.press('ArrowDown');
      await this.page.waitForTimeout(200);
      await this.page.keyboard.press('Enter');
      
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log('Nationality fill failed or not visible, skipping.', error);
    }
  }

  async fillCurrentLocation(location: string): Promise<void> {
    const locInput = this.page.getByLabel(/Current Location\*?/i).or(this.page.getByPlaceholder(/Search location/i)).first();
    try {
      await locInput.waitFor({ state: 'visible', timeout: 5000 });
      await locInput.click();
      await locInput.clear();
      
      // Type the location slowly to trigger the custom dropdown
      await locInput.pressSequentially(location, { delay: 150 });
      
      // Wait for the custom dropdown item to appear
      const option = this.page.getByText(location, { exact: false }).last();
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
      
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log('Location fill failed, trying fallback.', error);
      await locInput.fill(location);
    }
  }

  async fillCurrentCompany(company: string): Promise<void> {
    const companyInput = this.page.getByLabel(/Current Company\*?/i).or(this.page.getByPlaceholder(/Etizas|Company/i)).first();
    await companyInput.fill(company);
  }

  async fillPhoneNumber(phone: string): Promise<void> {
    const phoneInput = this.page.getByLabel(/Phone Number\*?/i).or(this.page.getByPlaceholder(/Enter phone number/i)).first();
    try {
      await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
      await phoneInput.fill(phone);
    } catch {
      console.log('Phone Number not visible, skipping.');
    }
  }

  async updateEmail(email: string): Promise<void> {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  async submitCreateAccount(): Promise<void> {
    const successMessage = this.signInLinkSuccessMessage.first();
    const createAccountButton = this.createMyAccountButton.first();

    // The UI may already be on success screen by the time this step executes.
    await expect
      .poll(
        async () => {
          if (await successMessage.isVisible().catch(() => false)) {
            return 'success';
          }
          if (await createAccountButton.isVisible().catch(() => false)) {
            return 'submit';
          }
          return 'none';
        },
        {
          timeout: 20000,
          message: 'Expected either success card or Create Account button to be visible.',
        },
      )
      .toMatch(/success|submit/);

    if (await successMessage.isVisible().catch(() => false)) {
      return;
    }

    await createAccountButton.scrollIntoViewIfNeeded();

    // Check the terms and conditions checkbox explicitly to ensure React registers it
    try {
      const termsCheckbox = this.page.getByRole('checkbox', { name: /Terms & Conditions/i }).or(this.page.locator('input[type="checkbox"]')).first();
      // Only click it if it's not already checked, wait, no, the visual state might not match React state.
      // Let's force check it.
      await termsCheckbox.check({ force: true });
    } catch (error) {
      console.log('Could not check terms checkbox explicitly:', error);
    }

    await this.page.waitForTimeout(2000); // Wait for React state/validations to settle
    await expect(createAccountButton).toBeEnabled({ timeout: 20000 });
    await createAccountButton.click();
  }

  async assertSuccessMessage(email: string): Promise<void> {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    await expect(this.signInLinkSuccessMessage).toBeVisible({ timeout: 10000 });
    await expect(
      this.page.getByText(
        new RegExp(
          `we(?:['’]| ha)?ve sent a secur(?:e|ed)\\s+sign[\\-‑–—]?in link to\\s*${escapedEmail}`,
          'i',
        ),
      ),
    ).toBeVisible({ timeout: 10000 });
  }
}
