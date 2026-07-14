import { test } from '@playwright/test';
import { AvuaSignUpPage } from '../pages/AvuaSignUpPage';
import { generateResume } from '../utils/pdfGenerator';
import fs from 'fs';

test.describe('Applicant Sign-Up Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({
        path: `screenshots/${testInfo.title.replace(/\s+/g, '_')}.png`,
        fullPage: true,
      });
    }
  });

  test('should sign up applicant via resume upload and AI-prefilled form', async ({ page }) => {
    const signUpPage = new AvuaSignUpPage(page);
    const shortTimestamp = Date.now().toString().slice(-6);
    const email = `user${shortTimestamp}@avua.com`;
    const dynamicResumePath = `./fixtures/resume_${shortTimestamp}.pdf`;

    // Generate a fresh resume so the AI parser treats this as a brand-new sign-up
    await generateResume({
      name: 'Aakarshit Sharma',
      email: email,
      jobTitle: 'iOS Developer',
      outputPath: dynamicResumePath,
    });

    await signUpPage.goToApplicantSignUpPage();
    await signUpPage.uploadResume(dynamicResumePath);
    await signUpPage.waitForAiPrefill();
    
    // The email will be readonly and pre-filled by the AI. We don't need to update it.
    await signUpPage.fillJobTitle('iOS Developer');
    await signUpPage.fillCurrentCompany('Etizas');
    await signUpPage.fillCurrentLocation('Dubai');
    await signUpPage.selectNationality('Indian');
    await signUpPage.fillPhoneNumber('9876543210'); // Valid 10-digit phone number for India (+91) default
    await signUpPage.submitCreateAccount();
    await signUpPage.assertSuccessMessage(email);

    // Cleanup the generated resume
    fs.unlinkSync(dynamicResumePath);
  });
});
