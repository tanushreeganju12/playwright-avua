const fs = require('fs');

let content = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf-8');

// Rename existing TC9 to TC10
content = content.replace(
  "test('TC9 Successful submission with minimum 3 years experience'",
  "test('TC10 Successful submission with minimum 3 years experience'"
);
content = content.replace(
  "--- TC9 TEST FINISHED SUCCESSFULLY ---",
  "--- TC10 TEST FINISHED SUCCESSFULLY ---"
);

// Find TC8 to duplicate it
const tc8Start = "test('TC8 Successful submission with Fixed Rate - Hourly payment frequency'";
const tc8End = "console.log('--- TC8 TEST FINISHED SUCCESSFULLY ---');\n  });";

const startIndex = content.indexOf(tc8Start);
const endIndex = content.indexOf(tc8End) + tc8End.length;

let tc8Content = content.substring(startIndex, endIndex);

// Modify TC8 content to be TC9 (Monthly)
let tc9Content = tc8Content
  .replace("test('TC8 Successful submission with Fixed Rate - Hourly payment frequency'", "test('TC9 Successful submission with Fixed Rate - Monthly payment frequency'")
  .replace("console.log('--- TC8 TEST FINISHED SUCCESSFULLY ---');", "console.log('--- TC9 TEST FINISHED SUCCESSFULLY ---');")
  .replace(/Hourly/g, "Monthly")
  .replace(/hourly/g, "monthly")
  .replace("click('Hourly'", "click('Monthly'") // just in case
  .replace("pressSequentially('50')", "pressSequentially('5000')")
  .replace("rate of USD 50 per month", "rate of USD 5000 per month") // Wait, the replace earlier changed 'hourly' to 'monthly', so '50 per hour' -> '50 per month'
  .replace("fill('6')", "fill('3')")
  .replace("15/01/2027", "15/10/2026")
  .replace("step3-success.png", "step3-success-tc9.png");

// Insert TC9 right before TC10
content = content.replace(
  "test('TC10 Successful submission with minimum 3 years experience'",
  tc9Content + "\n\n  test('TC10 Successful submission with minimum 3 years experience'"
);

fs.writeFileSync('tests/employerJobPost.spec.ts', content);
console.log('Successfully updated tests/employerJobPost.spec.ts');
