const functions = require('firebase-functions');

const utils = require('../utils');
const cache = require('../utils/cache');
const requester = require('../utils/requester');
const validate = require('../utils/validate');

const API_KEY = utils.getEnvValue('GOOGLE_PLACES_API_KEY');
const REQ_HOST = 'maps.googleapis.com';
const REQ_METHOD = 'GET';

module.exports = functions.https.onRequest((request, response) => {
  console.info(`placeInfo running in environment "${process.env.NODE_ENV}"`);
  const {body, headers, method, query} = request;
  const {placeid, session} = query;
  let cacheUsed = true;

  response.header('Content-Type', 'application/json');

  try {
    validate.origin(headers.origin);
    response.header('Access-Control-Allow-Origin', headers.origin);
  } catch ({message}) {
    response.status(403);
    response.send(JSON.stringify({status: 403, message}, null, 2));
    return;
  }

  switch (method) {
    case 'GET':
      // query validation
      try {
        validate
          .query(query, response)
          .hasProperties([
            'placeid',
            'session',
          ]);
      } catch(missingParameter) {
        response.send(JSON.stringify({
          message: `missing '${missingParameter}' query parameter`,
        }));
        return;
      }

      cache.api.getPlaceInfoCache(placeid)
        .catch(() => {
          cacheUsed = false;
          return requester.getData({
            id: 'place-info',
            hostname: REQ_HOST,
            method: REQ_METHOD,
            platform: 'google',
            useCache: true,
            uriPath:
              '/maps/api/place/details/json?' +
              [
                `key=${API_KEY}`,
                `placeid=${placeid}`,
                `sessiontoken=${encodeURIComponent(session)}`,
              ].join('&')
          });
        })
        .then((data) => {
          response.status(200);
          response.send(JSON.stringify(serializeResponse(data), null, 2));
          if (!cacheUsed) {
            cache.api.setPlaceInfoCache(placeid, data);
          }
          return;
        })
        .catch((err) => {
          console.error('request error follows');
          console.error(err);
          response.status(500);
          response.send(JSON.stringify(err));
        });
      break;
    default:
      response.send(JSON.stringify('nah, can\'t ' + method + ' this shiz.'));
  }
});

function serializeResponse(data) {
  const {result} = data;
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    name: result.name,
    photos: (result.photos || []).map((photo) => ({
      ref: photo.photo_reference,
      height: photo.height,
      width: photo.width,
    })),
    placeId: result.place_id,
    rating: result.rating ? result.rating : null,
    reviews: (result.reviews || []).map((review) => ({
      author: review.author_name,
      authorPicture: review.profile_photo_url,
      rating: review.rating,
      relativeTime: review.relative_time_description,
      text: review.text,
    })),
    url: result.url,
    types: result.types,
    address: result['formatted_address'] ? result['formatted_address'] : null,
  };
}
