// Dependencies
const OsmParser = require('./OsmParser.js');
const OsmElement = require('./OsmElement.js');
const elementInteractionsTemplate = require('./elementInteractionsTemplate.js');

// Exports
module.exports = class OsmEnvironment {

  constructor(bounds, viewport) {

    this.bounds = bounds;
    this.viewport = viewport;
    this.offset = {x: 0, y: 0};
    this.downloadingMapData = false;
    this.parser = new OsmParser(this.bounds);
    this.currentDataCenter = this.getCurrentDataCenter();
    this.elements;
    this.elementInteractions;
    this.elementRenderer;
    this.featureIcons;
    this.data;

  }

  init(elementInteractions, icons) {

    this.setFeatureData(elementInteractions, icons);
    this.updateMapData();

  }

  isReady() {

    return !!this.data;

  }

  render() {
    
    this.elements.forEach(el => this.elementRenderer(el, this.offset));

  }

  traverse(vel) {

    this.bounds.minLon -= vel.lon;
    this.bounds.maxLon -= vel.lon;
    this.bounds.minLat += vel.lat;
    this.bounds.maxLat += vel.lat;

    const {minLat, maxLat, minLon, maxLon} = this.bounds;
    const off_x = this.viewport.w * (vel.lon) / (maxLon - minLon);
    const off_y = this.viewport.h * (vel.lat) / (maxLat - minLat);

    this.offset.x += off_x;
    this.offset.y += off_y;
    this.checkDataCenterVicinity();

  }

  checkDataCenterVicinity(viewportW = this.viewport.w, viewportH = this.viewport.h) {

    if (this.downloadingMapData) return;
    const thresh_r = (viewportW > viewportH) ? viewportH * 0.5 : viewportW * 0.5;
    const [lon1, lat1] = this.currentDataCenter;
    const [lon2, lat2] = this.getCurrentDataCenter();
    const [x1, y1] = OsmEnvironment.latLon2px(lat1, lon1, this.bounds, viewportW, viewportH);
    const [x2, y2] = OsmEnvironment.latLon2px(lat2, lon2, this.bounds, viewportW, viewportH);
    const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    if (r > thresh_r) this.updateMapData();

  }

  updateMapData() {

    this.downloadingMapData = true;
    const lon_padding = 0.75 * (this.bounds.maxLon - this.bounds.minLon);
    const lat_padding = 0.75 * (this.bounds.maxLat - this.bounds.minLat);

    try {

      this.parser.action({
        minLat: this.bounds.minLat - lat_padding,
        minLon: this.bounds.minLon - lon_padding,
        maxLat: this.bounds.maxLat + lat_padding,
        maxLon: this.bounds.maxLon + lon_padding
      }, (response) => {

        console.log("Reloaded Map");
        this.data = response;
        this.updateElements();
        this.offset = {x: 0, y: 0};
        this.downloadingMapData = false;
        this.currentDataCenter = this.getCurrentDataCenter();

      });

    } catch (err) {

      console.error("Map Reload Failure...");
      this.updateMapData();

    }

  }

  updateElements() {

    this.elements = this.data.vectors
      .map(v => {

        const el = new OsmElement(v, this.bounds, this.viewport);
        const featureIconKey = el.isSome(Object.keys(this.featureIcons));
        if (this.featureIcons.hasOwnProperty(featureIconKey)) {
          el.setIcon(this.featureIcons[featureIconKey]);
        }
        return el;

    });

  }

  getCollisions(player) {

    const x = player.x - this.offset.x,
          y = player.y - this.offset.y;
    return this.elements
      .reduce((result, el) => {

        if (el.inside(x, y)) {
          result.push(el);
        }
        return result;

      }, []);

  }

  getCurrentDataCenter() {

    const w = this.bounds.maxLon - this.bounds.minLon;
    const h = this.bounds.maxLat - this.bounds.minLat;
    const center = [
      w * 0.5 + this.bounds.minLon,
      h * 0.5 + this.bounds.minLat
    ];
    return center;

  }

  setFeatureData(elementInteractions, icons) {

    this.elementInteractions = elementInteractions;
    if (icons) {
      this.featureIcons = icons;
    }

  }

  getElementInteractions(els) {

    return els.reduce((result, el) => {

      return result.concat(Object.keys(this.elementInteractions)
        .filter(feature => el.is(feature))
        .reduce((subfeatures, feature) => {

          for (let subfeature of Object.keys(this.elementInteractions[feature])) {

            if (el.is(subfeature)) {
              if (this.elementInteractions[feature][subfeature] != null) {
                subfeatures.push({
                  name: el.info("name"),
                  type: subfeature,
                  ...this.elementInteractions[feature][subfeature]
                });
              }
            }

          }
          return subfeatures;

        }, []));

    }, []);

  }

  checkUnderneath(player) {

    const els_underneath_player = this.getCollisions(player);
    return this.getElementInteractions(els_underneath_player);

  }

  getMapData() {

    return this.data;

  }

  getElements() {

    return this.elements;

  }

  setBounds(bounds) {

    const {minLat, minLon, maxLat, maxLon} = bounds;
    this.bounds = {minLat, minLon, maxLat, maxLon};
    this.updateElements();

  }

  setViewport(w, h) {

    this.viewport = {w, h};
    this.updateElements();

  }

  setElementRenderer(elementRenderer) {

    this.elementRenderer = elementRenderer;

  }

  getElementInteractionsTemplate() {

    return elementInteractionsTemplate;

  }

  static latLon2px(lat, lon, bounds, w, h) {

    const {minLat, minLon, maxLat, maxLon} = bounds;
    const x = (lon - minLon) / (maxLon - minLon) * w;
    const y = (lat - maxLat) / (minLat - maxLat) * h;
    return [x, y];

  }

}
