const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CampusAdmin', 'ScheduleGeneration', 'ScheduleGeneration.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for common JSX syntax issues
  const lines = content.split('\n');
  
  console.log('Checking for syntax issues...\n');
  
  // Check for unclosed JSX expressions
  let openBraces = 0;
  let openParens = 0;
  let inJSX = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Count braces and parentheses
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j-1] : '';
      const nextChar = j < line.length - 1 ? line[j+1] : '';
      
      if (char === '{' && prevChar !== '\\') {
        openBraces++;
      } else if (char === '}' && prevChar !== '\\') {
        openBraces--;
      } else if (char === '(' && prevChar !== '\\') {
        openParens++;
      } else if (char === ')' && prevChar !== '\\') {
        openParens--;
      }
    }
    
    // Check for specific problematic patterns around line 1629
    if (lineNum >= 1625 && lineNum <= 1635) {
      console.log(`Line ${lineNum}: ${line}`);
      console.log(`  Open braces: ${openBraces}, Open parens: ${openParens}`);
    }
    
    // Check for incomplete JSX props
    if (line.includes('variant={') && !line.includes('}')) {
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      if (!nextLine.trim().includes('}')) {
        console.log(`Potential incomplete variant prop at line ${lineNum}: ${line.trim()}`);
      }
    }
  }
  
  console.log(`\nFinal counts - Open braces: ${openBraces}, Open parens: ${openParens}`);
  
  if (openBraces !== 0) {
    console.log(`ERROR: Unmatched braces! ${openBraces > 0 ? 'Missing closing braces' : 'Extra closing braces'}`);
  }
  
  if (openParens !== 0) {
    console.log(`ERROR: Unmatched parentheses! ${openParens > 0 ? 'Missing closing parentheses' : 'Extra closing parentheses'}`);
  }
  
} catch (error) {
  console.error('Error reading file:', error.message);
}