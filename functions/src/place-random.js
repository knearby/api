const functions = require('firebase-functions');

const utils = require('../utils');
const geohasher = require('../utils/geohasher');
const requester = require('../utils/requester');
const validate = require('../utils/validate');

const API_KEY = utils.getEnvValue('GOOGLE_PLACES_API_KEY');
const REQ_HOST = 'maps.googleapis.com';
const REQ_METHOD = 'GET';

const allowedOrigins = (utils.getEnvValue('ALLOWED_ORIGINS') || '').split(',');

module.exports = functions.https.onRequest((request, response) => {
  const {body, headers, method, query} = request;
  const {lat, lng, text, rad} = query;
  let geohash, latitude, longitude, radius;

  response.status(400);
  response.header('Content-Type', 'application/json');

  if (allowedOrigins.indexOf(headers.origin) !== -1) {
    response.header('Access-Control-Allow-Origin', headers.origin);
  } else {
    response.send(JSON.stringify('bad request, bad, bad request'));
    return;
  }

  switch (method) {
    case 'GET':
      // query validation
      try {
        validate
          .query(query, response)
          .hasProperties([
            'text',
            'lat',
            'lng',
            'rad'
          ]);
        latitude = validate.coord(lat);
        longitude = validate.coord(lng);
        geohash = geohasher.encode({latitude, longitude});
        radius = validate.integer(rad);
      } catch ({message}) {
        response.send(JSON.stringify({status: 400, message}, null, 2));
        return;
      }

      requester.getData({
        id: 'get-places',
        hostname: REQ_HOST,
        method: REQ_METHOD,
        platform: 'google',
        useCache: true,
        uriPath:
          '/maps/api/place/nearbysearch/json?' +
          [
            `key=${API_KEY}`,
            `keyword=${encodeURIComponent(text)}`,
            `location=${latitude},${longitude}`,
            `radius=${radius}`
          ].join('&')
      }).then((data) => {
        const randomPlace = data.results[Math.floor(Math.random() * (data.results.length - 1))];
        const responseData = serializeResponse(randomPlace, geohash);

        response.status(200);
        console.info(`responded with ${randomPlace.name} at ${JSON.stringify(randomPlace.geometry.location)}`);
        response.send(JSON.stringify(responseData, null, 2));
        return;
      }).catch((err) => {
        console.error(err);
        response.status(500);
        response.send(JSON.stringify(err));
      });
      break;
    default:
      response.send(JSON.stringify('nah, can\'t ' + method + ' this shiz.'));
  }
});

function serializeResponse(randomPlace, geohash = null) {
  return {
    id: randomPlace['place_id'],
    name: randomPlace.name,
    geohash,
    rating: randomPlace.rating ? randomPlace.rating : null,
    tags: randomPlace.types ? randomPlace.types : [],
    address: randomPlace.vicinity ? randomPlace.vicinity : null,
    gmapsCode: randomPlace['plus_code']['global_code'],
    lat: randomPlace.geometry.location.lat,
    lng: randomPlace.geometry.location.lng,
  };
}