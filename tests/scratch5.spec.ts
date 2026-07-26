import { test, expect } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

test('Dump Step 3 Review Content', async ({ page }) => {
  const employerPage = new AvuaEmployerPage(page);
  await employerPage.login('pranjil+test@avua.com', 'Test@123');
  await employerPage.navigateToJobPostPage();
  await employerPage.fillStep1Details('Test Job', 'Onsite', 'We are seeking a skilled Playwright Test Engineer.', true);
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(3000);
  
  // Fill details for Hourly
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

  const scopeEditor = page.locator('.ql-editor').first();
  await scopeEditor.fill('This is the scope of work for this hourly contract.');

  const eorOption = page.getByText('Employer of Record (EOR)', { exact: false }).first();
  await eorOption.click();
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
  
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Publish', exact: true }).first()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2000);

  const text = await page.locator('body').innerText();
  const fs = require('fs');
  fs.writeFileSync('step3_text.txt', text);
});
