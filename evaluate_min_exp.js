const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://demo.avua.online/employer-login');
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  await page.waitForURL('**/employer/dashboard', { timeout: 60000 });
  await page.getByRole('button', { name: /Post a Job/i }).first().click();
  await page.waitForURL('**/employer/contract-job-post', { timeout: 60000 });
  
  await page.waitForTimeout(3000); // let react render
  
  const minExp = page.locator('label').filter({ hasText: 'Minimum Experience' }).locator('~ div input').first();
  const html = await minExp.evaluate(el => el.outerHTML);
  console.log("MIN EXP HTML:", html);
  
  await browser.close();
})();
