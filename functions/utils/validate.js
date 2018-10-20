const utils = require('./');

module.exports = {
  coord,
  integer,
  origin,
  query,
};

function origin(httpOrigin) {
  const allowedOrigins = (utils.getEnvValue('ALLOWED_ORIGINS') || '').split(',');
  if (allowedOrigins.indexOf(httpOrigin) !== -1) {
    response.header('Access-Control-Allow-Origin', httpOrigin);
  } else {
    throw new Error(`seek and ye shall find, o' bad request coming from ${httpOrigin}`);
  }
}

function query(requestQuery) {
  return new QueryValidator(requestQuery);
}

function QueryValidator(requestQuery) {
  this.requestQuery = requestQuery;
  return this;
}

QueryValidator.prototype.hasProperties = function(propertyList) {
  propertyList.map((propertyThatsSupposedToBeThere) => {
    if(this.requestQuery[propertyThatsSupposedToBeThere] === undefined) {
      throw new Error(`missing "${propertyThatsSupposedToBeThere}" query parameter`);
    }
  });
  return this;
}

function coord(supposedLatOrLng) {
  const coordinate = parseFloat(supposedLatOrLng);
  if (isNaN(coordinate)) {
    throw new Error(`"${supposedLatOrLng}" is not a valid location coordinate.`);
  }
  return coordinate;
}

function integer(supposedInteger) {
  const int = parseInt(supposedInteger);
  if (isNaN(int)) {
    throw new Error(`"${supposedInteger}" is not a valid integer.`);
  }
  return int;
}