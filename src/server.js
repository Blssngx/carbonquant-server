const express = require('express');
const getCandlestickData = require('./fetch/getCandlestickData.js');
const cors = require('cors'); // Add this line

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors()); // Add this line

app.get('/signal/:indexToken', async (req, res) => {
    try {
        const indexToken = req.params.indexToken;
        if (!indexToken) {
            res.status(400).json({ error: 'Missing index token' });
            return;
        }

        let quote;
        switch (indexToken.toLowerCase()) {
            case '0xd71ffd0940c920786ec4dbb5a12306669b5b81ef':
                quote = 'BTC';
                break;
            case '0x122013fd7df1c6f636a5bb8f03108e876548b455':
                quote = 'ETH';
                break;
            case '0x471ece3750da237f93b8e339c536989b8978a438':
                quote = 'CELO';
                break;
            // case '0x765de816845861e75a25fca122bb6898b8b1282a':
            //     quote = 'cUSD';
            //     break;
            // case '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73':
            //     quote = 'CEUR';
            //     break;
            // case '0xda4f2094c185291ae44ed4fe7aa957b85ce9160f':
            //     quote = 'CarbonHood EUA';
            //     break;
            // case '0xe8537a3d056da446677b9e9d6c5db704eaab4787':
            //     quote = 'cReal';
            //     break;
            default:
                quote = ''; // Set a default value for quote if indexToken is not recognized
        }

        const pairs = req.query.pairs || `${quote}/USD`; // Default pairs if not provided

        const candlestickData = await getCandlestickData(pairs);
        res.json(candlestickData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/candlesticks', async (req, res) => {
    try {
        const pairs = req.query.pairs || 'BTC/USD,ETH/USD,CELO/USD,BTC/ETH,BTC/LTC,BCH/USD,LTC/USD,XRP/USD,ADA/USD,DOGE/USD'; // Default pairs if not provided
        const candlestickData = await getCandlestickData(pairs);
        res.json(candlestickData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.json('Quancate API provides crypto trading signals');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
