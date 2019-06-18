// Dependencies
const browserify = require('browserify');

// Main Process
(() => {

  const b = browserify();
  b.add('./index.js');
  const stream = b.bundle();
  console.log(stream);

})();
