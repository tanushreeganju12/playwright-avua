const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://demo.avua.online/employer-login');
  await page.getByRole('button', { name: 'Password' }).click();
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/employer\/dashboard/i, { timeout: 30000, waitUntil: 'domcontentloaded' });
  const postBtn = page.getByRole('button', { name: /Post a Job/i }).first();
  await postBtn.waitFor({ state: 'visible', timeout: 30000 });
  await postBtn.click();
  await page.waitForTimeout(5000);
  
  // Fill Step 1
  await page.getByPlaceholder(/Enter Job Title/i).first().fill('Test Engineer');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(3000);
  await page.locator('.ql-editor').first().fill('We need a test engineer');
  await page.getByPlaceholder(/e\.g\.\s+United\s+States/i).first().fill('United States');
  await page.waitForTimeout(2000);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  
  await page.getByPlaceholder(/e\.g\.\s+California/i).first().fill('New York');
  await page.waitForTimeout(2000);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');

  await page.getByRole('button', { name: /Continue/i }).first().click();
  await page.waitForTimeout(5000);
  
  const html = await page.content();
  require('fs').writeFileSync('step2.html', html);
  console.log('Saved step2.html');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
