import { test } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

test('Dump Step 2 AI Interview', async ({ page }) => {
  const employerPage = new AvuaEmployerPage(page);
  await employerPage.login('pranjil+test@avua.com', 'Test@123');
  await employerPage.navigateToJobPostPage();
  await employerPage.fillStep1Details('Test Job', 'Onsite', 'We are seeking a skilled Playwright Test Engineer.', true);
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(3000);
  
  const html = await page.evaluate(() => document.body.innerHTML);
  const fs = require('fs');
  fs.writeFileSync('step2_dom.html', html);
});
