const fs = require('fs');

let content = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf-8');

// Rename existing TC10 to TC11
content = content.replace(
  "test('TC10 Successful submission with minimum 3 years experience'",
  "test('TC11 Successful submission with minimum 3 years experience'"
);

// Create the new TC10 content
const newTC10 = `  test('TC10 Submit without selecting Payment Frequency', async ({ page }) => {
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
    console.log('Step 4: Filling Payment & Scope without Payment Frequency...');

    // Skip Payment frequency selection

    // Enter a valid amount
    console.log('Entering amount...');
    const amountInput = page.getByPlaceholder(/Enter amount/i).first();
    await amountInput.click();
    await amountInput.fill('500');
    await amountInput.blur();
    await page.waitForTimeout(500);

    // Fill Scope of Work fields
    console.log('Filling Scope of Work...');
    const scopeEditor = page.locator('.ql-editor').first();
    if (await scopeEditor.isVisible()) {
      await scopeEditor.fill('This is the scope of work without payment frequency.');
    } else {
      const fallbackScope = page.locator('textarea').first();
      if (await fallbackScope.isVisible()) {
        await fallbackScope.fill('This is the scope of work without payment frequency.');
      } else {
        await page.getByText('Scope of Work').click({ force: true });
        await page.keyboard.type('This is the scope of work without payment frequency.');
      }
    }
    await page.waitForTimeout(500);

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

    // Verify Employer stays on Step 2
    console.log('Verifying Employer stays on step 2...');
    const reviewBtn = page.getByRole('button', { name: 'Review', exact: true });
    await expect(reviewBtn).toBeVisible();

    // Look for validation errors
    const errors = await page.locator('.text-red-500, .text-red, .error').allTextContents();
    if (errors.length > 0) {
      console.log('VALIDATION ERRORS FOUND:', errors);
    }

    console.log('--- TC10 TEST FINISHED SUCCESSFULLY ---');
  });`;

// Insert TC10 right before TC11
content = content.replace(
  "test('TC11 Successful submission with minimum 3 years experience'",
  newTC10 + "\n\n  test('TC11 Successful submission with minimum 3 years experience'"
);

fs.writeFileSync('tests/employerJobPost.spec.ts', content);
console.log('Successfully updated tests/employerJobPost.spec.ts with TC10');
