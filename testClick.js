const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://demo.avua.online/employer-login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Password' }).first().click();
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(/\/employer\/dashboard/i, { timeout: 10000 });
  await page.locator('button:has-text("Post a job")').click();
  await page.waitForURL(/\/employer\/contract-job-post/i, { timeout: 10000 });
  await page.waitForTimeout(3000); // wait for render

  // TRY CLICKING HYBRID USING heading
  console.log("Clicking Hybrid heading...");
  const hybridHeading = page.getByRole('heading', { name: /Hybrid/i }).first();
  await hybridHeading.click();
  await page.waitForTimeout(2000);
  
  // Dump outerHTML of the parent of Hybrid to see if it has selected class
  const html = await hybridHeading.evaluate(node => node.parentElement?.parentElement?.outerHTML);
  console.log(html);

  // TRY CLICKING PARENT
  console.log("Clicking Hybrid parent container...");
  await page.locator('text=Hybrid').locator('..').click();
  await page.waitForTimeout(2000);
  
  const html2 = await hybridHeading.evaluate(node => node.parentElement?.parentElement?.outerHTML);
  console.log(html2);

  await browser.close();
})();
