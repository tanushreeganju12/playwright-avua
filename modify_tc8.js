const fs = require('fs');

let content = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf-8');

// Rename existing TC8 to TC9
content = content.replace(
  "test('TC8 Successful submission with minimum 3 years experience'",
  "test('TC9 Successful submission with minimum 3 years experience'"
);

// Find TC7 to duplicate it
const tc7Start = "test('TC7 Successful submission with Fixed Rate - Daily payment frequency'";
const tc7End = "console.log('--- TC7 TEST FINISHED SUCCESSFULLY ---');\n  });";

const startIndex = content.indexOf(tc7Start);
const endIndex = content.indexOf(tc7End) + tc7End.length;

let tc7Content = content.substring(startIndex, endIndex);

// Modify TC7 content to be TC8 (Hourly)
let tc8Content = tc7Content
  .replace("test('TC7 Successful submission with Fixed Rate - Daily payment frequency'", "test('TC8 Successful submission with Fixed Rate - Hourly payment frequency'")
  .replace("console.log('--- TC7 TEST FINISHED SUCCESSFULLY ---');", "console.log('--- TC8 TEST FINISHED SUCCESSFULLY ---');")
  .replace(/Daily/g, "Hourly")
  .replace(/daily/g, "hourly")
  .replace("pressSequentially('500')", "pressSequentially('50')")
  .replace("rate of USD 500 per day", "rate of USD 50 per hour");

// Insert TC8 right before TC9
content = content.replace(
  "test('TC9 Successful submission with minimum 3 years experience'",
  tc8Content + "\n\n  test('TC9 Successful submission with minimum 3 years experience'"
);

fs.writeFileSync('tests/employerJobPost.spec.ts', content);
console.log('Successfully updated tests/employerJobPost.spec.ts');
