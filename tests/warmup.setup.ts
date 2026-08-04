import { test as setup } from '@playwright/test';
import { AvuaSignUpPage } from '../pages/AvuaSignUpPage';
import { generateResume } from '../utils/pdfGenerator';
import fs from 'fs';

setup('warmup email channels', async ({ page }) => {
  // Run non-blocking warmup signup to initialize email delivery channel
  const runNumber = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
  const warmupEmail = `tanushree.ganju+warmup${runNumber}@avua.com`;
  const resumePath = `./fixtures/resume_warmup_${runNumber}.pdf`;

  try {
    await generateResume({
      name: 'Warmup User',
      email: warmupEmail,
      jobTitle: 'iOS Developer',
      outputPath: resumePath,
    });

    const signUpPagePOM = new AvuaSignUpPage(page);
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
    await page.waitForTimeout(5000);
    console.log('Warmup signup submit completed.');
  } catch (error) {
    console.log('Warmup signup failed/skipped (non-blocking):', error);
  } finally {
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }
  }
});
