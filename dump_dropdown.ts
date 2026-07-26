import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://demo.avua.online/employer-login');

    // Login
    await page.getByRole('tab', { name: 'Password' }).click();
    await page.getByPlaceholder('e.g. johndoe@gmail.com').fill('pranjil+test@avua.com');
    await page.getByPlaceholder('Enter password').fill('Test@123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL(/\/employer\/dashboard/i, { timeout: 15000 });

    // Go to post job
    await page.getByRole('button', { name: /Post a Job/i }).first().click();

    // Type in country
    const countryInput = page.getByPlaceholder(/e\.g\.\s+United\s+States/i).first();
    await countryInput.fill('United States');
    await page.waitForTimeout(2000);

    // Dump entire body HTML matching dropdowns
    const dropdownHtml = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div, ul, li'));
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return (style.position === 'absolute' || style.position === 'fixed') && el.textContent?.includes('United States');
      }).map(el => el.outerHTML);
    });

    console.log("DROPDOWN HTML MATCHES:");
    console.log(dropdownHtml.join('\n\n====\n\n'));

  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
