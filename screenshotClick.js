const { chromium } = require('playwright');
// test

// I will just use playwright to test the click.
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://demo.avua.online/employer-login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Password' }).first().click();
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(/\/employer\/dashboard/i, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.locator('button:has-text("Post a job")').click();
  await page.waitForURL(/\/employer\/contract-job-post/i, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000); // wait for render

  const empType = 'Hybrid';
  const empBtn = page.getByRole('heading', { name: new RegExp(empType, 'i') }).first();
  await empBtn.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'hybrid-click-test.png' });
  console.log("Screenshot taken.");

  await browser.close();
})();
