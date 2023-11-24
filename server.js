const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/candlesticks', async (req, res) => {
  try {
    const pairs = req.query.pairs || 'BTC/USD,ETH/USD'; // Default pairs if not provided

    const candlestickData = await getCandlestickData(pairs);
    res.json(candlestickData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getCandlestickData(pairs) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  
    const formattedToday = today.toISOString().split('T')[0];
    const formattedYesterday = yesterday.toISOString().split('T')[0];
    const formattedDayBeforeYesterday = dayBeforeYesterday.toISOString().split('T')[0];
  
    const candlestickDataPromises = pairs.split(',').map(async (pair) => {
      const [baseCurrency, quoteCurrency] = pair.split('/');
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/v2/histoday`,
        {
          params: {
            fsym: baseCurrency,
            tsym: quoteCurrency,
            limit: 3, // 3 days to ensure we have enough data for the last three days
          },
        }
      );
  
      const coinData = response.data.Data.Data;
  
      // Retrieve candlestick data for the last three days
      const candlestickData = coinData
        .filter((data) => data.time * 1000 >= dayBeforeYesterday.getTime())
        .map((data) => ({
          time: data.time * 1000,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        }));
  
      return {
        pair,
        candlestickData,
      };
    });
  
    return Promise.all(candlestickDataPromises);
  }
  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
