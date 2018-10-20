const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = {
  createHash,
  createPath,
  get,
  set,
};

function createHash({
  method,
  hostname,
  uriPath,
}) {
  const unhashedData = method + hostname + uriPath;
  return crypto.createHash('md5').update(unhashedData).digest('hex');
}

function createPath({
  id,
  platform,
  cacheHash,
}) {
  return path.join(__dirname, `../../cache/${platform}-${id}-${cacheHash}.json`);
}

/**
 * 
 * @param {Object} options
 * @param {String} options.hostname
 * @param {String} options.id
 * @param {String} options.method
 * @param {String} options.platform
 * @param {String} options.uriPath
 */
function get({
  hostname,
  id,
  method,
  platform,
  uriPath,
}) {
  const cacheHash = createHash({method, hostname, uriPath});
  const pathToData = createPath({id, platform, cacheHash});

  return (fs.existsSync(pathToData))
    ? JSON.parse(fs.readFileSync(pathToData).toString())
    : null;
}

/**
 * 
 * @param {Object} options
 * @param {String} options.hostname
 * @param {String} options.id
 * @param {String} options.method
 * @param {String} options.platform
 * @param {String} options.uriPath
 * @param {Any} data
 */
function set(
  {
    hostname,
    id,
    method,
    platform,
    uriPath,
  },
  data
) {
  const cacheHash = createHash({method, hostname, uriPath});
  const pathToData = createPath({id, platform, cacheHash});

  // setting a try/catch block because in production this will 100% fail
  try {
    fs.writeFileSync(
      pathToData,
      JSON.stringify(data, null, 2)
    );
  } catch (ex) {
    console.error(ex);
  }
}