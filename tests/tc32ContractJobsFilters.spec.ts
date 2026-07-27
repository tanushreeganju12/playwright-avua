import { test, expect } from '@playwright/test';
import { AvuaSignUpPage } from '../pages/AvuaSignUpPage';
import { generateResume } from '../utils/pdfGenerator';
import fs from 'fs';
import path from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

// Use require for imapflow to prevent compilation errors if @types/imapflow is missing
const { ImapFlow } = require('imapflow');

test.use({ storageState: { cookies: [], origins: [] } });

/**
 * Connects to Gmail via IMAP and searches for the magic sign-in link
 * sent to the recipientEmail.
 */
async function getMagicLinkFromEmail(recipientEmail: string): Promise<string> {
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;

  if (!user || !pass) {
    throw new Error('IMAP_USER and IMAP_PASSWORD must be configured in your .env file.');
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false
  });

  client.on('error', (err: any) => {
    console.log(`IMAP client background error: ${err.message}`);
  });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');

  try {
    const messages = await client.search({ to: recipientEmail });
    if (messages.length === 0) {
      throw new Error(`No messages found for recipient: ${recipientEmail}`);
    }

    const msgId = messages[messages.length - 1];
    const message = await client.fetchOne(msgId, { source: true });
    const messageSource = message.source.toString();

    // Decode quoted-printable first to join split lines
    let decodedSource = messageSource.replace(/=3D/g, '=');
    decodedSource = decodedSource.replace(/=\r?\n/g, '');
    decodedSource = decodedSource.replace(/=\n/g, '');
    decodedSource = decodedSource.replace(/&amp;/g, '&');

    // Regex to locate any link starting with https://
    const regex = /https:\/\/[^\s"'>]+/g;
    const matches = decodedSource.match(regex);

    if (!matches) {
      console.log('--- Matches failed. Writing source to email_source.txt ---');
      fs.writeFileSync('email_source.txt', messageSource);
      throw new Error('No links found in email content. Full source saved to email_source.txt.');
    }

    // Filter to find the link that is for email-verify, login, token or callback
    const magicLink = matches.find((u: string) => u.includes('email-verify') || u.includes('token') || u.includes('callback') || u.includes('login'));
    if (!magicLink) {
      console.log('--- Filter failed. Writing source to email_source.txt ---');
      fs.writeFileSync('email_source.txt', messageSource);
      throw new Error('Could not find the verification link in the parsed URLs. Full source saved to email_source.txt.');
    }
    return magicLink;
  } finally {
    lock.release();
    await client.logout();
  }
}

/**
 * Polls the Gmail inbox until the magic link email arrives and is successfully parsed.
 */
async function pollForMagicLink(recipientEmail: string, maxAttempts = 55): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Polling for magic link email to ${recipientEmail} (Attempt ${attempt}/${maxAttempts})...`);
    try {
      const link = await getMagicLinkFromEmail(recipientEmail);
      if (link) {
        return link;
      }
    } catch (e: any) {
      console.log(`Attempt ${attempt} failed: ${e.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  throw new Error(`Timeout waiting for magic link email to ${recipientEmail}`);
}

test('TC32 - Logged in applicant filters contract jobs by date posted and work model', async ({ page }) => {
  test.setTimeout(900000); // 15 minutes timeout for CI greylisting delay

  // Step 1: Manage email increment counter using atomic directory lock to prevent race conditions in parallel runs
  const counterFile = path.join(__dirname, 'email_counter.json');
  const lockDir = counterFile + '.lock';
  let acquired = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      fs.mkdirSync(lockDir);
      acquired = true;
      break;
    } catch (e) {
      // Wait a short random time and retry
      const delay = Math.floor(Math.random() * 50) + 10;
      const start = Date.now();
      while (Date.now() - start < delay) {}
    }
  }

  let count = 60;
  if (process.env.CI) {
    const runNumber = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
    count = 1000 + (runNumber * 10) + 4;
  } else {
    try {
      if (fs.existsSync(counterFile)) {
        const data = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
        count = (data.count || 59) + 1;
      }
      fs.writeFileSync(counterFile, JSON.stringify({ count }));
    } finally {
      if (acquired) {
        try {
          fs.rmdirSync(lockDir);
        } catch (e) {}
      }
    }
  }
  
  const email = `tanushree.ganju+${count}@avua.com`;
  const resumePath = `./fixtures/resume_tc32_${count}.pdf`;

  console.log(`Using email: ${email}`);

  // Step 2: Generate PDF Resume with the specific incremented email
  await generateResume({
    name: 'Tanushree Ganju',
    email: email,
    jobTitle: 'iOS Developer',
    outputPath: resumePath,
  });

  try {
    const signUpPage = new AvuaSignUpPage(page);

    // Step 3: Navigate to sign up page
    console.log('Navigating to signup page...');
    await signUpPage.goToApplicantSignUpPage();

    // Step 4: Upload resume and wait for AI prefill
    console.log('Uploading resume...');
    await signUpPage.uploadResume(resumePath);
    await signUpPage.waitForAiPrefill();

    // Step 5: Fill nationality and email fields
    console.log('Filing details...');
    await signUpPage.fillJobTitle('iOS Developer');
    await signUpPage.fillCurrentCompany('Etizas');
    await signUpPage.fillCurrentLocation('Dubai');
    await signUpPage.selectNationality('Indian');
    await signUpPage.fillPhoneNumber('9876543210');
    
    // Explicitly update email to ensure the incremented email is used
    await signUpPage.updateEmail(email);

    // Step 6: Submit create account form
    console.log('Submitting create account...');
    await signUpPage.submitCreateAccount();
    await signUpPage.assertSuccessMessage(email);
    console.log('Account creation success message verified.');

    // Step 7: Retrieve verification/magic link via Gmail IMAP
    console.log('Retrieving verification magic link from email...');
    const magicLink = await pollForMagicLink(email);
    console.log(`Successfully retrieved magic link: ${magicLink}`);

    // Step 8: Navigate to magic link to verify account and load dashboard
    console.log('Verifying account by navigating to magic link...');
    await page.goto(magicLink, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard/i, { timeout: 30000 });
    console.log('Successfully redirected to dashboard.');

    // Step 9: Select location from dropdown/combobox (if visible)
    console.log('Checking for location dropdown/input...');
    const locInput = page.getByPlaceholder(/Search location|City, state, or remote|Select location|Select city/i)
      .or(page.getByLabel(/Location/i))
      .or(page.locator('input[name="location"]'))
      .first();

    if (await locInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Location input found. Selecting location...');
      await locInput.click({ force: true });
      await locInput.clear();
      await locInput.pressSequentially('Dubai', { delay: 150 });
      await page.waitForTimeout(1000);

      const locOption = page.getByText('Dubai, United Arab Emirates', { exact: false })
        .or(page.locator('.absolute').getByText('Dubai', { exact: false }).first());

      if (await locOption.isVisible({ timeout: 5000 }).catch(() => false)) {
        await locOption.click();
      } else {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(1000);
    } else {
      console.log('Location input not visible. Skipping...');
    }

    // Step 10: Navigate directly to Contract Jobs dashboard
    console.log('Navigating to Contract Jobs board...');
    await page.goto('https://demo.avua.online/dashboard/contract-jobs', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Step 11: Apply "Last week" Date Posted filter
    console.log('Filtering by Date Posted: Last week...');
    const lastWeekBtn = page.getByRole('button', { name: 'Last week', exact: true });
    await expect(lastWeekBtn).toBeVisible({ timeout: 15000 });
    await lastWeekBtn.click();
    await page.waitForTimeout(2000);

    // Step 12: Apply "Remote" Employment Model filter
    console.log('Filtering by Employment Model: Remote...');
    const remoteBtn = page.getByRole('button', { name: 'Remote', exact: true });
    await expect(remoteBtn).toBeVisible({ timeout: 15000 });
    await remoteBtn.click();
    await page.waitForTimeout(2000);

    // Step 13: Apply "Hybrid" Employment Model filter
    console.log('Filtering by Employment Model: Hybrid...');
    const hybridBtn = page.getByRole('button', { name: 'Hybrid', exact: true });
    await expect(hybridBtn).toBeVisible({ timeout: 15000 });
    await hybridBtn.click();
    await page.waitForTimeout(2000);

    // Step 14: Apply "On-site" Employment Model filter
    console.log('Filtering by Employment Model: On-site...');
    const onsiteBtn = page.getByRole('button', { name: 'On-site', exact: true });
    await expect(onsiteBtn).toBeVisible({ timeout: 15000 });
    await onsiteBtn.click();
    await page.waitForTimeout(2000);

    // Step 15: Apply "Last month" Date Posted filter
    console.log('Filtering by Date Posted: Last month...');
    const lastMonthBtn = page.getByRole('button', { name: 'Last month', exact: true });
    await expect(lastMonthBtn).toBeVisible({ timeout: 15000 });
    await lastMonthBtn.click();
    await page.waitForTimeout(4000);

    // Take screenshot of filtered board
    await page.screenshot({ path: 'screenshots/tc32_contract_jobs_filters.png', fullPage: true });
    console.log('TC32 successfully completed and verified!');

  } finally {
    // Cleanup generated resume PDF
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }
  }
});
