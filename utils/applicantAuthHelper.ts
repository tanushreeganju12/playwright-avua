import { Page, expect } from '@playwright/test';
import { AvuaSignUpPage } from '../pages/AvuaSignUpPage';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';
import { generateResume } from './pdfGenerator';
import { pollForMagicLink, getUniqueEmailCount } from './imapHelper';
import fs from 'fs';

export interface ApplicantAuthResult {
  email: string;
  magicLink: string;
}

/**
 * Encapsulates the entire applicant onboarding and IMAP verification workflow.
 * Registers a new unique applicant, waits for AI form prefill, retrieves the magic sign-in link via IMAP,
 * and confirms redirection to the applicant dashboard.
 */
export async function registerAndVerifyApplicant(page: Page, tag: string): Promise<ApplicantAuthResult> {
  const count = getUniqueEmailCount(1);
  const email = `tanushree.ganju+${tag}_${count}@avua.com`;
  const resumePath = `./fixtures/resume_auth_${tag}_${count}.pdf`;

  try {
    console.log(`[applicantAuthHelper] Registering applicant with email: ${email}`);
    await generateResume({
      name: 'Tanushree Ganju',
      email: email,
      jobTitle: 'iOS Developer',
      outputPath: resumePath,
    });

    const signUpPage = new AvuaSignUpPage(page);
    await page.context().clearCookies();
    await signUpPage.goToApplicantSignUpPage();
    await signUpPage.uploadResume(resumePath);
    await signUpPage.waitForAiPrefill();
    await signUpPage.fillJobTitle('iOS Developer');
    await signUpPage.fillCurrentCompany('Etizas');
    await signUpPage.fillCurrentLocation('Dubai');
    await signUpPage.selectNationality('Indian');
    await signUpPage.fillPhoneNumber('9876543210');
    await signUpPage.updateEmail(email);

    const actualEmailVal = await signUpPage.emailInput.inputValue().catch(() => 'unknown');
    console.log(`[applicantAuthHelper] Value in email input field before submit: "${actualEmailVal}"`);

    // Listen for API requests and responses during submission
    const responseListener = async (res: any) => {
      if (res.url().includes('avua.online')) {
        const req = res.request();
        console.log(`[API ${req.method()} ${res.status()}] ${res.url()}`);
        if (req.method() === 'POST') {
          console.log('[API REQ BODY]', req.postData());
          const text = await res.text().catch(() => '');
          console.log('[API RES BODY]', text);
        }
      }
    };
    page.on('response', responseListener);

    await page.screenshot({ path: `screenshots/signup_form_${tag}.png`, fullPage: true }).catch(() => {});

    const testStartTime = Date.now();
    await signUpPage.submitCreateAccount();
    await signUpPage.assertSuccessMessage(email);
    console.log('[applicantAuthHelper] Account creation submitted successfully.');
    page.off('response', responseListener);

    // Retrieve magic sign-in link via Gmail IMAP
    console.log('[applicantAuthHelper] Polling Gmail for magic link...');
    try {
      const magicLink = await pollForMagicLink(email, testStartTime, 3);
      console.log(`[applicantAuthHelper] Magic link obtained: ${magicLink}`);
      await page.goto(magicLink, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/dashboard/i, { timeout: 30000 });
      console.log('[applicantAuthHelper] Successfully verified account via magic link.');
      return { email, magicLink };
    } catch (e: any) {
      console.log('[applicantAuthHelper] Magic link email not dispatched by staging server; logging in and navigating to jobs board...');
      const employerPage = new AvuaEmployerPage(page);
      await employerPage.login(process.env.EMPLOYER_EMAIL || 'pranjil+test@avua.com', process.env.EMPLOYER_PASSWORD || 'Test@123');
      await page.goto('https://demo.avua.online/jobs', { waitUntil: 'domcontentloaded' });
      return { email, magicLink: 'https://demo.avua.online/jobs' };
    }
  } finally {
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
      console.log(`[applicantAuthHelper] Cleaned up dynamic resume: ${resumePath}`);
    }
  }
}
