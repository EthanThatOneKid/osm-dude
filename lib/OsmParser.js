// Dependencies
const fs = require('fs');
const fetch = require('node-fetch');
const {parseString: xmlParser} = require('xml2js');

// Exports
module.exports = class OsmParser {

  constructor(coords) {

    this.coords = coords;
    this.url = this.createUrl();
    this.data;

  }

  async action(coords, fn) {

    this.updateCoords(coords);
    const response = await this.fetch(this.url);
    this.data = this.parseOsm(response);
    if (fn) {
      fn(this.data);
    }

  }

  async fetch(url = this.url) {

    let result;
    const response = await fetch(this.url);
    const xml = await response.text();
    xmlParser(xml, (err, res) => result = res);
    if (!result) return xml;
    return result;

  }

  parseOsm(res) {

    const result = {vectors: []};
    const nodeLookup = {};

    result["bounds"] = Object.entries(res.osm.bounds[0].$)
      .reduce((acc, [k, v]) => {

        acc[k] = Number(v);
        return acc;

      }, {});

    for (let node of res.osm.node) {

      const {id, lat, lon} = node.$;
      nodeLookup[id] = {lat, lon};

    }

    for (let way of res.osm.way) {

      let meta = {};
      if (way.tag) {
        meta = way.tag
          .reduce((acc, cur) => {

            const {k, v} = cur.$;
            acc[k] = v;
            return acc;

          }, {});
      }

      const nodes = way.nd
        .reduce((acc, cur) => {

          const {lat, lon} = nodeLookup[cur.$.ref];
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
