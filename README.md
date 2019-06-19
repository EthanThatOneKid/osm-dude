# 🌐 OSM Dude

[![GitHub forks](https://img.shields.io/github/forks/EthanThatOneKid/osm-dude.svg?style=social&label=Fork)](https://github.com/EthanThatOneKid/osm-dude/fork)
[![GitHub stars](https://img.shields.io/github/forks/EthanThatOneKid/osm-dude.svg?style=social&label=Star)][github]
[![bundle size](https://img.shields.io/bundlephobia/min/osm-dude.svg)][npmpkg]
[![npm downloads](https://img.shields.io/npm/dt/osm-dude.svg)][npmpkg]

> Tiny OSM (Open Street Maps) API wrapper

## 👇 Installation

#### 💚 Node
`npm i osm-dude`

#### ⚡ Browser
`<script src="https://combinatronics.com/EthanThatOneKid/osm-dude/master/dist/bundle.js"></script>``

## 🛠 Usage
`const OsmDude = require('osm-dude');`

## 🌟 Initialization
```
const osm = new OsmDude(
  lat, // float center latitude value
  lon, // float center longitude value
  latCoverage, // float total distance across latitude value
  lonCoverage, // float total distance across longitude value; optional
  {
    mapWidth, // value to map the coordinate boundaries to in the x-dimension; defaults to 1
    mapHeight // value to map the coordinate boundaries to in the y-dimension; defaults to 1
  } // settings
);

osm.init();
```
> 💡 Pro-tip: Utilize the [test file](tests/test.js) as an example

## 📃 Documentation
### `init(elementInteractions)`
* where `elementInteractions` is a customizable interface for programs that wish to run with more detailed Open Street Map functionality; optional.
* `elementInteractions` can also be set later on by calling [`setFeatureData`](#setfeaturedataelementinteractions)).
* asynchronous; returns once instance has been initialized.
* returns nothing.
### `isReady()`
* returns `true` if any OSM data has been loaded.
* returns `false` if no OSM data has been loaded.
### `render()`
* renders each element according to the customizable, optional element renderer declared in [`setElementRenderer`](#setelementrendererelementrenderer).
* returns nothing.
### `traverse(vel)`
* where `vel` is an object of keys `lat` and `lon` which represent the distance desired to travel to a new coordinate.
* asynchronous; returns once incoming data has been accounted for.
* returns nothing.
### `getCollisions(player)`
* where `player` is a supposed object of keys `x` and `y` representing a relative position within the mapped bounds of the `MrWorldwide` instance.
* returns an array of `OsmElement` instances which overlap with the player's 2d position.
### `setFeatureData(elementInteractions)`
* where `elementInteractions` is a detailed object that helps your program know what to do based on an occurring landmark or what-have-you.
* an example sheet can be found [here](lib/elementInteractionsTemplate.js).
* returns nothing.
### `getElementInteractions(els)`
* where `els` is an array of `OsmElement` instances; intended to be used in conjunction with the result of [`getCollisions`](#getcollisionsplayer).
* returns the data specified in the pre-defined element interactions from [`setFeatureData`](#setfeaturedataelementinteractions).
### `checkUnderneath(player)`
* where `player` is a supposed object of keys `x` and `y` representing a relative position within the mapped bounds of the `MrWorldwide` instance.
* this is an alias who's input acts as [`getCollisions`](#getcollisionsplayer)'s and who's output acts as [`getElementInteractions`](#getelementinteractionsels)'s.
* therefore, shares the same input convention as [`getCollisions`](#getcollisionsplayer) and the same output convention as [`getElementInteractions`](#getelementinteractionsels).
* returns all of the element interactions of all of the elements physically overlapping the player's coordinates.
### `getMapData()`
* returns the data parsed from the Open Street Map API's response.
### `getElements()`
* returns an array of `OsmElement` instances.
### `setBounds(bounds)`
* where `bounds` is an object of keys `minLat`, `minLon`, `maxLat`, and `maxLon`.
* returns nothing.
### `setViewport(w, h)`
* where `w` and `h` are the respective `mapWidth` and `mapHeight` values from the [initialization example](#-initialization).
* returns nothing.
### `setElementRenderer(elementRenderer)`
* where `elementRenderer` is a function that takes arguments `el` and `offset`. `el` is an `OsmElement` instance and `offset` is an object of keys `x` and `y` which represents the mapped distance from the center traversed without reloading. If [`traverse`](#traversevel) has never been called, `offset` is negligible.
* intended to render to a visual representation of all the elements of the loaded map. Some visual frameworks can be found [here](https://github.com/EthanThatOneKid/links#-visual).
* returns nothing.
### `getElementInteractionsTemplate()`
* returns an element interactions template as seen [here](lib/elementInteractionsTemplate.js).
### `log()`
* intended for debugging purposes.
* prints to the console a summary of the data within the `MrWorldwide` instance.
* returns an object that represents the summary printed to the console.

## 📚 Reference
* [Amenities List](https://wiki.openstreetmap.org/wiki/Key:amenity)
* [Map Features List](https://wiki.openstreetmap.org/wiki/Map_Features)
* [OSM API Response Example](https://api.openstreetmap.org/api/0.6/map?bbox=11.54,48.14,11.543,48.145)

## 📜 License
Contains information from [OpenStreetMap](https://www.openstreetmap.org/) which is made available under the [Open Database License](http://opendatacommons.org/licenses/odbl/1.0/). Any rights in individual contents of the database are licensed under the [Database Contents License](http://opendatacommons.org/licenses/dbcl/1.0/).

---

Engineered with 💖 by [@EthanThatOneKid](https://github.com/EthanThatOneKid)

[npmpkg]: https://www.npmjs.com/package/osm-dude
[github]: https://github.com/EthanThatOneKid/osm-dude
