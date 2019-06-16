// Dependencies
const MrWorldwide = require('./../index.js');
/* In Production: */ // const MrWorldwide = require('mr-worldwide');

// Constants
const [lat, lon] = [33.788346, -117.971118];
const padding = 0.000535;
const boundingBoxCoords = {
  minLat: lat - padding,
  maxLat: lat + padding,
  minLon: lon - padding,
  maxLon: lon + padding
};
const boundingBoxPixels = {w: 1, h: 1};

// Helpers

// Main Process
(async () => {

  const osm = new MrWorldwide(boundingBoxCoords, boundingBoxPixels);
  await osm.init();
  console.log(osm.getMapData());

})();
