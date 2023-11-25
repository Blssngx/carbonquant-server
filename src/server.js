const express = require('express');
const getCandlestickData = require('./fetch/getCandlestickData.js');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/candlesticks', async (req, res) => {
    try {
        const pairs = req.query.pairs || 'BTC/USD,ETH/USD,CELO/USD'; // Default pairs if not provided

        const candlestickData = await getCandlestickData(pairs);
        res.json(candlestickData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.json('Quancate API provides crypto trading signals')
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
