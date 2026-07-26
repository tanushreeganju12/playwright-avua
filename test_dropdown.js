const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://demo.avua.online/employer-login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  try {
    await page.waitForURL(/\/employer\/dashboard/i, { timeout: 15000 });
  } catch(e) {}
  
  await page.goto('https://demo.avua.online/employer/contract-job-post', { waitUntil: 'domcontentloaded' });
  
  // Fill Step 1 just enough to get to Step 2
  await page.getByPlaceholder(/Enter job title/i).first().fill('Test');
  
  const minExp = page.locator('input[type="number"], spinbutton').first();
  await minExp.fill('4');
  
  const countryInput = page.getByPlaceholder(/e\.g\.\s+United\s+States/i).first();
  await countryInput.fill('United States');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('div, li, span, p')).filter(e => e.textContent === 'United States');
    if (els.length > 0) els[els.length - 1].click();
  });
  await page.waitForTimeout(500);

  const cityInput = page.getByPlaceholder(/e\.g\.\s+California/i).first();
  await cityInput.fill('New York');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('div, li, span, p')).filter(e => e.textContent && e.textContent.includes('New York, United States'));
    if (els.length > 0) els[els.length - 1].click();
  });
  await page.waitForTimeout(500);
  
  await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
  await page.waitForTimeout(3000);
  
  // STEP 2
  const html = await page.evaluate(() => {
      const container = document.querySelector('form') || document.querySelector('main') || document.body;
      return container.outerHTML;
  });
  fs.writeFileSync('step2.html', html);
  console.log("Dumped step2.html");

  await browser.close();
})();
