function WGS84ToUTM(lat, lon) {
  proj4.defs([
    ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"],
    ["EPSG:32633", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"],
  ]);
  lon = parseFloat(lon);
  lat = parseFloat(lat);
  const [easting, northing] = proj4("EPSG:4326", "EPSG:32633", [lon, lat]);
  return [easting, northing];
}

function UTMToWGS84(easting, northing) {
  proj4.defs([
    [
      "EPSG:25833",
      "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    ],
    ["EPSG:4258", "+proj=longlat +ellps=GRS80 +no_defs"],
  ]);
  easting = parseFloat(easting);
  northing = parseFloat(northing);
  const [lon, lat] = proj4("EPSG:25833", "EPSG:4258", [easting, northing]);
  return [lat, lon];
}
// EPSG 3857 (Web Mercator) to EPSG 4326 (WGS 84)
function webMercatorToWGS84(lat, lon) {
    
  const e_value = 2.7182818284;
  const X = 20037508.34;
  const lat3857 = lat;
  const long3857 = lon;
  
  //converting the longitute from epsg 3857 to 4326
  const long4326 = (long3857*180)/X;
  
  //converting the latitude from epsg 3857 to 4326 split in multiple lines for readability        
  let lat4326 = lat3857/(X / 180);
  const exponent = (Math.PI / 180) * lat4326;
  
  lat4326 = Math.atan(Math.pow(e_value, exponent));
  lat4326 = lat4326 / (Math.PI / 360); // Here is the fixed line
  lat4326 = lat4326 - 90;

  return [lat4326, long4326];
  
}

// EPSG 4326 (WGS 84) to EPSG 3857 (Web Mercator)
function wgs84ToWebMercator(lat, lon) {
  const X = 20037508.34;
  let long3857 = (lon * X) / 180;
  let lat3857 = parseFloat(lat) + 90;
  lat3857 = lat3857 * (Math.PI/360);
  lat3857 = Math.tan(lat3857);
  lat3857 = Math.log(lat3857);
  lat3857 = lat3857 / (Math.PI / 180);
  lat3857 = (lat3857 * X) / 180;
  return [lat3857, long3857];
}


function getZoomLevel(radius) {
  let zoomLevel;
  if (radius > 0) {
    let radiusElevated = radius;
    let scale = radiusElevated / 500.0;
    zoomLevel = 18 - Math.log(scale) / Math.log(2);
  }
  zoomLevel = parseFloat(zoomLevel.toFixed(2));
  return zoomLevel;
}

function getRadiusForZoomLevel(zoomLevel) {
  let scale = Math.pow(2, 18 - zoomLevel);
  let radiusElevated = scale * 500;
  let radius = radiusElevated - radiusElevated / 2;
  return radius;
}


function bboxToLatLonZoom(minlon, minlat, maxlon, maxlat) {
  const lon = (Number(minlon) + Number(maxlon)) / 2.0;
  const lat = (Number(minlat) + Number(maxlat)) / 2.0;
  const part = (Number(maxlat) - Number(minlat)) / 360.0;
  const height = screen.availHeight;
  const tile_part = (part * 256) / height;
  const zoom = Math.log(tile_part) / Math.log(0.5); //0.5^zoom=part
  return [lat, lon, zoom];
}
// -180 < lon < 180
function normalizeLon(lon) {
  return ((((Number(lon) + 180) % 360) + 360) % 360) - 180;
}

function latLonZoomToBbox(lat, lon, zoom) {
  const tile_part = Math.pow(0.5, zoom);
  const part = (tile_part * screen.availHeight) / 256;
  const minlon = Number(lon) - (360 * part) / 2;
  const maxlon = Number(lon) + (360 * part) / 2;
  const minlat = Number(lat) - (180 * part) / 2;
  const maxlat = Number(lat) + (180 * part) / 2;
  return [minlon, minlat, maxlon, maxlat];
}

const CAMPER_CATEGORY = "Camper";
const CYCLING_CATEGORY = "Cycling";
const MISC_CATEGORY = "Misc";
const OSM_CATEGORY = "OpenStreetMap";
const OUTDOOR_CATEGORY = "Outdoor";
const POI_CATEGORY = "POI";
const ROUTER_CATEGORY = "Router";
const SATELLITE_CATEGORY = "Satellite";
const TOOLS_CATEGORY = "Tools";
const WEATHER_CATEGORY = "Weather, Science";
const WINTER_CATEGORY = "Winter";
const WATER_CATEGORY = "Water";

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    if (typeof x == "string") {
      x = ("" + x).toLowerCase();
    }
    if (typeof y == "string") {
      y = ("" + y).toLowerCase();
    }
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

const maps_raw = [
  {
    // https://opencampingmap.org/#15/47.4777/15.7536/0/0
    name: "OpenCamping",
    category: CAMPER_CATEGORY,
    default_check: true,
    domain: "opencampingmap.org",
    description: "Camping Sites",
    getUrl(lat, lon, zoom) {
      return "https://opencampingmap.org/#" + zoom + "/" + lat + "/" + lon;
    },
    getLatLonZoom(url) {
      const match = url.match(
        /opencampingmap\.org\/.*#(\d{1,2})\/(-?\d[0-9.]*)\/(-?\d[0-9.]*)/
      );
      if (match) {
        const [, zoom, lat, lon] = match;
        return [lat, lon, zoom];
      }
    },
  },
  {
    // https://openskimap.org/#15.01/47.47717/15.75636
    name: "OpenSkiMap",
    category: WINTER_CATEGORY,
    default_check: true,
    domain: "openskimap.org",
    description: "Ski Slopes, Nordic Ski Trails",
    getUrl(lat, lon, zoom) {
      return "https://openskimap.org/#" + zoom + "/" + lat + "/" + lon;
    },
    getLatLonZoom(url) {
      const match = url.match(
        /openskimap\.org\/.*#(-?\d[0-9.]*)\/(-?\d[0-9.]*)\/(-?\d[0-9.]*)/
      );
      if (match) {
        let [, zoom, lat, lon] = match;
        zoom = Math.round(zoom);
        return [lat, lon, zoom];
      }
    },
  }
];

const maps = sortByKey(maps_raw, "name");
