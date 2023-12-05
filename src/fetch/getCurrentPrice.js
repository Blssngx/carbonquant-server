const axios = require('axios');

async function getCurrentPrice(cryptoSymbol) {
    try {
        const apiUrl = `https://min-api.cryptocompare.com/data/price?fsym=${cryptoSymbol}&tsyms=USD`;
        const response = await axios.get(apiUrl);
    
        if (response.data && response.data.USD) {
          const usdPrice = response.data.USD;
          return usdPrice;
        } else {
          throw new Error('Invalid response from the API');
        }
      } catch (error) {
        throw new Error(`Error fetching cryptocurrency price: ${error.message}`);
      }
}

module.exports = getCurrentPrice;