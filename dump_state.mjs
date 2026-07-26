import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://staging.avua.ai/');
  await page.getByRole('button', { name: 'Login' }).first().click();
  await page.getByPlaceholder('Email Address').fill('pranjil+test@avua.com');
  await page.getByPlaceholder('Password').fill('Test@123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/employer/dashboard');
  
  await page.goto('https://staging.avua.ai/employer/job-post');
  
  // Step 1
  await page.getByPlaceholder(/e\.g\. Flight Test Engineer/i).fill('Playwright Test Engineer');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const workspaceHeading = page.locator('text=Onsite').first();
  await workspaceHeading.evaluate((el: any) => { if (el.parentElement) { el.parentElement.click(); } else { el.click(); } });
  
  const minExp = page.locator('input[type="number"], spinbutton').first();
  await minExp.fill('3');
  const desc = page.locator('.ql-editor').first();
  await desc.fill('Description');
  
  // Inject partial state so Step 1 passes
  await page.evaluate(() => {
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
    if (formStateHook) {
      const currentVal = formStateHook.memoizedState;
      const updated = {
        ...currentVal,
        experience_minimum: 3,
        experience_maximum: 10,
        job_title: { id: "some-id", name: "Playwright Test Engineer" },
        job_space: { id: "some-id", name: "Engineering" },
        work_mode: ["On-site"]
      };
      formStateHook.queue.dispatch(updated);
    }
  });
  
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.locator('.grid.grid-cols-3 > div').first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Step 2
  await page.locator('.grid.grid-cols-3 > div').first().click();
  await page.waitForTimeout(500);
  
  // Click Hourly
  const freqInput = page.getByPlaceholder(/Select payment frequency/i);
  await freqInput.click();
  await page.waitForTimeout(500);
  await page.locator('div').filter({ hasText: /^Hourly$/ }).first().click();
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
  
  fs.writeFileSync('hourly_state.json', JSON.stringify(state, null, 2));
  console.log('Saved hourly_state.json');
  
  await browser.close();
})();
