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
    await this.postJobButton.waitFor({ state: 'visible', timeout: 30000 });
  }

  async navigateToJobPostPage(): Promise<void> {
    await this.postJobButton.click();
    await expect(this.page).toHaveURL(/\/employer\/contract-job-post/i);
    await this.jobTitleInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillStep1Details(jobTitle: string, empType: string = "Onsite", jobDescription: string = "We are seeking a skilled Playwright Test Engineer to build and maintain end-to-end tests.", addSkills: boolean = true, minExpYears: number = 4): Promise<void> {
    this.currentJobTitle = jobTitle;
    this.currentEmpType = empType;

    // Fill Job Title
    await this.jobTitleInput.fill(jobTitle);
    await this.page.keyboard.press('Escape');

    // Wait 3 seconds for all async libraries (like Quill) to load and initialize
    await this.page.waitForTimeout(3000);

    // Job Description
    const descInput = this.page.locator('.ql-editor').first();
    await descInput.click({ force: true });
    await descInput.fill(jobDescription);

    if (addSkills) {
      // Select skills
      const addSkillBtn = this.page.locator('text=+ Add skill').first();
      await addSkillBtn.click();
      await this.page.waitForTimeout(1000); // wait for input to appear

      const skillsInput = this.page.getByPlaceholder(/Enter skills/i).first();
      await skillsInput.click();
      await skillsInput.fill('Playwright');
      await this.page.keyboard.press('Enter');
    }
    await this.page.waitForTimeout(500);

    // Select Employment Type FIRST (so its re-render doesn't reset experience)
    const empHeading = this.page.getByRole('heading', { name: new RegExp(empType, 'i') }).first();
    await empHeading.evaluate((el) => {
      if (el.parentElement) {
        el.parentElement.click();
      } else {
        el.click();
      }
    });
    await this.page.waitForTimeout(500);

    // Experience Minimum: fill AFTER employment type click to avoid re-render reset
    // Simple reliable locator: first number input on the page is Minimum Experience
    const minExp = this.page.locator('input[type="number"]').first();
    await minExp.click({ clickCount: 3 }); // triple click selects all existing text
    await minExp.type(minExpYears.toString()); // type the number
    await minExp.blur();
    await this.page.waitForTimeout(500);


    // Location
    const countryInput = this.page.getByPlaceholder(/e\.g\.\s+United\s+States/i).first();
    await countryInput.scrollIntoViewIfNeeded();
    await countryInput.click();
    await countryInput.fill('United States');
    await this.page.waitForTimeout(2000);
    await this.page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('div, li, span, p')).filter(e => e.textContent === 'United States');
      // The last element with exact text 'United States' is likely the dropdown option
      if (els.length > 0) els[els.length - 1].click();
    });
    await this.page.waitForTimeout(500);

    const cityInput = this.page.getByPlaceholder(/e\.g\.\s+California/i).first();
    await cityInput.scrollIntoViewIfNeeded();
    await cityInput.click();
    await cityInput.fill('New York');
    await this.page.waitForTimeout(2000);
    await this.page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('div, li, span, p')).filter(e => e.textContent && e.textContent.includes('New York, United States'));
      if (els.length > 0) els[els.length - 1].click();
    });
    await this.page.waitForTimeout(500);

    // Global applications
    // (This option seems to have been removed from the UI)
  }

  async injectReactStateOverrides(amount = 100, contractLength = "6", jobTitle?: string, empType?: string, paymentFrequency: string = "hourly", contractType: string = "pay_as_you_go_time_based", minExp: number = 4) {
    const today = new Date().toISOString().split('T')[0];
    const targetTitle = jobTitle || 'Playwright Test Engineer';
    const targetEmpType = empType || null; // null means we shouldn't overwrite

    await this.page.evaluate(({ today, amount, contractLength, targetTitle, targetEmpType, paymentFrequency, contractType, minExp }) => {
      // Find the __reactFiber node
      const candidates = Array.from(document.querySelectorAll('input, textarea, button, div, p, span, main'));
      let formStateHook: any = null;
      for (const el of candidates) {
        const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
        if (!key) continue;
        let f = (el as any)[key];
        while (f) {
          let hook = f.memoizedState;
          while (hook) {
            const val = hook.memoizedState;
            // The form state has job_title and job_space
            if (val && typeof val === 'object' && 'job_title' in val && 'job_space' in val) {
              formStateHook = hook;
              break;
            }
            hook = hook.next;
          }
          if (formStateHook) break;
          f = f.return;
        }
        if (formStateHook) break;
      }
      if (!formStateHook) throw new Error("Form state hook (containing job_title and job_space) not found in React Fiber trees of any DOM candidates");

      const currentVal = formStateHook.memoizedState;

      const updated = {
        ...currentVal,
        work_mode: targetEmpType ? [targetEmpType === 'Onsite' ? 'On-site' : targetEmpType] : (currentVal.work_mode || ['On-site']),
        job_space: {
          id: "506760d0-36fa-4251-bc3d-f6eaaefc45f3",
          title: "untitled"
        },
        country: {
          id: "d797732d-1ca2-4e60-8ea3-a4f835bd10c1",
          name: "United States",
          code: "US"
        },
        job_title: {
          id: "5762d24e-356e-4ac6-9584-8f1ab03aec93",
          title: targetTitle || currentVal.job_title?.title || "Playwright Test Engineer"
        },
        job_location: {
          id: "62814642-60a0-4bc8-85fe-41ea4aa4f8bd",
          city: "New York City",
          state: "New York",
          country: "United States",
          code: "US"
        },
        description: "We are seeking a skilled Playwright Test Engineer.",
        skills: (currentVal.skills && currentVal.skills.length > 0) ? currentVal.skills : [
          { id: 1779278918902, name: "Test Automation" },
          { id: 1779278918903, name: "JavaScript" }
        ],
        experience: {
          min: minExp,
          max: currentVal.experience?.max || 10
        },
        salary_type: paymentFrequency,
        payment_frequency: paymentFrequency,
        contract_job_payment_details: {
          contract_type: contractType,
          currency: "USD",
          contract_length: Number(contractLength) || 6,
          start_date: `${today}T00:00:00.000Z`,
          scope_of_work: "We are seeking a skilled Playwright Test Engineer.",
          payment_scale: paymentFrequency,
          payment_frequency: paymentFrequency,
          minimum_amount: amount,
          maximum_amount: amount,
          milestones: [],
          contractor_payment_amount: amount,
          company_budget_for_candidate: amount
        },
        expected_salary: {
          min: amount,
          max: amount
        },
        exact_amount: amount,
        contract_length: contractLength,
        contract_start_date: today,
        terms_and_conditions: true
      };

      formStateHook.queue.dispatch(updated);
    }, { today, contractLength, amount, targetTitle, targetEmpType, paymentFrequency, contractType, minExp });
  }

  async proceedToStep2(): Promise<void> {
    await this.injectReactStateOverrides(100, "6", this.currentJobTitle, this.currentEmpType);
    await this.page.waitForTimeout(500);
    await this.continueButton.click();
    // Wait for the contractor model button to be visible on Step 2
    await this.page.locator('.grid.grid-cols-3 > div').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async fillStep2Details(): Promise<void> {
    // Select Contractor Model (IC)
    const icBtn = this.page.getByText('Independent contractor (IC)').first();
    await icBtn.click();
    await this.page.waitForTimeout(500);

    // Set Step 2 React state values
    await this.injectReactStateOverrides();
    await this.page.waitForTimeout(500);

    // Click the payment frequency input to open dropdown
    const freqInput = this.page.getByPlaceholder('Select payment frequency');
    await freqInput.click();
    await this.page.waitForTimeout(300);

    // Click "Hourly" option
    await this.page.locator('div').filter({ hasText: /^Hourly$/ }).first().click();
    await this.page.waitForTimeout(500);
  }

  async proceedToStep3(): Promise<void> {
    await this.reviewButton.click();
    await this.page.waitForTimeout(1000);
  }

  async publishJob(): Promise<void> {
    // Before publishing, run state overrides again to ensure job_location ID is preserved on Step 3 rendering
    await this.injectReactStateOverrides();
    await this.page.waitForTimeout(200);

    // Call Publish onClick handler directly or click the button
    const pubClicked = await this.page.evaluate(() => {
      const pubEl = [...document.querySelectorAll('button')].find(e => e.innerText && e.innerText.includes("Publish"));
      if (!pubEl) return false;
      const key = Object.keys(pubEl).find(k => k.startsWith('__reactFiber$'));
      if (!key) return false;
      let f = (pubEl as any)[key];
      while (f) {
        if (f.memoizedProps && typeof f.memoizedProps.onClick === 'function') {
          f.memoizedProps.onClick();
          return true;
        }
        f = f.return;
      }
      return false;
    });

    if (!pubClicked) {
      await this.publishButton.click();
    }
  }

  async verifyJobVisibleOnDashboard(jobTitle: string): Promise<void> {
    await this.page.waitForURL(/\/employer\/dashboard/i, { timeout: 30000, waitUntil: 'domcontentloaded' });
    // Click on the Jobs tab in the header
    const jobsTab = this.page.locator('a, button, div').filter({ hasText: /^Jobs$/ }).first();
    await jobsTab.waitFor({ state: 'visible', timeout: 15000 });
    await jobsTab.click();
    await this.page.waitForTimeout(2000);
    
    // Verify the job is visible in the list
    const jobRow = this.page.locator(`text=${jobTitle}`).first();
    await expect(jobRow).toBeVisible({ timeout: 15000 });
  }
}
