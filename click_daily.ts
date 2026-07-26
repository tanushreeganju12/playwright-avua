import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://demo.avua.online/employer-login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Password' }).first().click();
  await page.getByPlaceholder('you@company.com').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Enter your password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(/\/employer\/dashboard/i, { timeout: 30000 });
  await page.locator('button:has-text("Post a job")').first().click();
  await page.waitForURL(/\/employer\/contract-job-post/i, { timeout: 30000 });
  await page.waitForTimeout(3000); // wait for render

  // Wait for the payment frequency section to be visible
  await page.waitForSelector('text=Payment frequency');

  // Let's get the bounding box of the text "Daily"
  const dailyEl = page.locator('text=Daily').last(); // Usually Hourly Daily Monthly
  await dailyEl.waitFor({ state: 'visible' });
  const box = await dailyEl.boundingBox();
  console.log("Daily box:", box);

  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    console.log("Clicked Daily by coordinates!");
  } else {
    console.log("Could not find Daily text box!");
  }
  
  await page.waitForTimeout(1000);

  const state = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('input, textarea, button, div, p, span, main'));
    let formStateHook: any = null;
    for (const el of candidates) {
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
      if (!key) continue;
      let f = (el as any)[key];
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

  console.log("REACT STATE AFTER CLICKING DAILY:");
  console.log(JSON.stringify(state, null, 2));

  await browser.close();
})();
