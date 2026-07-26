import { test, expect } from '@playwright/test';
import { AvuaSignUpPage } from '../pages/AvuaSignUpPage';
import { generateResume } from '../utils/pdfGenerator';
import fs from 'fs';
import path from 'path';

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

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');

  try {
    const messages = await client.search({ all: true });
    if (messages.length === 0) {
      throw new Error('No messages found in INBOX.');
    }

    let lastMessageId = null;
    let messageSource = null;

    // Search from newest to oldest (up to 15 latest messages)
    for (let i = messages.length - 1; i >= Math.max(0, messages.length - 15); i--) {
      const msgId = messages[i];
      const message = await client.fetchOne(msgId, { source: true });
      const sourceStr = message.source.toString();
      if (sourceStr.includes(recipientEmail)) {
        lastMessageId = msgId;
        messageSource = sourceStr;
        break;
      }
    }

    if (!messageSource) {
      throw new Error(`No messages found for recipient: ${recipientEmail}`);
    }

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
async function pollForMagicLink(recipientEmail: string, maxAttempts = 90): Promise<string> {
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
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error(`Timeout waiting for magic link email to ${recipientEmail}`);
}

test('TC26 - Applicant signup, verify magic link, select full-time job and verify ZipRecruiter redirect', async ({ page }) => {
  test.setTimeout(360000); // 6 minutes timeout for CI greylisting delay

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
    count = 1000 + (runNumber * 10) + 2;
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
  const resumePath = `./fixtures/resume_tc26_${count}.pdf`;

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

    // Step 10: Click Jobs / Job Openings in navigation
    console.log('Navigating to job openings...');
    const jobsNav = page.locator('header, nav, [role="navigation"]').getByText('Jobs', { exact: true }).first()
      .or(page.getByText('Jobs', { exact: true }).filter({ visible: true }).first())
      .or(page.getByRole('link', { name: /^jobs$|job openings/i }).filter({ visible: true }).first())
      .first();

    await expect(jobsNav).toBeVisible({ timeout: 15000 });
    
    // Hover to trigger dropdown, click if needed
    const fullTimeJobsOption = page.locator('text=Full-time Jobs').filter({ visible: true }).first()
      .or(page.locator('text=full-time jobs').filter({ visible: true }).first())
      .or(page.getByRole('link', { name: /full-time jobs|full time jobs/i }).filter({ visible: true }).first())
      .first();

    await jobsNav.hover();
    await page.waitForTimeout(1500);
    if (!await fullTimeJobsOption.isVisible()) {
      console.log('Full-time jobs option not visible after hover. Clicking jobsNav...');
      await jobsNav.click({ force: true });
      await page.waitForTimeout(1500);
    }

    // Step 11: Click Full-time Jobs from dropdown
    console.log('Clicking Full-time Jobs option...');
    await expect(fullTimeJobsOption).toBeVisible({ timeout: 15000 });
    await fullTimeJobsOption.click({ force: true });
    await page.waitForTimeout(3000);

    // Step 12: Click View Job on the desired job card
    console.log('Looking for job to view...');
    const viewJobBtn = page.getByRole('link', { name: /View job/i })
      .or(page.getByRole('button', { name: /View job/i }))
      .or(page.locator('text=View job'))
      .first();

    await expect(viewJobBtn).toBeVisible({ timeout: 20000 });
    await viewJobBtn.click();
    await page.waitForTimeout(3000);

    // Step 13: Assert two buttons are displayed: Apply now and free resume scoring
    console.log('Verifying "Apply now" and "Free resume scoring" buttons are displayed...');
    const applyNowBtn = page.getByRole('button', { name: /Apply now/i }).filter({ visible: true }).first()
      .or(page.getByRole('link', { name: /Apply now/i }).filter({ visible: true }).first())
      .or(page.locator('text=Apply Now').filter({ visible: true }).first())
      .first();

    const resumeScoringBtn = page.getByRole('button', { name: /resume scoring/i }).filter({ visible: true }).first()
      .or(page.getByRole('link', { name: /resume scoring/i }).filter({ visible: true }).first())
      .or(page.locator('text=free resume scoring').filter({ visible: true }).first())
      .or(page.locator('text=Free Resume Scoring').filter({ visible: true }).first())
      .or(page.locator('text=Free Resume Score').filter({ visible: true }).first())
      .first();

    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
    await expect(resumeScoringBtn).toBeVisible({ timeout: 15000 });
    console.log('Both buttons verified successfully!');

    // Step 14: Click Apply now and verify redirect to ZipRecruiter
    console.log('Clicking Apply now and listening for redirect...');
    
    // Listen for tab popup or main page navigation redirect
    const popupPromise = page.context().waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await applyNowBtn.click();

    const popup = await popupPromise;
    if (popup) {
      console.log('Redirect opened in a new tab. Waiting for page to load...');
      await popup.waitForLoadState('domcontentloaded');
      // Wait 6 seconds to let ZipRecruiter fully render
      await popup.waitForTimeout(6000);
      const url = popup.url();
      console.log('New tab URL:', url);
      expect(url).toContain('ziprecruiter.com');
      await popup.screenshot({ path: `screenshots/tc26_ziprecruiter_new_tab.png`, fullPage: true });
      await popup.close();
    } else {
      console.log('No new tab opened. Checking redirect on current page...');
      await page.waitForTimeout(10000);
      const url = page.url();
      console.log('Current page URL:', url);
      expect(url).toContain('ziprecruiter.com');
      await page.screenshot({ path: `screenshots/tc26_ziprecruiter_redirect.png`, fullPage: true });
    }

    console.log('Successfully verified redirect to ZipRecruiter!');

  } finally {
    // Cleanup generated resume PDF
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }
  }
});
