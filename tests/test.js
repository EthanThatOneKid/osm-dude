// Dependencies
const OsmDude = require('./../index.js');
/* In Production: */ // const MrWorldwide = require('osm-dude');

// Constants
const [lat, lon] = [33.788346, -117.971118];
const padding = 0.001;
const settings = {
  mapWidth: 1,
  mapHeight: 1
};

// Helpers

// Main Process
(async () => {

  const osm = new OsmDude(lat, lon, padding, null, settings);
  await osm.init();
  osm.log();

})();
