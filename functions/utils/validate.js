module.exports = {
  coord,
  integer,
  query,
};

function query(requestQuery) {
  return new QueryValidator(requestQuery);
}

function QueryValidator(requestQuery) {
  this.requestQuery = requestQuery;
  return this;
}

QueryValidator.prototype.hasProperties = function(propertyList) {
  return propertyList.map((propertyThatsSupposedToBeThere) => {
    if(this.requestQuery[propertyThatsSupposedToBeThere] === undefined) {
      throw new Error(`missing "${propertyThatsSupposedToBeThere}" query parameter`);
    }
  });
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