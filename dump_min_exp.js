const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://demo.avua.online/employer-login');
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/employer/dashboard');
  await page.getByRole('button', { name: /Post a Job/i }).first().click();
  await page.waitForURL('**/employer/contract-job-post');
  
  // wait a bit
  await page.waitForTimeout(2000);
  
  const minExp = page.locator('input[type="number"], spinbutton').first();
  const html = await minExp.evaluate(el => el.outerHTML);
  console.log("FIRST SPINBUTTON HTML:");
  console.log(html);
  
  const allInputs = await page.locator('input').evaluateAll(els => els.map(e => ({ type: e.type, placeholder: e.placeholder, outerHTML: e.outerHTML })));
  console.log("ALL INPUTS:", JSON.stringify(allInputs, null, 2));

  await browser.close();
})();
