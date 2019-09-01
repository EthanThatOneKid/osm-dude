// Dependencies
const OsmDude = require('./../../index.js');
/* In Production: */ // const OsmDude = require('osm-dude');

// Helper
const rndLocation = () => {
  const minLat = 33.878368, maxLat = 33.888283,
        minLon = -117.890531, maxLon = -117.880808;
  return [
    Math.random() * (maxLat - minLat) + minLat,
    Math.random() * (maxLon - minLon) + minLon
  ];
};

// Constants
const [lat, lon] = rndLocation();
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
