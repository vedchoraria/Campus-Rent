const fs = require('fs');
const path = require('path');

const testsDir = __dirname.replace('scripts', 'tests');

function writeFile(name, content) {
  const fp = path.join(testsDir, name);
  fs.writeFileSync(fp, content, 'utf8');
  console.log('Created: ' + name + ' (' + content.length + ' bytes)');
}

// We will fill this in via base64
const jobs = [];

if (process.argv[2]) {
  // Pass base64-encoded JSON array of {name, content}
  const data = JSON.parse(Buffer.from(process.argv[2], 'base64').toString('utf8'));
  for (const job of data) {
    writeFile(job.name, job.content);
  }
} else {
  console.log('Usage: node scripts/gen-tests.js <base64-encoded-json>');
}
