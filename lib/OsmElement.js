// Exports
module.exports = class OsmElement {

  constructor(rawData, bounds, viewport) {

    this.rawData = rawData;
    this.bounds = bounds;
    this.viewport = viewport;
    this.latlonPoints;
    this.points;
    this.center;
    this.meta;
    this.init();

  }

  init() {

    this.dimType();
    this.dimPoints();

  }

  dimPoints() {

    this.latlonPoints = [];
    this.points = [];
    for (let [lat, lon] of this.rawData.nodes) {

      this.latlonPoints.push([lat, lon]);
      const gimmePoint = OsmElement.latLon2px(lat, lon, this.bounds, this.viewport.w, this.viewport.h);
      this.points.push(gimmePoint);

    }
    this.getCenter();

  }

  dimType() {

    this.meta = new Set();
    for (let [k, v] of Object.entries(this.rawData.meta)) {

      this.meta.add(k).add(v);

    }

  }

  getCenter() {

    const size = this.points.length;
    const sum = this.points
      .reduce((acc, cur) => {

        acc[0] += cur[0];
        acc[1] += cur[1];
        return acc;

      }, [0, 0]);
    this.center = sum.map(scaler => scaler / size);

  }

  getPoints() {

    return this.points;

  }

  is(q) {

    return this.meta.has(q);

  }

  isSome(qs) {

    for (let q of qs) {

      if (this.is(q)) {
        return q;
      }

    }

  }

  info(q) {

    return this.rawData.meta[q];

  }

  isInside(x, y) {

    // pnpoly algorithm
    let inside = false;
    for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {

      const xi = this.points[i][0], yi = this.points[i][1];
      const xj = this.points[j][0], yj = this.points[j][1];
      const intersect = ((yi > y) != (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }

    }
    return inside;

  }

  setViewport(w, h) {

    this.viewport = {w, h};
    this.dimPoints();

  }

  setBounds(bounds) {

    const {minLat, minLon, maxLat, maxLon} = bounds;
    this.bounds = {minLat, minLon, maxLat, maxLon};
    this.dimPoints();

  }

  static latLon2px(lat, lon, bounds, w, h) {

    // TODO: this is inaccurate. rethink the proportion equation pls
    // for (let [k, v] of Object.entries(bounds)) {
    //   bounds[k] = Math.abs(v);
    // }
    // lat = Math.abs(lat);
    // lon = Math.abs(lon);
    const {minLat, minLon, maxLat, maxLon} = bounds;
    // const horizontalPercent = (Math.max(lon, minLon) - Math.min(lon, minLon)) / (Math.max(maxLon, minLon) - Math.min(maxLon, minLon)),
    //       verticalPercent =   (Math.max(lat, minLat) - Math.min(lat, minLat)) / (Math.max(maxLat, minLat) - Math.min(maxLat, minLat));
    // const x = horizontalPercent * w;
    // const y = verticalPercent * h;
    const x = (lon - minLon) / (maxLon - minLon) * w;
    const y = (lat - maxLat) / (minLat - maxLat) * h;
    return [x, y];

  }

  static measureDist(bounds) {

    const {minLat: lat1, minLon: lon1, maxLat: lat2, maxLon: lon2} = bounds;
    const R = 6378.137; // Radius of Earth in KM
    const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // KM
    return d;

  }

  static measureArea(bounds) {

    const dLon = OsmElement.measureDist({
      minLat: bounds.minLat, maxLat: bounds.minLat,
      minLon: bounds.minLon, maxLon: bounds.maxLon
    });
    const dLat = OsmElement.measureDist({
      minLat: bounds.minLat, maxLat: bounds.maxLat,
      minLon: bounds.minLon, maxLon: bounds.minLon
    });
    return dLat * dLon;

  }

}
