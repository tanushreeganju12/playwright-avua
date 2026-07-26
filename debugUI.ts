import { test, chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Logging in...');
    await page.goto('https://demo.avua.online/login', { timeout: 60000 });
    await page.fill('input[placeholder="Enter Email"]', 'aakarshit.sharma@gmail.com');
    await page.fill('input[placeholder="Enter Password"]', 'Abcd@1234');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('**/employer/dashboard', { timeout: 60000 });

    console.log('Navigating to job post...');
    await page.goto('https://demo.avua.online/employer/contract-job-post', { timeout: 60000 });
    
    // Complete step 1
    const jobTitleInput = page.getByPlaceholder(/Enter job title/i).first();
    await jobTitleInput.fill('Test Job');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    
    console.log('Waiting for Step 2...');
    await page.waitForTimeout(3000);
    
    console.log('Taking screenshot of Step 2...');
    await page.screenshot({ path: 'step2_current.png', fullPage: true });

    // Try to select Fixed rate and Daily
    const fixedRateBtn = page.getByText('Fixed rate').first();
    if (await fixedRateBtn.isVisible()) {
        await fixedRateBtn.click();
        await page.waitForTimeout(1000);
    }
    
    const freqInputContainer = page.getByPlaceholder(/Select payment frequency/i).locator('..').locator('..');
    if (await freqInputContainer.isVisible()) {
        await freqInputContainer.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'step2_dropdown_open.png', fullPage: true });
        
        const dailyOption = page.locator('.absolute.z-50').getByText('Daily', { exact: true }).first();
        if (await dailyOption.isVisible()) {
            await dailyOption.click();
            await page.waitForTimeout(1000);
        }
    }
    
    await page.screenshot({ path: 'step2_after_daily.png', fullPage: true });
    
    const html = await page.content();
    require('fs').writeFileSync('step2_current.html', html);

    console.log('Done!');
    await browser.close();
})();
