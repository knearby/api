const firebaseAdmin = require('firebase-admin');
firebaseAdmin.initializeApp();
const db = firebaseAdmin.database();
const geohasher = require('../geohasher');

const API_CACHE_STUB = `${process.env.NODE_ENV}/cache`;

module.exports = {
  getPlaceAutocompleteCache,
  getPlaceInfoCache,
  getPlacesCache,
  setPlaceAutocompleteCache,
  setPlaceInfoCache,
  setPlacesCache,
};

/**
 * @param {String} searchTerm
 * @return {Promise<Object>}
 */
function getPlaceAutocompleteCache(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    throw new Error('searchTerm was not defined or not a string');
  }
  return new Promise((resolve, reject) => {
    try {
      const ref = db.ref(`${API_CACHE_STUB}/${setPlaceAutocompleteCache.key}/${searchTerm}`);
      ref
        .once('value')
        .then((snapshot) => {
          const value = snapshot.val();
          if (value === null) {
            throw new Error('invalid cache key');
          }
          return resolve(Object.assign({}, {req: searchTerm, path: ref.path.pieces_.join('/')}, value))
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * @param {String} searchTerm
 * @param {Object} results
 * @return {String}
 */
function setPlaceAutocompleteCache(searchTerm, results) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    throw new Error('searchTerm was not defined or not a string');
  } else if (!results || typeof results !== 'object') {
    throw new Error('results was not defined or not an object')
  }
  const ref = db.ref(`${API_CACHE_STUB}/${setPlaceAutocompleteCache.key}/${searchTerm}`);
  ref.set(Object.assign({}, results, createBootstrapFields()))
    .then(() => {
      console.info(`successfully set cached data for autocomplete query "${searchTerm}"`);
      return;
    })
    .catch((err) => {
      console.error(`error setting cache for autocomplete for text "${searchTerm}"`);
      console.error(err);
    });
  return ref.path;
}

setPlaceAutocompleteCache.key = 'gmaps/place/autocomplete';
setPlaceAutocompleteCache.description = 'each key in here represents an autocomplete attempt containing an array of results returned by the Google Maps API';
// // enable for debug 
// setPlaceAutocompleteCache('__README', {description: setPlaceAutocompleteCache.description});
// getPlaceAutocompleteCache('__README').then(console.info);


/**
 * @param {String} placeId
 * @return {Promise<Object>}
 */
function getPlaceInfoCache(placeId) {
  if (!placeId || typeof placeId !== 'string') {
    throw new Error('placeId was not defined or not a string');
  }
  return new Promise((resolve, reject) => {
    try {
      const ref = db.ref(`${API_CACHE_STUB}/${setPlaceInfoCache.key}/${placeId}`);
      ref
        .once('value')
        .then((snapshot) => {
          const value = snapshot.val();
          if (value === null) {
            throw new Error('invalid cache key');
          }
          return resolve(Object.assign({}, {req: placeId, path: ref.path.pieces_.join('/')}, value))
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * @param {String} placeId placeId returned by Google Maps API
 * @param {Object} results place object returned by Google Maps API
 * @return {String}
 */
function setPlaceInfoCache(placeId, results) {
  if (!placeId || typeof placeId !== 'string') {
    throw new Error('placeId was not defined or not a string');
  } else if (!results || typeof results !== 'object') {
    throw new Error('results was not defined or not an object')
  }
  const ref = db.ref(`${API_CACHE_STUB}/${setPlaceInfoCache.key}/${placeId}`);
  ref.set(Object.assign({}, results, createBootstrapFields()))
    .then(() => {
      console.info(`successfully set cached data for place ${placeId}`);
      return;
    })
    .catch((err) => {
      console.error('error setting cache for placeInfo');
      console.error(err);
    });
  return ref.path;
}

setPlaceInfoCache.key = 'gmaps/place/info';
setPlaceInfoCache.description = 'each key in here represents a placeId returned by the Google Maps API';
// // enable for debug
// setPlaceInfoCache('__README', {description: setPlaceInfoCache.description});
// getPlaceInfoCache('__README').then(console.info);

/**
 * @param {String} geohash
 * @return {Promise<Object>}
 */
function getPlacesCache(queryText, latitude, longitude, radius) {
  if (!queryText || typeof queryText !== 'string') {
    throw new Error('queryText was not defined or not a string');
  } else if (!latitude || typeof latitude !== 'number') {
    throw new Error('latitude was not defined or not a number');
  } else if (!longitude || typeof longitude !== 'number') {
    throw new Error('longitude was not defined or not a number');
  } else if (typeof radius !== 'number' && isNaN(parseInt(radius))) {
    throw new Error('radius was not defined or not a number');
  }
  return new Promise((resolve, reject) => {
    try {
      const geohash = geohasher.encode({
        latitude,
        longitude,
        precision: geohasher.getRecommendedPrecision(radius) - 1,
      });
      db.ref(`${API_CACHE_STUB}/${setPlacesCache.key}/${queryText}`)
        .orderByChild('geohash')
        .startAt(`${geohash}0`)
        .endAt(`${geohash}z`)
        .on('value', (snapshot) => {
          const results = snapshot.val();
          if (!results) {
            reject(new Error('no results'));
          } else {
            console.info(`cache retrieved ${Object.keys(results).length} search results from ${geohash}0 - ${geohash}z`)
            resolve({
              results: Object.keys(results).map((resultKey) => results[resultKey]),
            });
          }
        });
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * @param {String} queryText
 * @param {Float} latitude
 * @param {Float} longitude
 * @param {Object} data 
 * @return {Object}
 */
function setPlacesCache(queryText, latitude, longitude, data) {
  if (!queryText || typeof queryText !== 'string') {
    throw new Error('queryText was not defined or not a string');
  } else if (!latitude || typeof latitude !== 'number') {
    throw new Error('latitude was not defined or not a number');
  } else if (!longitude || typeof longitude !== 'number') {
    throw new Error('longitude was not defined or not a number');
  } else if (!data || typeof data !== 'object') {
    throw new Error('data was not defined or not an object')
  }
  const {results} = data;
  results.forEach((place) => {
    db.ref(`${API_CACHE_STUB}/${setPlacesCache.key}/${queryText}/${place['place_id']}`)
      .set(
        Object.assign(
          {geohash: geohasher.encode({latitude, longitude, precision: geohasher.precision.street})},
          place,
          createBootstrapFields()
        )
      )
      .then(() => {
        console.info(`successfully set cached data for place ${place['place_id']}`);
        return;
      })
      .catch((err) => {
        console.error('error setting cache for place');
        console.error(err);
      });
  });
}

setPlacesCache.key = 'gmaps/place/s';
setPlacesCache.description = 'each key in here represents a geohash and contains a list of results returned by the Google Maps API';
// // enable for debug
// setPlacesCache('__README', {description: setPlacesCache.description});
// getPlacesCache('__README').then(console.info);

/**
 * @return {Object}
 */
function createBootstrapFields() {
  return {
    timestamp: (new Date()).getTime(),
    environment: process.env.NODE_ENV || 'development',
  };
}
