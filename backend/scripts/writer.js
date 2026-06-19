
const fs = require('fs');
const path = require('path');

// Encode content as base64 to avoid shell escaping
const makeTest = (filename, b64content) => {
  const content = Buffer.from(b64content, 'base64').toString('utf8');
  fs.writeFileSync(path.join(__dirname, filename), content, 'utf8');
  console.log('Created: ' + filename + ' (' + content.length + ' bytes)');
};

module.exports = { makeTest };
