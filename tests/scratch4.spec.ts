import { test, expect } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

test('Dump Step 3 AI Interview Hourly', async ({ page }) => {
  const employerPage = new AvuaEmployerPage(page);
  await employerPage.login('pranjil+test@avua.com', 'Test@123');
  await employerPage.navigateToJobPostPage();
  await employerPage.fillStep1Details('Test Job', 'Onsite', 'We are seeking a skilled Playwright Test Engineer.', true);
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(3000);
  
  await employerPage.fillStep2Details({
    frequency: 'Hourly',
    amount: '50',
    scopeOfWork: 'This is the scope of work for this hourly contract. It includes many important details.',
    engagementModel: 'EOR',
    contractLength: '6',
    startDate: 'auto'
  });
  await employerPage.proceedToStep3();

  const html = await page.evaluate(() => document.body.innerHTML);
  const fs = require('fs');
  fs.writeFileSync('step3_dom.html', html);
});
