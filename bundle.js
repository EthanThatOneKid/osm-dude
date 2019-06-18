// Dependencies
const {writeFileSync: w} = require('fs');
const browserify = require('browserify');

// Helpers
const streamToString = stream => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

// Main Process
(async () => {

  const b = browserify();
  b.add('./index.js');

  const stream = b.bundle();
  const result = await streamToString(stream);

  w('./dist/bundle.js', result);

})();
