const fs = require('fs');
let code = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf8');
code = code.replace(/\/\/ Select contract engagement model\n\s+console\.log\('Selecting engagement model\.\.\.'\);\n\s+const fixedRateBtn = page\.getByText\('Fixed rate'\)\.first\(\);\n\s+await fixedRateBtn\.click\({ force: true }\);\n\s+await page\.waitForTimeout\(500\);/g, '');
fs.writeFileSync('tests/employerJobPost.spec.ts', code);
