// Trigger function
const cron = require('node-cron');
const getCurrentPrice = require('./fetch/getCurrentPrice');

const conditions = [
    {
        rule: "BTC-BUY",
        symbols: ["BTC", "LTC"],
        condition: (prices) => (prices[0] - prices[1]) / 2 > 1000,
        enabled: true
    },
    {
        rule: "LTC-BUY",
        symbols: ["LTC", "ETH"],
        condition: (prices) => (prices[0] + prices[1]) / 2 < 1000,
        enabled: true
    },
    {
        rule: "ETH-BUY",
        symbols: ["ETH"],
        condition: (prices) => prices[0] > prices[0] + 1,
        enabled: false
    },
];


cron.schedule('*/15 * * * * *', async () => {
    try {
        const timestamp = new Date().toUTCString(); // Get current timestamp in ISO format

        for (const condition of conditions) {
            if (!condition.enabled) {
                console.log(`${timestamp} - Condition for ${condition.symbols.join(', ')} is disabled`);
                continue;
            }

            const prices = await Promise.all(condition.symbols.map(symbol => price(symbol)));
            // console.log(`${timestamp} - ${prices}`);
            console.log(`${timestamp} - Rule: ${condition.rule} is ${condition.condition(prices)}`);
        }
    } catch (error) {
        console.error(error);
    }
});

async function price(symbol) {
    const currentPrice = await getCurrentPrice(symbol);
    return currentPrice;
}
