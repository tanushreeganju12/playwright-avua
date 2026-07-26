import { test, chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Logging in...');
    await page.goto('https://demo.avua.online/login');
    await page.fill('input[placeholder="Enter Email"]', 'aakarshit.sharma@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', 'Abcd@1234');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('**/employer/dashboard');

    console.log('Navigating to job post...');
    await page.goto('https://demo.avua.online/employer/contract-job-post');
    await page.waitForTimeout(2000);
    
    // Complete step 1
    const jobTitleInput = page.getByPlaceholder(/Enter job title/i).first();
    await jobTitleInput.fill('Test Job');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    await page.waitForTimeout(1000);
    
    const scopeOfWorkBtn = page.getByRole('button', { name: 'Describe Scope of Work manually' });
    await scopeOfWorkBtn.click();
    await page.waitForTimeout(1000);

    const html = await page.content();
    require('fs').writeFileSync('current_page.html', html);
    console.log('Dumped to current_page.html');
    await browser.close();
})();
