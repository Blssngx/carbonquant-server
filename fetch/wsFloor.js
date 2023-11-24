const WebSocket = require('ws');
const moment = require('moment');
const pivotCalculations = require('../helpers/pivotFloorCalculations');

function connectAndCalculateFloorValues(appId, symbol, candleIndex) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);

        socket.on('open', function () {
            const candleTime = moment().utc().subtract(candleIndex, 'days');
            const startTime = candleTime.startOf('day').unix();
            const endTime = candleTime.endOf('day').unix();

            const sendMessage = JSON.stringify({
                ticks_history: symbol,
                adjust_start_time: 1,
                count: 1,
                end: endTime,
                granularity: 86400,
                start: startTime,
                style: "candles"
            });

            socket.send(sendMessage);
        });

        socket.on('message', function (data) {
            try {
                const parsedData = JSON.parse(data);

                if (parsedData.msg_type === 'candles' && parsedData.candles) {
                    const candlesData = parsedData.candles;

                    const extractedCandles = candlesData.map(candle => {
                        return {
                            open: candle.open,
                            close: candle.close,
                            high: candle.high,
                            low: candle.low,
                        };
                    });

                    const floorValues = {};

                    for (let i = 1; i < 6; i++) {
                        const floorValueP = pivotCalculations(0, 0, i, extractedCandles);
                        const floorValueR = pivotCalculations(0, 1, i, extractedCandles);
                        const floorValueS = pivotCalculations(0, 2, i, extractedCandles);
                        floorValues[`P${i}`] = floorValueP.toFixed(4);
                        floorValues[`R${i}`] = floorValueR.toFixed(4);
                        floorValues[`S${i}`] = floorValueS.toFixed(4);
                    }

                    resolve(floorValues); // Resolve the promise with camarilla values
                }
            } catch (error) {
                console.error('Error parsing message:', error);
                reject(error); // Reject the promise if there's an error
            }
        });

        socket.on('close', function (event) {
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[close] Connection died');
            }
        });

        socket.on('error', function (error) {
            console.log(`[error] ${error}`);
            reject(error); // Reject the promise if there's an error
        });
    });
}

module.exports = connectAndCalculateFloorValues;
