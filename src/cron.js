const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const port = 3000;

let latestCryptoData = null;

async function fetchCryptoPrice(symbol) {
  try {
    const apiUrl = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.USD) {
      return response.data.USD;
    } else {
      throw new Error('Invalid response from the API');
    }
  } catch (error) {
    throw new Error(`Error fetching cryptocurrency price: ${error.message}`);
  }
}

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Handle the error, log, or whatever is appropriate
});

cron.schedule('*/15 * * * * *', async () => {
  const cryptoSymbol = 'BTC'; // Replace with the desired cryptocurrency symbol
  try {
    const usdPrice = await fetchCryptoPrice(cryptoSymbol);
    latestCryptoData = { symbol: cryptoSymbol, usdPrice };
    console.log(`Updated cryptocurrency data: ${JSON.stringify(latestCryptoData)}`);
  } catch (error) {
    console.error(error.message);
  }
});

app.get('/crypto', (req, res) => {
  if (latestCryptoData) {
    res.json(latestCryptoData);
  } else {
    res.status(500).json({ error: 'Cryptocurrency data not available yet' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

var cron = require('node-cron');
const getCurrentPrice = require('./fetch/getCurrentPrice');



cron.schedule('*/15 * * * * *', async () => {
    // console.log('running a task every minute');
    try {
        const diff = await price('BTC') - await price('ETH');
        console.log(`  ${diff}`);
        // res.json(currentPrice);
    } catch (error) {
        console.error(error);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
});

// function getDiff(currentPrice, currentPrice2) {
//     return currentPrice - currentPrice2;
// }

async function price(symbol) {
    const currentPrice = await getCurrentPrice(symbol);
    return currentPrice;
}

// const cron = require('node-cron');
// const getCurrentPrice = require('./fetch/getCurrentPrice');

// cron.schedule('*/15 * * * * *', async () => {
//     try {
//         const symbol = 'BTC';
//         const currentPrice = await getCurrentPrice(symbol);

//         // Check if the current price is less than $10,000
//         const isPriceBelow10000 = currentPrice > 10000;

//         console.log(`Current price of ${symbol}: $${currentPrice}`);
//         console.log(`Is the price below $10,000? ${isPriceBelow10000}`);

//         // You can use isPriceBelow10000 in your logic or return it as needed.
//     } catch (error) {
//         console.error(error);
//     }
// });
// // Compare this snippet from src/fetch/getCurrentPrice.js:



// var cron = require('node-cron');
// const getCurrentPrice = require('./fetch/getCurrentPrice');



// cron.schedule('*/15 * * * * *', async () => {
//     try {
//         const x = greater(await price('BTC'), await price('ETH'));

//         console.log(`  ${x}`);
//     } catch (error) {
//         console.error(error);
//     }
// });

// async function price(symbol) {
//     const currentPrice = await getCurrentPrice(symbol);
//     return currentPrice;
// }

// function greater(x, y) {
//     const z = x > y;
//     return z;
// }

// function less(x, y) {
//     const z = x < y;
//     return z;
// }

// const conditions = [
//     {
//         rule: "BTC-BUY",
//         symbols: ["BTC", "LTC"],
//         condition: (prices) => (prices[0] - prices[1]) / 2 > 1000,
//         enabled: true
//     },
//     {
//         rule: "LTC-BUY",
//         symbols: ["LTC", "ETH"],
//         condition: (prices) => (prices[0] + prices[1]) / 2 > 1000,
//         enabled: true
//     },
//     {
//         rule: "ETH-BUY",
//         symbols: ["ETH"],
//         condition: (prices) => prices[0] > prices[0],
//         enabled: true
//     },
// ];
const cron = require('node-cron');
const getCurrentPrice = require('./fetch/getCurrentPrice');

const conditions = [
  {
    symbols: ["BTC", "LTC"],
    condition: (prices) => prices[0] - prices[1]/ 2 > 1000,
    enabled: true
  },
  // Add more conditions as needed
  {
    symbols: ["LTC"],
    condition: (prices) => prices[0]/ 2 > prices[0],
    enabled: true
  },
];

cron.schedule('*/15 * * * * *', async () => {
    try {
        for (const condition of conditions) {
            if (!condition.enabled) {
                console.log(`Condition for ${condition.symbols[0]} - ${condition.symbols[1]} is disabled`);
                continue;
            }

            const prices = await Promise.all(condition.symbols.map(symbol => price(symbol)));

            if (condition.condition(prices)) {
                console.log(`${condition.symbols[0]} - ${condition.symbols[1]} condition satisfied`);
            } else {
                console.log(`${condition.symbols[0]} - ${condition.symbols[1]} condition not satisfied`);
            }
        }
    } catch (error) {
        console.error(error);
    }
});

async function price(symbol) {
    const currentPrice = await getCurrentPrice(symbol);
    return currentPrice;
}


