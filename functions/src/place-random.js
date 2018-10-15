const functions = require('firebase-functions');

const geohasher = require('../utils/geohasher');
const requester = require('../utils/requester');

const API_KEY = requester.getEnvValue('GOOGLE_PLACES_API_KEY');
const REQ_HOST = 'maps.googleapis.com';
const REQ_METHOD = 'GET';

module.exports = functions.https.onRequest((request, response) => {
  const {body, headers, method, query} = request;
  let geohash, latitude, longitude, radius;
  switch (method) {
    case 'GET':
      response.status(400);
      response.header('Content-Type', 'application/json');

      if (!query.text) {
        response.send(JSON.stringify({
          message: 'missing \'text\' query parameter',
        }));
        return;
      } else if (!query.lat) {
        response.send(JSON.stringify({
          message: 'missing \'lat\' query parameter',
        }));
        return;
      } else if (!query.lng) {
        response.send(JSON.stringify({
          message: 'missing \'lng\' query parameter',
        }));
        return;
      } else if (!query.rad) {
        response.send(JSON.stringify({
          message: 'missing \'rad\' query parameter',
        }));
        return;
      }

      try {
        const {lat, lng} = query;
        const floatLat = parseFloat(lat);
        const floatLng = parseFloat(lng);
        if (isNaN(floatLat)) {
          throw new Error('Latitude parsing failed - is it a float?');
        } else if (isNaN(floatLng)) {
          throw new Error('Longitude parsing failed - is it a float?');
        }
        geohash = geohasher.encode({
          latitude: floatLat,
          longitude: floatLng,
        });
        latitude = floatLat;
        longitude = floatLng;
      } catch (ex) {
        response.send(JSON.stringify({
          message: 'geohashing failed',
          data: ex,
        }));
        return;
      }

      try {
        const {rad} = query;
        const intRad = parseInt(rad);
        if (isNaN(intRad)) {
          throw new Error('Radius parsing failed - is it an integer?');
        }
        radius = intRad;
      } catch (ex) {
        response.send(JSON.stringify({
          message: 'radius failed',
          data: ex,
        }));
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
            `keyword=${encodeURIComponent(query.text)}`,
            `location=${latitude},${longitude}`,
            `radius=${radius}`
          ].join('&')
      }).then((data) => {
        response.status(200);
        const randomPlace = data.results[Math.floor(Math.random() * (data.results.length - 1))];
        console.info(randomPlace);
        response.send(
          JSON.stringify({
            id: randomPlace.id,
            name: randomPlace.name,
            rating: randomPlace.rating ? randomPlace.rating : null,
            tags: randomPlace.types ? randomPlace.types : [],
            address: randomPlace.vicinity ? randomPlace.vicinity : null,
          }, null, 2)
        );
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
