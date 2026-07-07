import { test, expect } from '@playwright/test';

test.describe('C1 - Required Field Validation', () => {


  test('TC20 - Error message is shown when First Name is left blank', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Leave First Name blank (intentionally not filled)

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to the very top of the page so First Name field is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains First Name label + field + error message
    // xpath ../.. goes: textbox → label+field div → outer wrapper div (includes error paragraph)
    const firstNameWrapper = page.getByRole('textbox', { name: 'Enter your first name' }).locator('xpath=../..');
    const clippedScreenshot = await firstNameWrapper.screenshot();
    await test.info().attach('First Name Required Error', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Error message 'First name is required' is visible below the First Name field
    const firstNameError = page.getByText('First name is required');
    await expect(firstNameError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);


  });


  test('TC21 - Error message is shown when Email is left blank', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Leave Email blank (intentionally not filled)

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to the very top of the page so Email field is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains Email label + field + error message
    const emailWrapper = page.getByRole('textbox', { name: 'Enter your email' }).locator('xpath=../..');
    const clippedScreenshot = await emailWrapper.screenshot();
    await test.info().attach('Email Required Error', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Error message 'Email is required' is visible below the Email field
    const emailError = page.getByText('Email is required');
    await expect(emailError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);

  });


  test('TC22 - Error message is shown when Mobile Number is left blank', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Leave Mobile Number blank (intentionally not filled)

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to the very top of the page so Mobile Number field is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains Mobile Number field + error message
    // Mobile Number is inside a custom phone input, so go up 3 levels to capture the full area
    const mobileWrapper = page.getByRole('textbox', { name: 'Mobile Number' }).locator('xpath=../../..');
    const clippedScreenshot = await mobileWrapper.screenshot();
    await test.info().attach('Mobile Number Required Error', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Error message 'Phone number is required' is visible below the Mobile Number field
    const mobileError = page.getByText('Phone number is required');
    await expect(mobileError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);


  });


  test('TC23 - Validation error is shown when Designation is left blank', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Leave Designation blank (intentionally not filled)

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to the very top of the page so Designation field is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains Designation label + field + error message
    const designationWrapper = page.getByRole('textbox', { name: 'Select your designation' }).locator('xpath=../..');
    const clippedScreenshot = await designationWrapper.screenshot();
    await test.info().attach('Designation Required Error', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Validation error is visible for the Designation field
    const designationError = page.getByText('Designation is required');
    await expect(designationError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);


  });


  test('TC24 - Error message is shown when Message is left blank', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Leave Message blank (intentionally not filled)

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll down so the Message field is visible in the viewport
    await page.getByRole('textbox', { name: 'Message*' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains Message label + field + error message
    const messageWrapper = page.getByRole('textbox', { name: 'Message*' }).locator('xpath=..');
    const clippedScreenshot = await messageWrapper.screenshot();
    await test.info().attach('Message Required Error', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Error message 'Message is required' is visible for the Message field
    const messageError = page.getByText('Message is required');
    await expect(messageError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);


  });

  /**
   * TC25 - All required fields blank validation
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Do not fill any fields
   *   3. Click 'Talk to avua'
   *
   * Expected Result:
   *   - All required field error messages are shown simultaneously:
   *     'First name is required', 'Email is required', 'Phone number is required',
   *     'Designation is required', 'Message is required'
   *   - Last Name has no error (it is optional)
   *   - Form is not submitted (URL stays on /contact-us)
   */
  test('TC25 - All required field errors shown when no fields are filled', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Do not fill any fields

    // Step 3: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to top so form errors are visible from the beginning
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Take a full-page screenshot to capture all errors at once
    const fullPageScreenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('All Required Field Errors', { body: fullPageScreenshot, contentType: 'image/png' });

    // Assertion: All 5 required field errors are visible simultaneously
    await expect(page.getByText('First name is required')).toBeHidden(); // INTENTIONAL FAILURE FOR JIRA
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Designation is required')).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();

    // Assertion: Last Name has NO error (it is optional)
    await expect(page.getByText('Last name is required')).not.toBeVisible();

    // Assertion: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);
  });

  /**
   * TC26 - Invalid email format validation
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Enter 'userdomain.com' (missing @) in the Email field
   *   3. Fill all other required fields with valid data
   *   4. Click 'Talk to avua'
   *
   * Expected Result:
   *   - Invalid email format error 'Please enter a valid email' is displayed
   *   - Form is not submitted (URL stays on /contact-us)
   */
  test('TC26 - Invalid email format error is shown for email missing @', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Enter invalid email (missing @) in the Email field
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('userdomain.com');

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to top so the Email field error is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains Email label + field + error message
    const emailWrapper = page.getByRole('textbox', { name: 'Enter your email' }).locator('xpath=../..');
    const clippedScreenshot = await emailWrapper.screenshot();
    await test.info().attach('Invalid Email Format Error', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Invalid email format error is visible
    const emailFormatError = page.getByText('Please enter a valid email');
    await expect(emailFormatError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);
  });

  /**
   * TC27 - Invalid email format validation (missing domain)
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Enter 'user@' (missing domain) in the Email field
   *   3. Fill all other required fields with valid data
   *   4. Click 'Talk to avua'
   *
   * Expected Result:
   *   - Invalid email format error 'Please enter a valid email' is displayed
   *   - Form is not submitted (URL stays on /contact-us)
   */
  test('TC27 - Invalid email format error is shown for email missing domain (user@)', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Enter invalid email (missing domain) in the Email field
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('user@');

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Scroll to top so the Email field error is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Screenshot the parent wrapper that contains Email label + field + error message
    const emailWrapper = page.getByRole('textbox', { name: 'Enter your email' }).locator('xpath=../..');
    const clippedScreenshot = await emailWrapper.screenshot();
    await test.info().attach('Invalid Email Format Error (user@)', { body: clippedScreenshot, contentType: 'image/png' });

    // Assertion 1: Invalid email format error is visible
    const emailFormatError = page.getByText('Please enter a valid email');
    await expect(emailFormatError).toBeVisible();

    // Assertion 2: Form is not submitted — URL remains on /contact-us
    await expect(page).toHaveURL(/.*contact-us.*/);
  });

  /**
   * TC28 - Valid email format — no email error shown
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Enter a valid email 'user@company.com' in the Email field
   *   3. Fill all other required fields with valid data
   *   4. Click 'Talk to avua'
   *
   * Expected Result:
   *   - No email format error is displayed
   *   - Form proceeds to submission (no email validation error blocks it)
   */
  test('TC28 - No email error shown when valid email is entered', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Enter a valid email
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('user@company.com');

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Screenshot BEFORE submission — showing form filled with valid data
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const beforeScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('1 - Form Filled Before Submission', { body: beforeScreenshot, contentType: 'image/png' });

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Screenshot at 1s — may catch green tick / loading state
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const ss1 = await page.screenshot({ fullPage: false });
    await test.info().attach('2 - After Submit (1s)', { body: ss1, contentType: 'image/png' });

    // Screenshot at 3s — may catch success message
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const ss2 = await page.screenshot({ fullPage: false });
    await test.info().attach('3 - After Submit (3s)', { body: ss2, contentType: 'image/png' });

    // Screenshot at 8s — form should be fully reset by now
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const submissionScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('4 - Form Submitted (Fields Cleared)', { body: submissionScreenshot, contentType: 'image/png' });

    // Assertion 1: No invalid email format error is displayed
    await expect(page.getByText('Please enter a valid email')).not.toBeVisible();

    // Assertion 2: No "email required" error is displayed
    await expect(page.getByText('Email is required')).not.toBeVisible();

    // Assertion 3: Form fields are cleared — confirms submission was processed successfully
    // (The site clears all fields on successful submission with no visible success message)
    await expect(page.getByRole('textbox', { name: 'Enter your first name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Enter your email' })).toHaveValue('');
  });

  /**
   * TC29 - Valid phone number — no phone error shown
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Enter '9876543210' in the Mobile Number field
   *   3. Fill all other required fields with valid data
   *   4. Click 'Talk to avua'
   *
   * Expected Result:
   *   - No phone error is displayed
   *   - Form proceeds to submission (fields cleared after successful submit)
   */
  test('TC29 - No phone error shown when valid mobile number is entered', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Enter a valid mobile number
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('user@company.com');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Screenshot BEFORE submission — showing form filled with valid data
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const beforeScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('1 - Form Filled Before Submission', { body: beforeScreenshot, contentType: 'image/png' });

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Screenshot at 300ms — catches the brief green tick/success state before form resets
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    const greenTickScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('2 - Form Submission Success State', { body: greenTickScreenshot, contentType: 'image/png' });

    // Wait for form to fully reset
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Take screenshot showing blank form = successful submission
    const submissionScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('3 - Form Submitted (Fields Cleared)', { body: submissionScreenshot, contentType: 'image/png' });

    // Assertion 1: No phone number error is displayed
    await expect(page.getByText('Phone number is required')).not.toBeVisible();

    // Assertion 2: No invalid phone format error is displayed
    await expect(page.getByText('Please enter a valid phone number')).not.toBeVisible();

    // Assertion 3: Form fields are cleared — confirms submission was processed successfully
    await expect(page.getByRole('textbox', { name: 'Enter your first name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Enter your email' })).toHaveValue('');
  });

  /**
   * TC30 - Valid message filled — form submits successfully
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Fill the 'What can we help with?' textarea with valid text
   *   3. Fill all other required fields with valid data
   *   4. Click 'Talk to avua'
   *
   * Expected Result:
   *   - Form submits successfully
   *   - No errors are shown
   *   - Fields are cleared after submission
   */
  test('TC30 - Form submits successfully when Message textarea is filled', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Fill the 'What can we help with?' textarea with valid text
    await page.getByRole('textbox', { name: 'Message*' }).fill('We are looking to hire 10 software engineers for our new product team.');

    // Step 3: Fill all other required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your last name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('user@company.com');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');

    // Screenshot BEFORE submission — showing form filled with valid data
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const beforeScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('1 - Form Filled Before Submission', { body: beforeScreenshot, contentType: 'image/png' });

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Screenshot at 300ms — catches the brief green tick/success state before form resets
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    const greenTickScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('2 - Form Submission Success State', { body: greenTickScreenshot, contentType: 'image/png' });

    // Wait for form to fully reset
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Take screenshot showing blank form = successful submission
    const submissionScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('3 - Form Submitted (Fields Cleared)', { body: submissionScreenshot, contentType: 'image/png' });

    // Assertion 1: No message error is shown
    await expect(page.getByText('Message is required')).not.toBeVisible();

    // Assertion 2: No other field errors are shown
    await expect(page.getByText('First name is required')).not.toBeVisible();
    await expect(page.getByText('Email is required')).not.toBeVisible();
    await expect(page.getByText('Phone number is required')).not.toBeVisible();

    // Assertion 3: Form fields cleared — confirms successful submission
    await expect(page.getByRole('textbox', { name: 'Enter your first name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Enter your email' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Message*' })).toHaveValue('');
  });

  /**
   * TC31 - Optional Last Name field — form submits without it
   *
   * Pre-conditions:
   *   - Website is accessible
   *   - Avua contact page is open at demo.avua.online/contact-us
   *
   * Steps:
   *   1. Open demo.avua.online/contact-us
   *   2. Leave the Last Name field blank
   *   3. Fill all required fields with valid data
   *   4. Click 'Talk to avua'
   *
   * Expected Result:
   *   - Form submits successfully
   *   - No Last Name error is shown (Last Name is optional)
   *   - Fields are cleared after submission
   */
  test('TC31 - Form submits successfully when Last Name is left blank (optional field)', async ({ page }) => {
    test.setTimeout(120000);

    // Step 1: Navigate to the Contact Us page
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*contact-us.*/);

    // Dismiss cookie banner if present
    const acceptBtn = page.getByRole('button', { name: 'Accept' });
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }

    // Step 2: Leave Last Name blank (it is optional — intentionally not filled)

    // Step 3: Fill all required fields with valid data
    await page.getByRole('textbox', { name: 'Enter your first name' }).fill('TestUser');
    await page.getByRole('textbox', { name: 'Enter your email' }).fill('user@company.com');
    await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9876543210');
    await page.getByRole('textbox', { name: 'Select your designation' }).fill('QA Engineer');
    await page.getByRole('textbox', { name: 'Message*' }).fill('This is a test message for validation.');

    // Screenshot BEFORE submission — showing Last Name is blank, all required fields filled
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const beforeScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('1 - Form Filled (Last Name Blank)', { body: beforeScreenshot, contentType: 'image/png' });

    // Step 4: Click 'Talk to avua'
    await page.getByRole('button', { name: 'Talk to avua' }).click();

    // Screenshot at 1s — may catch green tick / loading state
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const ss1 = await page.screenshot({ fullPage: false });
    await test.info().attach('2 - After Submit (1s)', { body: ss1, contentType: 'image/png' });

    // Screenshot at 3s — may catch success message
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const ss2 = await page.screenshot({ fullPage: false });
    await test.info().attach('3 - After Submit (3s)', { body: ss2, contentType: 'image/png' });

    // Screenshot at 8s — form should be fully reset by now
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const submissionScreenshot = await page.screenshot({ fullPage: false });
    await test.info().attach('4 - Form Submitted (Fields Cleared)', { body: submissionScreenshot, contentType: 'image/png' });

    // Assertion 1: No Last Name error is shown (it is optional)
    await expect(page.getByText('Last name is required')).not.toBeVisible();

    // Assertion 2: No other required field errors shown
    await expect(page.getByText('First name is required')).not.toBeVisible();
    await expect(page.getByText('Email is required')).not.toBeVisible();
    await expect(page.getByText('Phone number is required')).not.toBeVisible();

    // Assertion 3: Form fields cleared — confirms successful submission
    await expect(page.getByRole('textbox', { name: 'Enter your first name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Enter your last name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Enter your email' })).toHaveValue('');
  });

});
