const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://demo.avua.online/employer-login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Email address').fill('aakarshitsharma06@gmail.com');
  await page.getByPlaceholder('Password').fill('Aakarshit@123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/employer/contract-job-post', { timeout: 30000 });
  console.log('Logged in and on job post page');

  // Step 1
  await page.getByPlaceholder('Enter Job Title').fill('Test Engineer');
  await page.getByPlaceholder('e.g. United States').fill('United States');
  await page.waitForTimeout(2000);
  await page.getByText('United States', { exact: true }).last().click();
  await page.getByPlaceholder('e.g. New York').fill('New York');
  await page.waitForTimeout(2000);
  await page.getByText('New York', { exact: true }).last().click();
  await page.locator('.ql-editor').fill('Job Description text');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(3000);
  console.log('On Step 2');

  // Step 2
  await page.screenshot({ path: 'debug-1-initial.png', fullPage: true });

  console.log('Selecting Engagement Model...');
  await page.getByText('Independent contractor (IC)', { exact: true }).first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'debug-2-engagement-selected.png', fullPage: true });

  console.log('Selecting Daily...');
  const freqInput = page.getByPlaceholder(/Select payment frequency/i);
  await freqInput.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'debug-3-dropdown-open.png', fullPage: true });
  await page.locator('div').filter({ hasText: /^Daily$/ }).first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'debug-4-dropdown-selected.png', fullPage: true });

  console.log('Entering Amount...');
  const amountInput = page.getByPlaceholder(/Enter amount/i).first();
  await amountInput.click();
  await amountInput.fill('500');
  await amountInput.press('Tab');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'debug-5-amount-filled.png', fullPage: true });

  console.log('Done');
  await browser.close();
})();
