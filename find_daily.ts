import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://demo.avua.online/employer-login');

    await page.getByRole('tab', { name: 'Password' }).click();
    await page.getByPlaceholder('e.g. johndoe@gmail.com').fill('pranjil+test@avua.com');
    await page.getByPlaceholder('Enter password').fill('Test@123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL(/\/employer\/dashboard/i, { timeout: 15000 });
    await page.getByRole('button', { name: /Post a Job/i }).first().click();
    await page.waitForURL(/\/employer\/contract-job-post/i, { timeout: 15000 });
    await page.waitForTimeout(3000);

    const html = await page.evaluate(() => {
      const dailyEl = Array.from(document.querySelectorAll('*')).find(e => e.textContent === 'Daily' && e.children.length === 0);
      if (dailyEl) {
        let p = dailyEl.parentElement;
        if (p) p = p.parentElement;
        return p ? p.outerHTML : dailyEl.outerHTML;
      }
      return "Not found";
    });
    console.log("DAILY DOM:");
    console.log(html);

  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
