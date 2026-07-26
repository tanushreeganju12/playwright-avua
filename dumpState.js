const { chromium } = require('playwright');

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

  // Function to extract state
  async function extractState(modeName) {
    console.log("Clicking " + modeName);
    await page.getByRole('heading', { name: new RegExp(modeName, 'i') }).first().click();
    await page.waitForTimeout(1000);

    const state = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('input, textarea, button, div, p, span, main'));
      let formStateHook = null;
      for (const el of candidates) {
        const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
        if (!key) continue;
        let f = el[key];
        while (f) {
          let hook = f?.memoizedState;
          while (hook) {
            const val = hook.memoizedState;
            if (val && typeof val === 'object' && 'job_title' in val && 'job_space' in val) {
              formStateHook = hook;
              break;
            }
            hook = hook.next;
          }
          if (formStateHook) break;
          f = f.return;
        }
        if (formStateHook) break;
      }
      return formStateHook ? formStateHook.memoizedState : null;
    });

    console.log("React State for " + modeName + ":");
    console.log(JSON.stringify({
      work_preference: state?.work_preference,
      job_space: state?.job_space,
      country: state?.country,
      job_location: state?.job_location
    }, null, 2));
  }

  await extractState('Onsite');
  await extractState('Hybrid');
  await extractState('Remote');

  await browser.close();
})();
