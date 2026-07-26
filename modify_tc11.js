const fs = require('fs');

let content = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf-8');

// Rename existing TC11 to TC12
content = content.replace(
  "test('TC11 Successful submission with minimum 3 years experience'",
  "test('TC12 Successful submission with minimum 3 years experience'"
);

// Create the new TC11 content
const newTC11 = `  test('TC11 Submit without entering Amount', async ({ page }) => {
    test.setTimeout(90000);
    const employerPage = new AvuaEmployerPage(page);

    // Step 1: Logging in
    console.log('Step 1: Logging in...');
    await employerPage.login('pranjil+test@avua.com', 'Test@123');

    // Step 2: Navigate to Job Post Page
    console.log('Step 2: Navigating to job post page...');
    await employerPage.navigateToJobPostPage();

    // Step 3: Completing Step 1 (Describe the Role)
    console.log('Step 3: Completing Step 1 (Describe the Role)...');
    await employerPage.fillStep1Details('Test Job', 'Onsite', 'We are seeking a skilled Playwright Test Engineer.', true);
    // Click Continue to go to Step 2
    await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
    await page.waitForTimeout(3000);

    // Step 4: Verify Employer is on Step 2
    console.log('Step 4: Filling Payment & Scope without Amount...');

    // Select payment frequency
    console.log('Selecting payment frequency...');
    const freqInputContainer = page.getByPlaceholder(/Select payment frequency/i).locator('..').locator('..');
    await freqInputContainer.click();
    await page.waitForTimeout(1000); // Wait for dropdown to open
    // Click 'Hourly' from the dropdown options
    await page.getByText('Hourly', { exact: true }).last().click();
    await page.waitForTimeout(1000);

    // Skip entering amount

    // Fill Scope of Work fields
    console.log('Filling Scope of Work...');
    const scopeEditor = page.locator('.ql-editor').first();
    if (await scopeEditor.isVisible()) {
      await scopeEditor.fill('This is the scope of work without specifying an amount.');
    } else {
      const fallbackScope = page.locator('textarea').first();
      if (await fallbackScope.isVisible()) {
        await fallbackScope.fill('This is the scope of work without specifying an amount.');
      } else {
        await page.getByText('Scope of Work').click({ force: true });
        await page.keyboard.type('This is the scope of work without specifying an amount.');
      }
    }
    await page.waitForTimeout(500);

    // Select Employer of Record (EOR) just to fulfill the rest of required fields
    console.log('Selecting Employer of Record (EOR)...');
    const eorOption = page.getByText('Employer of Record (EOR)', { exact: false }).first();
    if (await eorOption.isVisible()) {
      await eorOption.click();
      await page.waitForTimeout(1000);
    }

    // Select contract length
    console.log('Selecting contract length...');
    const lengthInput = page.getByPlaceholder(/Enter Contract Length/i).first();
    if (await lengthInput.isVisible()) {
      await lengthInput.click({ force: true });
      await lengthInput.fill('6');
      await lengthInput.blur();
      await page.waitForTimeout(500);
    }

    // Select start date
    console.log('Selecting start date...');
    const startDateContainer = page.locator('div[aria-label="Contract Start Date "]').filter({ hasText: 'DD' }).first();
    await startDateContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    if (await startDateContainer.isVisible()) {
      await startDateContainer.click({ force: true });
      await page.waitForTimeout(500);
      const day15 = page.getByText('15', { exact: true }).last();
      if (await day15.isVisible()) {
        await day15.click({ force: true });
      } else {
        await page.mouse.click(500, 500);
      }
      await page.waitForTimeout(500);
    }

    // Configure AI interview language
    console.log('Configuring AI interview language...');
    const langSelect = page.getByText('Select Language').first();
    if (await langSelect.isVisible()) {
      await langSelect.click({ force: true });
      await page.waitForTimeout(500);
      await page.getByText('English', { exact: true }).first().click({ force: true });
      await page.waitForTimeout(500);
    }

    // CLICK REVIEW
    console.log('Clicking Review...');
    await page.getByRole('button', { name: 'Review', exact: true }).click();
    await page.waitForTimeout(1000);

    // Verify Employer moves to Step 3
    console.log('Verifying transition to Step 3...');
    const publishBtn = page.getByRole('button', { name: 'Publish', exact: true }).first();
    await expect(publishBtn).toBeVisible({ timeout: 15000 });

    console.log('--- TC11 TEST FINISHED SUCCESSFULLY ---');
  });`;

// Insert TC11 right before TC12
content = content.replace(
  "test('TC12 Successful submission with minimum 3 years experience'",
  newTC11 + "\n\n  test('TC12 Successful submission with minimum 3 years experience'"
);

fs.writeFileSync('tests/employerJobPost.spec.ts', content);
console.log('Successfully updated tests/employerJobPost.spec.ts with TC11');
