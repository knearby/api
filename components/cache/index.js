const firebaseAdmin = require('firebase-admin');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./credentials.json')),
  databaseURL: 'https://the-karma-app.firebaseio.com/',
});
const db = firebaseAdmin.database();

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
      const ref = db.ref(`cache/${setPlaceAutocompleteCache.key}/${searchTerm}`);
      ref
        .once('value')
        .then((snapshot) => {
          const value = snapshot.val();
          if (value === null) {
            throw new Error('invalid cache key');
          }
          return resolve(Object.assign({}, {req: searchTerm, path: ref.path.pieces_.join('/')}, value))
        })
        .catch(reject);
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
  const ref = db.ref(`cache/${setPlaceAutocompleteCache.key}/${searchTerm}`);
  ref.set(Object.assign({}, results, createBootstrapFields()));
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
      const ref = db.ref(`cache/${setPlaceInfoCache.key}/${placeId}`);
      ref
        .once('value')
        .then((snapshot) => {
          const value = snapshot.val();
          if (value === null) {
            throw new Error('invalid cache key');
          }
          return resolve(Object.assign({}, {req: placeId, path: ref.path.pieces_.join('/')}, value))
        })
        .catch(reject);
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
  const ref = db.ref(`cache/${setPlaceInfoCache.key}/${placeId}`);
  ref.set(
    Object.assign({}, results, createBootstrapFields()));
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
function getPlacesCache(geohash) {
  if (!geohash || typeof geohash !== 'string') {
    throw new Error('geohash was not defined or not a string');
  }
  return new Promise((resolve, reject) => {
    try {
      const ref = db.ref(`cache/${setPlacesCache.key}/${geohash}`);
      ref
        .once('value')
        .then((snapshot) => {
          const value = snapshot.val();
          if (value === null) {
            throw new Error('invalid cache key');
          }
          return resolve(Object.assign({}, {req: geohash, path: ref.path.pieces_.join('/')}, value))
        })
        .catch(reject);
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * @param {String} geohash 
 * @param {Object} results 
 * @return {Object}
 */
function setPlacesCache(geohash, results) {
  if (!geohash || typeof geohash !== 'string') {
    throw new Error('geohash was not defined or not a string');
  } else if (!results || typeof results !== 'object') {
    throw new Error('results was not defined or not an object')
  }
  const ref = db.ref(`cache/${setPlacesCache.key}/${geohash}`);
  ref.set(
    Object.assign({}, results, createBootstrapFields()));
  return ref.path;
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
