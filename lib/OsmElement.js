module.exports = class OSM_Element {

  constructor(gimme_sum_o_dat_raw_data, bounds, viewport) {
    this.raw_data = gimme_sum_o_dat_raw_data;
    this.bounds = bounds;
    this.viewport = viewport;
    this.renderer;
    this.latlon_points;
    this.points;
    this.center;
    this.meta;
    this.icon;
    this.init();
  }

  init() {
    this.dimType();
    this.dimPoints();
    this.dimRenderer();
  }

  dimRenderer() {
    // ARGS:
    // s [p5 instance],
    // points [current points of el],
    // offset [offset of parent OSM_Environment]
    this.renderer = new OSM_Element_Renderer(this);
  }

  dimPoints() {
    this.latlon_points = [], this.points = [];
    for (let node of this.raw_data.nodes) {
      this.latlon_points.push(node);
      this.points.push(latLon2px(
        node[0], node[1],
        this.bounds, this.viewport.w, this.viewport.h
      ));
    };
    this.getCenter();
  }

  dimType() {
    this.meta = new Set();
    for (let [k, v] of Object.entries(this.raw_data.meta)) {
      this.meta.add(k);
      this.meta.add(v);
    }
  }

  render(s, points, offset) {
    this.renderer.render(s, points, offset);
    if (this.icon) {
      const [x, y] = this.center;
      s.image(this.icon, x + offset.x, y + offset.y, 25, 25);
    }
  }

  getCenter(offset = {x: 0, y: 0}) {
    const size = this.points.length;
    const sum = this.points.reduce((acc, cur) => {
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
    for (let q of qs) if (this.is(q)) return q;
  }

  info(q) {
    return this.raw_data.meta[q];
  }

  inside(x, y) {
    // code based on pnpoly algorithm
    let inside = false;
    for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
      const xi = this.points[i][0], yi = this.points[i][1];
      const xj = this.points[j][0], yj = this.points[j][1];
      const intersect = ((yi > y) != (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
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

  setIcon(icon) {
    this.icon = icon;
  }

}
