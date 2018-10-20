const fs = require('fs');
const path = require('path');

module.exports = {
  getEnvValue,
};

function getEnvValue(keyString) {
  return (process.env[keyString])
    ? process.env[keyString]
    : fs
    .readFileSync(path.join(__dirname, '../../.env'))
    .toString()
    .split('\n')
    .filter((v) => v.indexOf(keyString) === 0)[0]
    .split('=')[1];
}
