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
    await page.waitForTimeout(3000);

    // Try to select Fixed rate FIRST (as per screenshot layout)
    const fixedRateBtn = page.getByText('Fixed rate').first();
    if (await fixedRateBtn.isVisible()) {
        await fixedRateBtn.click();
        await page.waitForTimeout(1000);
    }
    
    // Try to select Daily using exact mouse events
    const freqInputContainer = page.getByPlaceholder(/Select payment frequency/i).locator('..').locator('..');
    if (await freqInputContainer.isVisible()) {
        await freqInputContainer.click();
        await page.waitForTimeout(1000);
        
        const dailyOption = page.locator('.absolute.z-50').getByText('Daily', { exact: true }).first();
        if (await dailyOption.isVisible()) {
            console.log('Found Daily option, dispatching mouse events...');
            await dailyOption.dispatchEvent('mousedown');
            await page.waitForTimeout(100);
            await dailyOption.dispatchEvent('mouseup');
            await page.waitForTimeout(100);
            await dailyOption.dispatchEvent('click');
            await page.waitForTimeout(1000);
        }
    }
    
    // Check if it worked
    const selectedText = await page.getByPlaceholder(/Select payment frequency/i).inputValue();
    console.log(`Input value is now: "${selectedText}"`);
    
    // Try second method if it failed
    if (!selectedText || selectedText === '') {
        console.log('Method 1 failed. Trying Method 2 (click offset)...');
        await freqInputContainer.click();
        await page.waitForTimeout(1000);
        const dailyOption = page.locator('.absolute.z-50').getByText('Daily', { exact: true }).first();
        if (await dailyOption.isVisible()) {
            const box = await dailyOption.boundingBox();
            if (box) {
                await page.mouse.click(box.x + 10, box.y + 10);
            }
        }
        await page.waitForTimeout(1000);
        const selectedText2 = await page.getByPlaceholder(/Select payment frequency/i).inputValue();
        console.log(`Input value is now: "${selectedText2}"`);
    }

    await browser.close();
})();
