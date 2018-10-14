// prefixed with underscore to account for base32 values being 1 - 32
const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

// sizes relative to common things
const geohashPrecision = {
  'continent': 1, // 5000 x 5000 km
  'country': 2,   // 1250 x 625 km
  'state': 3,     // 156 x 156 km
  'city': 4,      // 39.1 x 39.1 km
  'park': 5,      // 4.89 x 4.89 km
  'school': 6,    // 1.22 x 0.61 km
  'street': 7,    // 153 x 153 m
  'alley': 8,     // 38.2 x 19.1 m
  'bus': 9,       // 4.77 x 4.77 m
  'human': 10,    // 1.19 x 0.596 m
  'ruler': 11,    // 149 x 149 mm
  'pinky': 12,    // 37.2 x 18.6 mm
};

module.exports = {
  base32,
  decode,
  encode,
  precision: geohashPrecision,
};

/**
 * @param {Object} option
 * @param {Boolean} option.debug
 * @param {Float} option.latitude
 * @param {Float} option.longitude
 * @param {Integer} option.precision
 * @return {Object|String} - if option.debug is truthy, an object is returned, a string otherwise
 */
function encode({ debug = false, latitude, longitude, precision = geohashPrecision['bus'] } = {}) {
  // basic setup
  const range = {
    lat: { upper: 90, lower: -90 },
    lon: { upper: 180, lower: -180},
  };

  // get parameters
  let lat = parseFloat(latitude);
  let lon = parseFloat(longitude);

  // create output variables
  let geohashBinary = '';
  let geohashRaw = new Array(Math.ceil(precision / 5)).fill(0);

  // iterate through for precision
  for (let p = 0; p < precision * 5; ++p) {
    const geohashRawIndex = Math.floor(p / 5);
    const geohashBitMask = Math.pow(2, 4 - (p % 5));
    (debug) && process.stdout.write(`${geohashRawIndex} ${geohashBitMask} ${p % 2}`);
    if (p % 2) {
      const midLat = (range.lat.lower + range.lat.upper) / 2;
      if (lat > midLat) {
        geohashBinary += '1';
        geohashRaw[geohashRawIndex] |= geohashBitMask;
        range.lat.lower = midLat;
      } else {
        geohashBinary += '0';
        range.lat.upper = midLat;
      }
      (debug) && process.stdout.write(` ${lat > midLat} (lat)`);
    } else {
      const midLon = (range.lon.lower + range.lon.upper) / 2;
      if (lon > midLon) {
        geohashBinary += '1';
        geohashRaw[geohashRawIndex] |= geohashBitMask;
        range.lon.lower = midLon;
      } else {
        geohashBinary += '0';
        range.lon.upper = midLon;
      }
      (debug) && process.stdout.write(` ${lon > midLon} (lat)`);
    }
    (debug) && process.stdout.write(` ${geohashRaw[geohashRawIndex]} \n`);
  }

  const geohash = geohashRaw.map((v) => base32[v]).join('');

  return (debug) ? {
    base: base32,
    geohashBinary,
    geohashRaw,
    geohash,
    latitude: lat,
    longitude: lon,
  } : geohash;
}

/**
 * @param {Object} option
 * @param {Boolean} option.debug
 * @param {String} option.geohash
 * @return {Object}: {latitude, longitude}
 */
function decode({
  debug = false,
  geohash,
}) {
  const range = {
    lat: { upper: 90, lower: -90 },
    lon: { upper: 180, lower: -180},
  };

  let geohashBinary = '';
  const coords = {
    lat: [],
    lon: [],
  };

  for (let i = 0; i < geohash.length; ++i) {
    const value = base32.indexOf(geohash.charAt(i));
    const binary = [
      (value & 16) ? 1 : 0,
      (value & 8) ? 1 : 0,
      (value & 4) ? 1 : 0,
      (value & 2) ? 1 : 0,
      (value & 1) ? 1 : 0,
    ];
    (debug) && (geohashBinary += binary.join(''));
    if (i % 2) {
      coords.lon.push(binary[1], binary[3]);
      coords.lat.push(binary[0], binary[2], binary[4]);
    } else {
      coords.lon.push(binary[0], binary[2], binary[4]);
      coords.lat.push(binary[1], binary[3]);
    }
  }

  for (let i = 0; i < coords.lat.length; ++i) {
    (debug) && process.stdout.write(`${coords.lat[i]}`);
    range.lat[(coords.lat[i] === 1) ? 'lower' : 'upper'] =
      range.lat.mid = (range.lat.upper + range.lat.lower) / 2;
  }

  (debug) && process.stdout.write('\n');
  for (let i = 0; i < coords.lon.length; ++i) {
    (debug) && process.stdout.write(`${coords.lon[i]}`);
    range.lon[(coords.lon[i] === 1) ? 'lower' : 'upper'] =
      range.lon.mid = (range.lon.upper + range.lon.lower) / 2;
  }
  (debug) && process.stdout.write('\n');

  const latitude = range.lat.mid;
  const longitude = range.lon.mid;

  return (debug) ? {
    base: base32,
    geohashBinary,
    geohash,
    latitude,
    longitude,
  } : {latitude, longitude};
}
