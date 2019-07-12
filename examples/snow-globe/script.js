// Dependencies
const OsmDude = require('osm-dude');

// Constants
let lat, lon;
const padding = 0.001;
const radius = 150;
const settings = {
  mapWidth: 25,
  mapHeight: 25
};

// Globals
const cnv = document.querySelector('.zdog-canvas');
cnv.style.width = "100%";
cnv.style.height = "100%";

// Main Illustration
let illo = new Zdog.Illustration({
  element: '.zdog-canvas',
  dragRotate: true
});

// Base
new Zdog.Ellipse({
  addTo: illo,
  diameter: radius * 2,
  stroke: 5,
  rotate: {x: Math.PI / 2},
  translate: {y: 5},
  fill: true,
  color: '#9b7'
});

// Dome
new Zdog.Hemisphere({
  addTo: illo,
  diameter: radius * 2,
  fill: false,
  stroke: 5,
  rotate: {x: Math.PI / 2},
  translate: {y: 5},
  color: '#103',
  backface: '#103',
});

// Main Process
const main = (async () => {

  const osm = new OsmDude(lat, lon, padding, null, settings);
  await osm.init();

  osm.setElementRenderer(el => {

    let col = "#000";
    let points = el.points
      .map(([x, z]) => {
        const y = 0;
        return {line: {x, y, z}};
      })
      .filter(({line}) => {
        const distFromCenter = Math.sqrt((line.z * line.z) + (line.x * line.x));
        return distFromCenter < radius;
      });

    if (el.is("highway")) {

      points = points
        .map(({line}) => {
          const {x, z} = line;
          return {line: {x, z, y: -5}};
        });
      new Zdog.Shape({
        addTo: illo,
        path: points,
        stroke: 5,
        fill: true,
        color: col
      });

    } else if (el.isSome(["leisure", "landuse"])) {

      col = "#296";
      new Zdog.Shape({
        addTo: illo,
        path: points,
        stroke: 5,
        fill: true,
        color: col
      });

    } else if (el.is("building")) {

      const buildingHeight = -20;
      col = "#636";

      for (let i = 0; i < points.length; i++) {
        const {line: currPoint} = points[i];
        const {line: nextPoint} = points[(i + 1) % (points.length)];
        new Zdog.Shape({
          addTo: illo,
          path: [
            {line: {x: currPoint.x, y: 0, z: currPoint.z}},
            {line: {x: nextPoint.x, y: 0, z: nextPoint.z}},
            {line: {x: nextPoint.x, y: buildingHeight, z: nextPoint.z}},
            {line: {x: currPoint.x, y: buildingHeight, z: currPoint.z}}
          ],
          stroke: 5,
          fill: true,
          color: col
        });
      }

    }

  });

  osm.render();

  const animate = () => {
    illo.updateRenderGraph();
    requestAnimationFrame(animate);
  };
  animate();

});

navigator.geolocation.getCurrentPosition(pos => {
  lat = pos.coords.latitude;
  lon = pos.coords.longitude;
  main();
});
