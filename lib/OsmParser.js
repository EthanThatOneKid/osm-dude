const fs = require('fs');
const fetch = require('node-fetch');
const xml_parser = require('xml2js').parseString;

// API URL: https://api.openstreetmap.org/api/0.6/map?bbox=11.54,48.14,11.543,48.145

module.exports = class OsmParser {

  constructor(coords) {
    this.coords = coords;
    this.url = this.createUrl();
    this.data;
  }

  async action(coords, fn) {
    this.updateCoords(coords);
    const start = new Date().valueOf();
    const response = await this.fetch(this.url);
    this.data = this.parseOsm(response);
    if (fn) fn(this.data);
    return new Date().valueOf() - start;
  }

  async fetch(url = this.url) {
    let result;
    const response = await fetch(this.url);
    const xml = await response.text();
    xml_parser(xml, (err, res) => result = res);
    if (!result) return xml;
    return result;
  }

  parseOsm(res) {
    const result = {vectors: []};
    const node_lookup = {};

    result["bounds"] = Object.entries(res.osm.bounds[0].$).reduce((acc, [k, v]) => {
      acc[k] = Number(v);
      return acc;
    }, {});

    for (let node of res.osm.node) {
      const {id, lat, lon} = node.$;
      node_lookup[id] = {lat, lon};
    }

    for (let way of res.osm.way) {

      let meta = {};
      if (way.tag) {
        meta = way.tag.reduce((acc, cur) => {
          const {k, v} = cur.$;
          acc[k] = v;
          return acc;
        }, {});
      }

      const nodes = way.nd.reduce((acc, cur) => {
        const {lat, lon} = node_lookup[cur.$.ref];
        acc.push([Number(lat), Number(lon)]);
        return acc;
      }, []);

      result.vectors.push({meta, nodes});
    }

    return result;
  }

  createUrl() {
    const {minLat, minLon, maxLat, maxLon} = this.coords;
    return "https://api.openstreetmap.org/api/0.6/map?bbox=" +
           `${minLon},${minLat},${maxLon},${maxLat}`;
  }

  updateCoords(coords) {
    this.coords = coords;
    this.url = this.createUrl();
  }

}
