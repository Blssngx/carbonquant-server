// Trigger function
const cron = require('node-cron');
const getCurrentPrice = require('./fetch/getCurrentPrice');
const { sendTelegramMessage } = require('./notification/telegram');
const createPosition = require('./contract/createPosition');

const rules = [
    // {
    //     id: 1,
    //     name: "BTC-BUY",
    //     enabled: true,
    //     conditions: {
    //         symbols: ["BTC", "LTC"],
    //         condition: (prices) => (prices[0] - prices[1]) / 2 < 1000,
    //     },
    //     action: {
    //         id: 1,
    //         actionTypes: ["Notification"],
    //         orderExecution: "Market order",
    //         orderType: "Buy",
    //         orderSize: "0.01",
    //         message: "Buy 0.01 BTC",
    //     }
    // },
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
    // {
    //     id: 3,
    //     name: "ETH-BUY",
    //     enabled: false,
    //     conditions: {
    //         symbols: ["ETH"],
    //         condition: (prices) => prices[0] > prices[0] + 1,
    //     },
    //     action: {
    //         id: 3,
    //         actionTypes: ["Notification"],
    //         orderExecution: "Market order",
    //         orderType: "Buy",
    //         orderSize: "0.01",
    //         message: "Buy 0.01 ETH",
    //     }
    // },
];

async function price(symbol) {
    const currentPrice = await getCurrentPrice(symbol);
    return currentPrice;
}

const ruleState = {};

function executeAction(rule) {
    if (!ruleState[rule.id]) {
        const { action } = rule;
        const timestamp = new Date().toUTCString(); // Get current timestamp in ISO format

        if (action) {
            console.log(`${timestamp} - Executing action for rule: ${rule.name}`);

            if (action.actionTypes.includes("Notification")) {
                console.log(`${timestamp} - Sending notification: ${action.message}`);
                // Add your code for sending notifications (e.g., via Telegram)
                // Send the message to Telegram using the function from the 'telegram' module
                sendTelegramMessage("6920662344:AAF8Z_3OiMqMyfbui7qZHAIEKjygsf46aOE", "916045875", action.message);
            }

            if (action.actionTypes.includes("Place Custom Order")) {
                console.log(`${timestamp} - Placing custom order: ${action.message}`);
                // Add your code for executing a trade based on the custom order parameters
                createPosition(
                    'btc',
                    'BUY',
                    '4',
                    '2',
                ).catch((error) => {
                    console.error(error);
                    process.exitCode = 1;
                });
            }

            // Set the state to true to indicate that the action has been executed
            ruleState[rule.id] = true;
        } else {
            console.log(`${timestamp} - No matching action found for rule: ${rule.name}`);
        }
    } else {
        const timestamp = new Date().toUTCString(); // Get current timestamp in ISO format
        console.log(`${timestamp} - Action for rule ${rule.name} already executed. Skipping.`);
    }
}

cron.schedule('*/15 * * * * *', async () => {
    try {
        const timestamp = new Date().toUTCString(); // Get current timestamp in ISO format

        for (const rule of rules) {
            if (!rule.enabled) {
                console.log(`${timestamp} - Condition for ${rule.conditions.symbols.join(', ')} is disabled`);
                continue;
            }

            const prices = await Promise.all(rule.conditions.symbols.map(symbol => price(symbol)));
            console.log(`${timestamp} - Rule: ${rule.name} is ${rule.conditions.condition(prices)}`);

            if (rule.conditions.condition(prices)) {
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
