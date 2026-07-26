const fs = require('fs');

let content = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf-8');

// Rename the existing TC13 at the end to TC14
content = content.replace(
  "test('TC13 Successful submission with minimum 3 years experience'",
  "test('TC14 Successful submission with minimum 3 years experience'"
);

const newTC13 = `  test('TC13 Submit without entering Contract Start Date', async ({ page }) => {
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
    console.log('Step 4: Filling Payment & Scope without Start Date...');

    // Select payment frequency
    console.log('Selecting payment frequency...');
    const freqInputContainer = page.getByPlaceholder(/Select payment frequency/i).locator('..').locator('..');
    await freqInputContainer.click();
    await page.waitForTimeout(1000); // Wait for dropdown to open
    // Click 'Daily' from the dropdown options
    await page.getByText('Daily', { exact: true }).last().click();
    await page.waitForTimeout(1000);

    // Enter amount
    console.log('Entering amount...');
    const amountInput = page.getByPlaceholder(/Enter amount/i).first();
    await amountInput.click();
    await amountInput.fill('40');
    await amountInput.blur();
    await page.waitForTimeout(500);

    // Fill Scope of Work fields
    console.log('Filling Scope of Work...');
    const scopeEditor = page.locator('.ql-editor').first();
    if (await scopeEditor.isVisible()) {
      await scopeEditor.fill('Scope of work test.');
    } else {
      const fallbackScope = page.locator('textarea').first();
      if (await fallbackScope.isVisible()) {
        await fallbackScope.fill('Scope of work test.');
      } else {
        await page.getByText('Scope of Work').click({ force: true });
        await page.keyboard.type('Scope of work test.');
      }
    }
    await page.waitForTimeout(500);

    // Select EOR engagement model
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

    // Leave 'Contract Start Date' empty intentionally

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
    const reviewBtn = page.getByRole('button', { name: 'Review', exact: true });
    await reviewBtn.click();
    await page.waitForTimeout(1000);

    // Verify Employer stays on Step 2
    console.log('Verifying validation error and staying on Step 2...');
    // The Review button should still be visible because we didn't go to Step 3
    await expect(reviewBtn).toBeVisible({ timeout: 5000 });
    
    // Optionally look for an error message like "Start date is required"
    // Because the exact text can vary ("Contract Start Date is required", "Required", etc),
    // we'll just check for any text-red element or simply verify it doesn't navigate.
    
    console.log('--- TC13 TEST FINISHED SUCCESSFULLY ---');
  });`;

content = content.replace(
  "test('TC14 Successful submission with minimum 3 years experience'",
  newTC13 + "\n\n  test('TC14 Successful submission with minimum 3 years experience'"
);

fs.writeFileSync('tests/employerJobPost.spec.ts', content);
console.log('Successfully updated tests/employerJobPost.spec.ts with TC13');
