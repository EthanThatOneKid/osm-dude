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
const tests = [
  `Initializing OsmDude of bound ${padding}`
];

// Main Process
(async () => {

  const osm = new OsmDude(lat, lon, padding, null, settings);

  console.time(tests[0]);
  await osm.init();
  console.timeEnd(tests[0]);

  osm.log();

})();
