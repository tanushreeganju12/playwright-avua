import { test } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

test('Intercept Job Post', async ({ page }) => {
  const employerPage = new AvuaEmployerPage(page);
  await employerPage.login('pranjil+test@avua.com', 'Test@123');
  await employerPage.navigateToJobPostPage();
  
  // Let TC1 b flow natively up to Step 3 using the standard methods
  // But we will intercept the POST to /employer/job-post or whatever
  
  let payload = null;
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().includes('job-post')) {
      payload = request.postDataJSON();
    }
  });

  await employerPage.fillStep1Details('Test Engineer', 'Hybrid', 'Need a playwright automation expert', true, 4);
  
  
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(2000);
  
  await employerPage.fillStep2Details();
  await employerPage.proceedToStep3();
  
  await page.waitForTimeout(2000);
  const publishBtn = page.getByRole('button', { name: 'Publish', exact: true }).first();
  await publishBtn.click();
  await page.waitForTimeout(3000);
  
  console.log('--- NATIVE PAYLOAD ---');
  console.log(JSON.stringify(payload, null, 2));
});
