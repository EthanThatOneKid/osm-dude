// Dependencies
const {createWriteStream: w} = require('fs');
const browserify = require('browserify');
const minify = require('minify-stream');

// Main Process
(async () => {

  const b = browserify();
  b.require('./index.js');

  b.bundle()
    .pipe(minify({sourceMap: false}))
    .pipe(w('./dist/bundle.js'));

})();
