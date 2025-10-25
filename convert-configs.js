const fs = require('fs');
const path = require('path');

// List of common config files to convert
const configFiles = [
  'next.config.ts',
  'tailwind.config.ts',
  'postcss.config.ts',
  'eslint.config.ts',
];

// Regex patterns to remove TypeScript-only syntax
const patterns = [
  /import type .*?;/g,                // remove type imports
  /: \w+(\<.*?\>)?/g,                // remove type annotations
  /\/\/\/ <reference.*?>/g,          // remove triple-slash refs
];

// Convert .ts config files to .mjs
configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove TS-only syntax
    patterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });

    // Replace module.exports if needed
    content = content.replace(/module\.exports\s*=\s*/, 'export default ');

    // Write to .mjs
    const newFilePath = filePath.replace(/\.ts$/, '.mjs');
    fs.writeFileSync(newFilePath, content, 'utf8');
    console.log(`Converted ${file} → ${path.basename(newFilePath)}`);
  }
});

console.log('All config files converted to .mjs for Vercel.');
