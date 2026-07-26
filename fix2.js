const fs = require('fs');
let code = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf8');

// Replace everything from "Selecting contract length" down to "Configuring AI interview language"
const startMatch = "// Select contract length (conditionally visible based on Payment Frequency)";
const endMatch = "// Configure AI interview (Language & Ratio)";
const startIndex = code.indexOf(startMatch);
const endIndex = code.indexOf(endMatch);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `    // Wait a moment for React to render the conditional fields based on Payment Frequency
    await page.waitForTimeout(1500);

    // Select contract length (conditionally visible based on Payment Frequency)
    console.log('Selecting contract length...');
    const lengthInput = page.getByPlaceholder(/Enter Contract Length/i).first();
    if (await lengthInput.isVisible()) {
        await lengthInput.click({ force: true });
        await lengthInput.fill('6');
        await lengthInput.blur();
        await page.waitForTimeout(500);
    } else {
        console.log('Contract length is not visible for this combination. Skipping.');
    }

    // Select start date (conditionally visible based on Payment Frequency)
    console.log('Selecting start date...');
    const startDateContainer = page.locator('div[aria-label="Contract Start Date "]').first();
    if (await startDateContainer.isVisible()) {
        await startDateContainer.click();
        await page.waitForTimeout(500);
        const dayCell = page.getByRole('gridcell').nth(15);
        if (await dayCell.isVisible()) {
            await dayCell.click();
        } else {
            await page.keyboard.press('ArrowDown');
            await page.waitForTimeout(100);
            await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(500);
    } else {
        console.log('Start date is not visible for this combination. Skipping.');
    }

    `;
    code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
    fs.writeFileSync('tests/employerJobPost.spec.ts', code);
    console.log('Fixed successfully!');
} else {
    console.log('Failed to find markers.');
}
