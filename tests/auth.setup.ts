import { test as setup, expect } from '@playwright/test';
import { AvuaEmployerPage } from '../pages/AvuaEmployerPage';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.EMPLOYER_EMAIL || 'pranjil+test@avua.com';
  const password = process.env.EMPLOYER_PASSWORD || 'Test@123';
  
  const employerPage = new AvuaEmployerPage(page);
  console.log('Global Setup: Logging in...');
  await employerPage.login(email, password);

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
