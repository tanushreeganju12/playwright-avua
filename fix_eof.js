const fs = require('fs');
let code = fs.readFileSync('tests/employerJobPost.spec.ts', 'utf8');

// Remove the `});\n});\n` that occurs before TC8
code = code.replace("    console.log('--- TC7 TEST FINISHED SUCCESSFULLY ---');\n  });\n});\n\n  test('TC8", "    console.log('--- TC7 TEST FINISHED SUCCESSFULLY ---');\n  });\n\n  test('TC8");

fs.writeFileSync('tests/employerJobPost.spec.ts', code);
console.log('Fixed syntax error!');
