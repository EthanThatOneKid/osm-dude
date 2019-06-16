// Dependencies
const MrWorldwide = require('./../index.js');
// /* In Production: */ const MrWorldwide = require('mr-worldwide');

// Constants
const [lat, lon] = [33.788301, -117.97106];
const padding = 0.00001;
const boundingBoxCoords = {
  minLat: lat - padding,
  maxLat: lat + padding,
  minLon: lon - padding,
  maxLon: lon + padding
};
const boundingBoxPixels = {w: 1, h: 1};

// Helpers

// Main Process
(() => {

  const osm = new MrWorldwide(boundingBoxCoords, boundingBoxPixels);
  console.log(osm);

})();
