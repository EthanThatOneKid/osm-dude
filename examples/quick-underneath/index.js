// Dependencies
const OsmDude = require('./../../index.js');
/* In Production: */ // const OsmDude = require('osm-dude');

// Constants
const MAGLNOLIA_PARK = [33.797097, -117.97471];

// Globals
const [lat, lon] = MAGLNOLIA_PARK;


const tests = [
  `Getting data from (${lat}, ${lon})`
];

// Main Process
(async () => {

  console.time(tests[0]);
  const collisions = await OsmDude.peek(lat, lon);
  console.timeEnd(tests[0]);

  console.log(
    collisions.map(el => el.rawData.meta)
  );

})();
