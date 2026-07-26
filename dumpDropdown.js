const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://demo.avua.online/employer-login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Email address"]');
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

  // Open dropdown
  const freqInput = page.getByPlaceholder(/Select payment frequency/i);
  await freqInput.click();
  await page.waitForTimeout(1000);
  
  // Dump HTML
  const html = await page.content();
  fs.writeFileSync('dropdown_dump.html', html);
  console.log('Dumped to dropdown_dump.html');
  await browser.close();
})();
