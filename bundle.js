// Dependencies
const fs = require('fs');
const browserify = require('browserify');
const minify = require('minify-stream');

// Globals
const {version} = JSON.parse(fs.readFileSync('./package.json'));
const savePaths = [
  `./dist/bundle.${version}.js`,
  './dist/bundle.latest.js'
];

// Main Process
(async () => {

  const b = browserify();
  b.require('./index.js', {expose: 'osm-dude'});

  for (let savePath of savePaths) {
    b.bundle()
      .pipe(minify({sourceMap: false}))
      .pipe(fs.createWriteStream(savePath));
  }

})();
