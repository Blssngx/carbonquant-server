// const express = require('express');
// const getCandlestickData = require('./fetch/getCandlestickData.js');
// const getCurrentPrice = require('./fetch/getCurrentPrice.js');
// const cors = require('cors'); // Add this line

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(express.json());
// app.use(cors()); // Add this line

// app.get('/signal/:indexToken', async (req, res) => {
//     try {
//         const indexToken = req.params.indexToken;
//         if (!indexToken) {
//             res.status(400).json({ error: 'Missing index token' });
//             return;
//         }

//         let quote;
//         switch (indexToken.toLowerCase()) {
//             case '0xd71ffd0940c920786ec4dbb5a12306669b5b81ef':
//                 quote = 'BTC';
//                 break;
//             case '0x122013fd7df1c6f636a5bb8f03108e876548b455':
//                 quote = 'ETH';
//                 break;
//             case '0x471ece3750da237f93b8e339c536989b8978a438':
//                 quote = 'CELO';
//                 break;
//             // case '0x765de816845861e75a25fca122bb6898b8b1282a':
//             //     quote = 'cUSD';
//             //     break;
//             // case '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73':
//             //     quote = 'CEUR';
//             //     break;
//             // case '0xda4f2094c185291ae44ed4fe7aa957b85ce9160f':
//             //     quote = 'CarbonHood EUA';
//             //     break;
//             // case '0xe8537a3d056da446677b9e9d6c5db704eaab4787':
//             //     quote = 'cReal';
//             //     break;
//             default:
//                 quote = ''; // Set a default value for quote if indexToken is not recognized
//         }

//         const pairs = req.query.pairs || `${quote}/USD`; // Default pairs if not provided

//         const candlestickData = await getCandlestickData(pairs);
//         res.json(candlestickData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.get('/candlesticks', async (req, res) => {
//     try {
//         const pairs = req.query.pairs || 'BTC/LTC,ETH/USD,CELO/USD,BTC/ETH,BCH/USD,LTC/USD,XRP/USD,ADA/USD,DOGE/USD,BTC/USD'; // Default pairs if not provided
//         const candlestickData = await getCandlestickData(pairs);
//         res.json(candlestickData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.get('/crypto/:symbol', async (req, res) => {
//     try {
//         const {symbol} = req.params;
//         const currentPrice = await getCurrentPrice(symbol);
//         res.json(currentPrice);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.get('/', (req, res) => {
//     res.json('Quancate API provides crypto trading signals');
// });

// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });

// server.js (Node.js)

// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const cron = require('node-cron');
// const getCurrentPrice = require('./fetch/getCurrentPrice');
// const { sendTelegramMessage } = require('./notification/telegram');
// const createPosition = require('./contract/createPosition');

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);
// const cors = require('cors'); // Import the cors middleware
// app.use(cors()); // Use the cors middleware


// const rules = [
//     {
//         id: 2,
//         name: "LTC-BUY",
//         enabled: true,
//         conditions: {
//             symbols: ["LTC", "ETH"],
//             condition: (prices) => (prices[0] + prices[1]) / 2 > 1000,
//         },
//         action: {
//             id: 2,
//             actionTypes: ["Notification", "Place Custom Order"],
//             orderExecution: "Market order",
//             orderType: "BUY",
//             orderSize: "0.01",
//             message: "Buy 0.01 LTC",
//         }
//     }
// ];

// const ruleState = {};

// function executeAction(rule) {
//     if (!ruleState[rule.id]) {
//         const { action } = rule;
//         const timestamp = new Date().toUTCString();

//         if (action) {
//             console.log(`${timestamp} - Executing action for rule: ${rule.name}`);

//             // if (action.actionTypes.includes("Notification")) {
//             //     console.log(`${timestamp} - Sending notification: ${action.message}`);
//             //     sendTelegramMessage("YOUR_BOT_TOKEN", "YOUR_CHAT_ID", action.message);
//             // }

//             // if (action.actionTypes.includes("Place Custom Order")) {
//             //     console.log(`${timestamp} - Placing custom order: ${action.message}`);
//             //     createPosition('btc', 'BUY', '4', '2').catch((error) => {
//             //         console.error(error);
//             //         process.exitCode = 1;
//             //     });
//             // }

//             ruleState[rule.id] = true;
//         } else {
//             console.log(`${timestamp} - No matching action found for rule: ${rule.name}`);
//         }
//     } else {
//         const timestamp = new Date().toUTCString();
//         console.log(`${timestamp} - Action for rule ${rule.name} already executed. Skipping.`);
//     }
// }

// cron.schedule('*/15 * * * * *', async () => {
//     try {
//         const timestamp = new Date().toUTCString();

//         for (const rule of rules) {
//             if (!rule.enabled) {
//                 console.log(`${timestamp} - Condition for ${rule.conditions.symbols.join(', ')} is disabled`);
//                 continue;
//             }

//             const prices = await Promise.all(rule.conditions.symbols.map(symbol => getCurrentPrice(symbol)));
//             console.log(`${timestamp} - Rule: ${rule.name} is ${rule.conditions.condition(prices)}`);

//             if (rule.conditions.condition(prices)) {
//                 executeAction(rule);
//             } else {
//                 ruleState[rule.id] = false;
//             }
//         }
//     } catch (error) {
//         console.error(error);
//     }
// });

// // WebSocket connection handling
// io.on('connection', (socket) => {
//     console.log('A client connected');

//     const originalConsoleLog = console.log;
//     console.log = function (message) {
//         originalConsoleLog.apply(console, arguments);
//         socket.emit('log', message);
//     };

//     socket.on('disconnect', () => {
//         console.log = originalConsoleLog;
//         console.log('A client disconnected');
//     });
// });

// // ... (Your existing code)

// const PORT = process.env.PORT || 3001;

// server.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });






// server.js (Node.js)

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cron = require('node-cron');
const cors = require('cors'); // Import the cors middleware
const getCurrentPrice = require('./fetch/getCurrentPrice');
const { sendTelegramMessage } = require('./notification/telegram');
const createPosition = require('./contract/createPosition');

const app = express();

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000', // Replace with the actual origin of your Next.js app
        methods: ['GET', 'POST'],
    },
});

// const corsOptions = {
//     origin: 'http://localhost:3000', // Replace with the actual origin of your Next.js app
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//     optionsSuccessStatus: 204,
// };

app.use(cors()); // Use the cors middleware

const rules = [
    {
        id: 2,
        name: "LTC-BUY",
        enabled: true,
        conditions: {
            symbols: ["LTC", "ETH"],
            condition: (prices) => (prices[0] + prices[1]) / 2 > 1000,
        },
        action: {
            id: 2,
            actionTypes: ["Notification", "Place Custom Order"],
            orderExecution: "Market order",
            orderType: "BUY",
            orderSize: "0.01",
            message: "Buy 0.01 LTC",
        }
    },
];

const ruleState = {};

function executeAction(rule) {
  if (!ruleState[rule.id]) {
    const { action } = rule;
    const timestamp = new Date().toUTCString();

    if (action) {
      console.log(`${timestamp} - Executing action for rule: ${rule.name}`);

      if (action.actionTypes.includes("Notification")) {
        console.log(`${timestamp} - Sending notification: ${action.message}`);
        // sendTelegramMessage("YOUR_BOT_TOKEN", "YOUR_CHAT_ID", action.message);
      }

      if (action.actionTypes.includes("Place Custom Order")) {
        console.log(`${timestamp} - Placing custom order: ${action.message}`);
        // createPosition('btc', 'BUY', '4', '2').catch((error) => {
        //   console.error(error);
        //   process.exitCode = 1;
        // });
      }

      ruleState[rule.id] = true;
    } else {
      console.log(`${timestamp} - No matching action found for rule: ${rule.name}`);
    }
  } else {
    const timestamp = new Date().toUTCString();
    console.log(`${timestamp} - Action for rule ${rule.name} already executed. Skipping.`);
  }
}

cron.schedule('*/15 * * * * *', async () => {
  try {
    const timestamp = new Date().toUTCString();

    for (const rule of rules) {
      if (!rule.enabled) {
        console.log(`${timestamp} - Condition for ${rule.conditions.symbols.join(', ')} is disabled`);
        continue;
      }

      const prices = await Promise.all(rule.conditions.symbols.map(symbol => getCurrentPrice(symbol)));
      console.log(`${timestamp} - Rule: ${rule.name} is ${rule.conditions.condition(prices)}`);

      if (rule.conditions.condition(prices)) {
        executeAction(rule);
      } else {
        ruleState[rule.id] = false;
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('A client connected');

  const originalConsoleLog = console.log;
  console.log = function (message) {
    originalConsoleLog.apply(console, arguments);
    socket.emit('log', message);
  };

  socket.on('disconnect', () => {
    console.log = originalConsoleLog;
    console.log('A client disconnected');
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
