// Dependencies
const OsmParser = require('./OsmParser.js');
const OsmElement = require('./OsmElement.js');
const elementInteractionsTemplate = require('./elementInteractionsTemplate.js');

// Exports
module.exports = class OsmWrapper {

  constructor(lat, lon, latCoverage, lonCoverage, settings) {

    this.bounds = OsmWrapper.getBounds(lat, lon, latCoverage, lonCoverage);
    this.viewport = OsmWrapper.getViewport(settings);
    this.rect = {lat, lon, latCoverage, lonCoverage};
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

  async traverse(vel) {

    this.bounds.minLon -= vel.lon;
    this.bounds.maxLon -= vel.lon;
    this.bounds.minLat += vel.lat;
    this.bounds.maxLat += vel.lat;

    const {minLat, maxLat, minLon, maxLon} = this.bounds;
    const offX = this.viewport.w * vel.lon / (maxLon - minLon);
    const offY = this.viewport.h * vel.lat / (maxLat - minLat);

    this.offset.x += offX;
    this.offset.y += offY;
    await this.checkDataCenterVicinity();

  }

  async checkDataCenterVicinity(viewportW = this.viewport.w, viewportH = this.viewport.h) {

    if (this.downloadingMapData) return;
    const rThresh = Math.max(viewportW, viewportH) * 0.5;
    const [lon1, lat1] = this.currentDataCenter;
    const [lon2, lat2] = this.getCurrentDataCenter();
    const [x1, y1] = OsmElement.latLon2px(lat1, lon1, this.bounds, viewportW, viewportH);
    const [x2, y2] = OsmElement.latLon2px(lat2, lon2, this.bounds, viewportW, viewportH);
    const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    if (r > rThresh) await this.updateMapData();

  }

  async updateMapData(attempts = 3) {

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

        this.data = response;
        this.updateElements();
        this.offset = {x: 0, y: 0};
        this.downloadingMapData = false;
        this.currentDataCenter = this.getCurrentDataCenter();

      });

    } catch (err) {

      if (!attempts) {
        console.error("Map reload failure.", err);
        const unsafeCoverage = 0.0005;
        if (this.rect.latCoverage < unsafeCoverage) {
          console.warn("Your coverage may be too small to retrieve sufficient data.");
        } else {
          console.warn("Your coordinates may be out of bounds or at a location with no data.");
        }
        return null;
      }
      this.updateMapData(attempts - 1);

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

  setViewport(w = 1, h = 1) {

    this.viewport = {w, h};
    this.updateElements();

  }

  setElementRenderer(elementRenderer) {

    this.elementRenderer = elementRenderer;

  }

  getElementInteractionsTemplate() {

    return elementInteractionsTemplate;

  }

  minmax() {

    const result = {minX: false, maxX: false, minY: false, maxY: false, minLat: false, maxLat: false, minLon: false, maxLon: false};
    for (let el of this.elements) {
      for (let [x, y] of el.points) {
        if (!result.maxX || x > result.maxX) result.maxX = x;
        if (!result.minX || x < result.minX) result.minX = x;
        if (!result.maxY || y > result.maxY) result.maxY = y;
        if (!result.minY || y < result.minY) result.minY = y;
      }
      for (let [lat, lon] of el.latlonPoints) {
        if (!result.maxLat || lat > result.maxLat) result.maxLat = lat;
        if (!result.minLat || lat < result.minLat) result.minLat = lat;
        if (!result.maxLon || lon > result.maxLon) result.maxLon = lon;
        if (!result.minLon || lon < result.minLon) result.minLon = lon;
      }
    }
    return result;

  }

  log() {

    const logTemplate = {
      "Total Vertices": 0,
      "Landmarks": new Set(),
      "Streets": new Set(),
      "Coverage (km^2)": OsmElement.measureArea(this.bounds),
      "Request": this.parser.url
    };
    const summary = this.elements
      .reduce((acc, el) => {

        if (el.is("name")) {
          const name = el.info("name");
          if (el.is("highway")) {
            acc["Streets"].add(name);
          } else {
            acc["Landmarks"].add(name);
          }
        }
        acc["Total Vertices"] += el.points.length;
        return acc;

      }, logTemplate);
    summary["Streets"] = [...summary["Streets"]].join(", ");
    summary["Landmarks"] = [...summary["Landmarks"]].join(", ");
    console.table(summary);
    return summary;

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
