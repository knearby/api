const functions = require('firebase-functions');

const utils = require('../utils');
const requester = require('../utils/requester');

const API_KEY = utils.getEnvValue('GOOGLE_PLACES_API_KEY');
const REQ_HOST = 'maps.googleapis.com';
const REQ_METHOD = 'GET';
const REQ_COMPONENT = process.env.REQ_COMPONENT || 'country:sg';

const allowedOrigins = (utils.getEnvValue('ALLOWED_ORIGINS') || '').split(',');

module.exports = functions.https.onRequest((request, response) => {
  const {body, headers, method, query} = request;
  const {text, session} = query;

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
      if (!text) {
        response.send(JSON.stringify({
          message: 'missing \'text\' query parameter',
        }));
        return;
      } else if (!session) {
        response.send(JSON.stringify({
          message: 'missing \'session\' query parameter',
        }));
        return;
      }

      requester.getData({
        id: 'place-autocomplete',
        hostname: REQ_HOST,
        method: REQ_METHOD,
        platform: 'google',
        useCache: true,
        uriPath:
          '/maps/api/place/autocomplete/json?' +
          [
            `key=${API_KEY}`,
            `input=${encodeURIComponent(text)}`,
            `components=${REQ_COMPONENT}`,
            `sessiontoken=${session}`,
          ].join('&')
      }).then((data) => {
        response.status(200);
        response.send(
          JSON.stringify(data.predictions.map((prediction) => ({
            description: prediction.description,
            placeId: prediction.place_id,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text,
            terms: prediction.terms.map((term) => term.value),
          })), null, 2)
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
