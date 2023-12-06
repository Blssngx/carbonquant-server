const symbolHashMapping = require('./symbolHashMappings');

function getHash(symbol) {
  const lowercaseSymbol = symbol.toLowerCase();
  const hashValue = symbolHashMapping[lowercaseSymbol];

  if (hashValue) {
    return hashValue;
  } else {
    throw new Error(`Symbol '${symbol}' not found`);
  }
}

module.exports = getHash;
