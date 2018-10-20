const fs = require('fs');
const path = require('path');

module.exports = {
  getEnvValue,
};

function getEnvValue(keyString) {
  const envFilePath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envFilePath)) {
    return fs
      .readFileSync(envFilePath)
      .toString()
      .split('\n')
      .filter((v) => v.indexOf(keyString) === 0)[0]
      .split('=')[1];
  } else {
    return process.env[keyString];
  }
}
