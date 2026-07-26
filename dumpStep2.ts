import { chromium } from '@playwright/test';
import { AvuaEmployerPage } from './pages/AvuaEmployerPage';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const employerPage = new AvuaEmployerPage(page);
  await employerPage.login('pranjil+test@avua.com', 'Test@123');
  await employerPage.navigateToJobPostPage();

  await employerPage.fillStep1Details('Test Engineer', 'Remote');
  
  const skillsInput = page.getByPlaceholder(/Enter skills/i).first();
  await skillsInput.click();
  await skillsInput.fill('Playwright');
  await page.keyboard.press('Enter');

  await employerPage.continueButton.click();
  
  // Wait for Step 2
  await page.waitForTimeout(3000);
  
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('step2.html', html);
  console.log("Saved Step 2 HTML to step2.html");

  await browser.close();
})();
