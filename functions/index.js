process.env.NODE_ENV = process.env.NODE_ENV || 'development';

exports.placeRandom = require('./src/place-random');
exports.placeAutocomplete = require('./src/place-autocomplete');
exports.placeInfo = require('./src/place-info');
