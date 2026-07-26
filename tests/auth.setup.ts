import { test as setup, expect } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';
import { AvuaSignUpPage } from '../pages/AvuaSignUpPage';
import { generateResume } from '../utils/pdfGenerator';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. Run non-blocking warmup signup in a separate context to initialize email delivery channel
  try {
    console.log('Global Setup: Running warmup signup...');
    const warmupEmail = 'tanushree.ganju+warmup@avua.com';
    const resumePath = './fixtures/resume_warmup.pdf';
    
    await generateResume({
      name: 'Warmup User',
      email: warmupEmail,
      jobTitle: 'iOS Developer',
      outputPath: resumePath,
    });

    const signupContext = await page.context().browser().newContext();
    const signupPage = await signupContext.newPage();
    try {
      const signUpPagePOM = new AvuaSignUpPage(signupPage);
      await signUpPagePOM.goToApplicantSignUpPage();
      await signUpPagePOM.uploadResume(resumePath);
      await signUpPagePOM.waitForAiPrefill();
      await signUpPagePOM.fillJobTitle('iOS Developer');
      await signUpPagePOM.fillCurrentCompany('Warmup');
      await signUpPagePOM.fillCurrentLocation('Dubai');
      await signUpPagePOM.selectNationality('Indian');
      await signUpPagePOM.fillPhoneNumber('9876543210');
      await signUpPagePOM.updateEmail(warmupEmail);
      await signUpPagePOM.submitCreateAccount();
      // Wait briefly for submit to resolve
      await signupPage.waitForTimeout(5000);
      console.log('Warmup signup submit completed.');
    } finally {
      await signupContext.close();
    }
  } catch (error) {
    console.log('Warmup signup failed/skipped (non-blocking):', error);
  }

  // 2. Perform Employer authentication
  const email = process.env.EMPLOYER_EMAIL || 'pranjil+test@avua.com';
  const password = process.env.EMPLOYER_PASSWORD || 'Test@123';
  
  const employerPage = new AvuaEmployerPage(page);
  console.log('Global Setup: Logging in...');
  await employerPage.login(email, password);

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
