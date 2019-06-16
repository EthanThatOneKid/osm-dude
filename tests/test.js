// Dependencies
const MrWorldwide = require('./../index.js');
/* In Production: */ // const MrWorldwide = require('mr-worldwide');

// Constants
const [lat, lon] = [33.788346, -117.971118];
const padding = 0.000535;
const settings = {
  mapWidth: 1,
  mapHeight: 1
};

// Helpers

// Main Process
(async () => {

  const osm = new MrWorldwide(lat, lon, padding, null, settings);
  await osm.init();
  console.log(osm.getMapData());

})();
