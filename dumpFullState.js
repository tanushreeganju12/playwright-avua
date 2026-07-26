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

  async function getFullState(mode) {
      console.log(`\n\n--- CLICKING ${mode} ---`);
      
      const btn = page.locator('div').filter({ hasText: new RegExp(`^${mode}$`, 'i') }).first();
      await btn.click({ force: true });
      await page.waitForTimeout(2000);

      const stateStr = await page.evaluate(() => {
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
        if (!formStateHook) return "NOT FOUND";
        return JSON.stringify({ work_mode: formStateHook.memoizedState.work_mode, work_preference: formStateHook.memoizedState.work_preference }, null, 2);
      });
      
      console.log(stateStr);
  }

  await getFullState('Hybrid');
  await getFullState('Remote');
  await getFullState('Onsite');

  await browser.close();
})();
