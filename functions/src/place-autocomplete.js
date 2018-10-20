const functions = require('firebase-functions');

const utils = require('../utils');
const requester = require('../utils/requester');
const validate = require('../utils/validate');

const API_KEY = utils.getEnvValue('GOOGLE_PLACES_API_KEY');
const REQ_HOST = 'maps.googleapis.com';
const REQ_METHOD = 'GET';
const REQ_COMPONENT = process.env.REQ_COMPONENT || 'country:sg';

module.exports = functions.https.onRequest((request, response) => {
  console.info(`placeAutocomplete running in environment "${process.env.NODE_ENV}"`);
  const {body, headers, method, query} = request;
  const {text, session} = query;

  response.header('Content-Type', 'application/json');

  try {
    validate.origin(headers.origin);
    response.header('Access-Control-Allow-Origin', headers.origin);
  } catch ({message}) {
    console.error(message);
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
            'text',
            'session',
          ]);
      } catch(missingParameter) {
        response.send(JSON.stringify({
          message: `missing '${missingParameter}' query parameter`,
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
          JSON.stringify(serializeResponse(data), null, 2)
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

function serializeResponse(data) {
  return data.predictions.map((prediction) => ({
    description: prediction.description,
    placeId: prediction.place_id,
    mainText: prediction.structured_formatting.main_text,
    secondaryText: prediction.structured_formatting.secondary_text,
    terms: prediction.terms.map((term) => term.value),
  }));
}
