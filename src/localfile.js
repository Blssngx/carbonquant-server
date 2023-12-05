const fs = require('fs').promises;
const cron = require('node-cron');
const getCurrentPrice = require('./fetch/getCurrentPrice');

function readConditionsFile(filePath) {
    return fs.readFile(filePath, 'utf-8')
        .then(jsonString => JSON.parse(jsonString))
        .catch(error => {
            console.error('Error reading or parsing JSON file:', error);
            return null;
        });
}

const conditionsFilePath = './src/data/conditions.json';

readConditionsFile(conditionsFilePath)
    .then(conditions => {
        if (!conditions) {
            // Handle the case where conditions couldn't be loaded
            return;
        }

        function parseConditions(jsonString) {
            try {
                const conditions = JSON.parse(jsonString);
                conditions.forEach(condition => {
                    if (typeof condition.condition === 'string') {
                        condition.condition = eval(`(${condition.condition})`);
                    }
                });
                return conditions;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null;
            }
        }

        const parsedConditions = parseConditions(JSON.stringify(conditions));

        cron.schedule('*/15 * * * * *', async () => {
            try {
                for (const condition of parsedConditions) {
                    if (!condition.enabled) {
                        console.log(`Condition for ${condition.symbols.join(', ')} is disabled`);
                        continue;
                    }

                    const prices = await Promise.all(condition.symbols.map(symbol => price(symbol)));
                    console.log(prices);
                    console.log(`Rule: ${condition.rule} is ${condition.condition(prices)}`);
                }
            } catch (error) {
                console.error(error);
            }
        });
    });

async function price(symbol) {
    const currentPrice = await getCurrentPrice(symbol);
    return currentPrice;
}
