const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const response = await page.goto('https://demo.avua.online/contact-us');
  if (response && response.status() === 200) {
     console.log('Successfully loaded contact-us page');
     const formHTML = await page.evaluate(() => {
         const form = document.querySelector('form');
         if (form) return form.innerHTML;
         return document.body.innerHTML.substring(0, 5000);
     });
     console.log('FORM HTML:', formHTML);
  } else {
     console.log('Failed to load. Status:', response ? response.status() : 'unknown');
  }
  
  await browser.close();
})();
