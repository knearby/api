const fs = require('fs');
const https = require('https');

const cache = require('./cache');

module.exports = {
  getData,
};

function getData({
  hostname,
  id = 'unknown',
  method = 'GET',
  platform = '',
  uriPath = '/',
  useCache = false,
}) {
  
  return new Promise((resolve, reject) => {
    const cacheOptions = {
      hostname, id, method, platform, uriPath,
    };
    const cachedData = cache.get(cacheOptions);

    if (useCache && cachedData !== null ) {
      resolve(cachedData);
    } else {
      getResponse({
        hostname,
        uriPath,
        method,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          cache.set(cacheOptions, data);
          resolve(data);
        }
      });
    }
  });
}

function getResponse({
  hostname,
  method,
  uriPath,
}, callback) {
  const requestOptions = {
    hostname,
    port: 443,
    path: uriPath,
    method,
  };

  let responseBody = '';

  const request = https.request(
    requestOptions,
    (res) => {
      res.on('data', (data) => responseBody += data.toString());
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(responseBody);
        } catch (ex) {
          return callback(ex);
        }
        return callback(null, parsedData)
      });
    }
  );
  request.on('error', (error) => callback(error));
  request.end();
}
