const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cron = require('node-cron');
const cors = require('cors');
const getCurrentPrice = require('./fetch/getCurrentPrice');
const { sendTelegramMessage } = require('./notification/telegram');
const createPosition = require('./contract/createPosition');
const bodyParser = require('body-parser');
const e = require('express');
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with the actual origin of your Next.js app
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(bodyParser.json());

const rules = [];
const ruleState = {};

// Get all rules
app.get('/rules', (req, res) => {
  res.json(rules);
});

// Update a rule
app.put('/rules/:id', (req, res) => {
  const ruleId = parseInt(req.params.id);
  const updatedRule = req.body;
  const index = rules.findIndex((r) => r.id === ruleId);
  if (index !== -1) {
    rules[index] = updatedRule;
    res.json(updatedRule);
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

// Delete a rule
app.delete('/rules/:id', (req, res) => {
  const ruleId = parseInt(req.params.id);
  const index = rules.findIndex((r) => r.id === ruleId);
  if (index !== -1) {
    const deletedRule = rules.splice(index, 1)[0];
    res.json(deletedRule);
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

// Get a specific rule
app.get('/rules/:id', (req, res) => {
  const ruleId = parseInt(req.params.id);
  const rule = rules.find((r) => r.id === ruleId);
  if (rule) {
    res.json(rule);
  } else {
    res.status(404).json({ message: 'Rule not found' });
  }
});

// Update rules from frontend
app.post('/update-rules', (req, res) => {
  const receivedRules = req.body;

  console.log('Received rules from frontend:', receivedRules);

  // Convert received rules into the desired object format before pushing into the array
  receivedRules.id = rules.length + 1; // Assign a unique ID, you may use a better strategy
  receivedRules.timestamp = new Date().toUTCString();
  rules.push(receivedRules);
  // Emit the updated rules to all connected clients
  io.emit('updateRules', rules);

  res.status(200).json({ message: 'Rules received and loaded successfully.' });
});

function executeAction(rule) {
  if (!ruleState[rule.name]) {
    const { actionTypes, baseSymbol, market, leverage, stake, message } = rule;
    const timestamp = new Date().toUTCString();

    console.log(`${timestamp} - Executing action for rule: ${rule.name}`);

    if (actionTypes.includes('Notification')) {
      // Check if Telegram parameters are present
      if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID || !process.env.TELEGRAM_BOT_TOKEN == "" || !process.env.TELEGRAM_CHAT_ID == "") {
        console.error('Telegram parameters are missing. Cannot send notification.');
      } else {
        console.log(`${timestamp} - Sending notification: ${message}`);
        sendTelegramMessage(
          `${process.env.TELEGRAM_BOT_TOKEN}`,
          `${process.env.TELEGRAM_CHAT_ID}`,
          message
        );
      }
    }


    if (actionTypes.includes('Place Custom Order')) {
      console.log(`${timestamp} - Placing custom order: ${message}`);
      createPosition(baseSymbol, market, stake, leverage).catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
    }

    ruleState[rule.name] = true;
  } else {
    const timestamp = new Date().toUTCString();
    console.log(`${timestamp} - Action for rule ${rule.name} already executed. Skipping.`);
  }
}

cron.schedule('*/15 * * * * *', async () => {
  try {
    const timestamp = new Date().toUTCString();

    for (const rule of rules) {
      if (rule.enable !== 'True') {
        console.log(`${timestamp} - Condition for ${rule.symbols.join(', ')} is disabled`);
        continue;
      }
      
      const prices = await Promise.all(rule.symbols.map(symbol => price(symbol)));
      console.log(`${timestamp} - Prices for ${rule.symbols.join(', ')}: ${prices.join(', ')}`);
      const conditionResult = evaluateCondition(rule.condition, prices);
      console.log(`${timestamp} - Rule: ${rule.name} is ${conditionResult}`);
      console.log(`Rule: ${rule.name} is ${conditionResult}`);
      if (evaluateCondition(rule.condition, prices)) {
        executeAction(rule);
      } else {
        // Reset the state if the condition is not true
        ruleState[rule.id] = false;
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// Function to evaluate the condition string
const evaluateCondition = (condition, prices) => {
  const sanitizedCondition = condition.replace(/prices\[(\d+)\]/g, (_, index) => prices[parseInt(index, 10)]);
  console.log(`Sanitized Condition: ${sanitizedCondition}`);
  return eval(sanitizedCondition);
};

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

async function price(symbol) {
  const currentPrice = await getCurrentPrice(symbol);
  return currentPrice;
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});




