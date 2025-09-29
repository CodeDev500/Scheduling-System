// Simple syntax checker for JSX
const fs = require('fs');

const filePath = 'src/pages/CampusAdmin/ScheduleGeneration/ScheduleGeneration.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Check for common JSX syntax issues
let openBraces = 0;
let openParens = 0;
let inJSX = false;
let lineNumber = 1;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const nextChar = content[i + 1];
  
  if (char === '\n') {
    lineNumber++;
  }
  
  if (char === '{' && !inJSX) {
    openBraces++;
  } else if (char === '}' && !inJSX) {
    openBraces--;
  }
  
  if (char === '(' && !inJSX) {
    openParens++;
  } else if (char === ')' && !inJSX) {
    openParens--;
  }
  
  // Check for JSX comments
  if (char === '{' && nextChar === '/' && content[i + 2] === '*') {
    if (openBraces !== 0 || openParens !== 0) {
      console.log(`Potential syntax error before line ${lineNumber}: Unclosed braces or parentheses`);
      console.log(`Open braces: ${openBraces}, Open parens: ${openParens}`);
    }
  }
}

console.log('Syntax check completed');
console.log(`Final counts - Open braces: ${openBraces}, Open parens: ${openParens}`);