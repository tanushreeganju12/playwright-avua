import { test } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

test('Dump Step 2 AI Interview Hourly', async ({ page }) => {
  const employerPage = new AvuaEmployerPage(page);
  await employerPage.login('pranjil+test@avua.com', 'Test@123');
  await employerPage.navigateToJobPostPage();
  await employerPage.fillStep1Details('Test Job', 'Onsite', 'We are seeking a skilled Playwright Test Engineer.', true);
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(3000);
  
  // Fill details
  const freqInputContainer = page.getByPlaceholder(/Select payment frequency/i).locator('..').locator('..');
  await freqInputContainer.click();
  await page.waitForTimeout(1000);
  await page.getByText('Hourly', { exact: true }).last().click();
  await page.waitForTimeout(1000);

  const amountInput = page.getByPlaceholder(/Enter amount/i).first();
  await amountInput.click();
  await amountInput.fill('50');
  await amountInput.blur();
  await page.waitForTimeout(500);

  const lengthInput = page.getByPlaceholder(/Enter Contract Length/i).first();
  await lengthInput.click({ force: true });
  await lengthInput.fill('6');
  await lengthInput.blur();
  await page.waitForTimeout(1000);

  const startDateContainer = page.locator('div[aria-label="Contract Start Date "]').filter({ hasText: 'DD' }).first();
  await startDateContainer.click({ force: true });
  await page.waitForTimeout(500);
  await page.getByText('15', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(1500);
  
  const html = await page.evaluate(() => document.body.innerHTML);
  const fs = require('fs');
  fs.writeFileSync('step2_dom_hourly.html', html);
});
