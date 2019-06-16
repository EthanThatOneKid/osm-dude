// Dependencies
const OsmParser = require('./OsmParser.js');
const OsmElement = require('./OsmElement.js');
const elementInteractionsTemplate = require('./elementInteractionsTemplate.js');

// Exports
module.exports = class OsmWrapper {

  constructor(lat, lon, latCoverage, lonCoverage, settings) {

    this.bounds = OsmWrapper.getBounds(lat, lon, latCoverage, lonCoverage);
    this.viewport = OsmWrapper.getViewport(settings);
    this.offset = {x: 0, y: 0};
    this.downloadingMapData = false;
    this.parser = new OsmParser(this.bounds);
    this.currentDataCenter = this.getCurrentDataCenter();
    this.elements;
    this.elementInteractions;
    this.elementRenderer;
    this.data;

  }

  async init(elementInteractions) {

    this.setFeatureData(elementInteractions);
    await this.updateMapData();

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
    const offX = this.viewport.w * vel.lon / (maxLon - minLon);
    const offY = this.viewport.h * vel.lat / (maxLat - minLat);

    this.offset.x += offX;
    this.offset.y += offY;
    this.checkDataCenterVicinity();

  }

  checkDataCenterVicinity(viewportW = this.viewport.w, viewportH = this.viewport.h) {

    if (this.downloadingMapData) return;
    const rThresh = Math.max(viewportW, viewportH) * 0.5;
    const [lon1, lat1] = this.currentDataCenter;
    const [lon2, lat2] = this.getCurrentDataCenter();
    const [x1, y1] = OsmElement.latLon2px(lat1, lon1, this.bounds, viewportW, viewportH);
    const [x2, y2] = OsmElement.latLon2px(lat2, lon2, this.bounds, viewportW, viewportH);
    const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    if (r > rThresh) this.updateMapData();

  }

  async updateMapData() {

    this.downloadingMapData = true;
    const lonPadding = 0.75 * (this.bounds.maxLon - this.bounds.minLon);
    const latPadding = 0.75 * (this.bounds.maxLat - this.bounds.minLat);

    try {

      await this.parser.action({
        minLat: this.bounds.minLat - latPadding,
        minLon: this.bounds.minLon - lonPadding,
        maxLat: this.bounds.maxLat + latPadding,
        maxLon: this.bounds.maxLon + lonPadding
      }, response => {

        console.log("Reloaded Map");
        this.data = response;
        this.updateElements();
        this.offset = {x: 0, y: 0};
        this.downloadingMapData = false;
        this.currentDataCenter = this.getCurrentDataCenter();

      });

    } catch (err) {

      console.error("Map Reload Failure", err);
      // this.bounds = {
      //   minLat: this.bounds.maxLat,
      //   maxLat: this.bounds.minLat,
      //   minLon: this.bounds.maxLon,
      //   maxLon: this.bounds.minLon
      // };
      this.updateMapData();

    }

  }

  updateElements() {

    this.elements = this.data.vectors
      .map(v => new OsmElement(v, this.bounds, this.viewport));

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

  setFeatureData(elementInteractions) {

    this.elementInteractions = elementInteractions || elementInteractionsTemplate;

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

    const elsUnderneathPlayer = this.getCollisions(player);
    return this.getElementInteractions(elsUnderneathPlayer);

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

  static getBounds(lat, lon, latCoverage, lonCoverage) {
    const isSquare = (!!latCoverage && !lonCoverage) || (latCoverage == lonCoverage);
    const latPadding = latCoverage * 0.5;
    const lonPadding = isSquare ? lonCoverage * 0.5 : 0;
    return {
      minLat: lat - latPadding,
      maxLat: lat + latPadding,
      minLon: lon - (isSquare ? latPadding : lonPadding),
      maxLon: lon + (isSquare ? latPadding : lonPadding)
    };
  }

  static getViewport(settings) {
    const isDefined = settings.hasOwnProperty("mapWidth") && settings.hasOwnProperty("mapHeight");
    return {
      w: isDefined ? settings.mapWidth : 1,
      h: isDefined ? settings.mapHeight : 1
    };
  }

}
