const axios = require('axios');
const pivotCalculations = require('../helpers/pivotFloorCalculations');
const camarillaCalculations = require('../helpers/camarillaCalculations');

const {
    twoDayVAR,
    twoDayVARString,
    Breakout
} = require('../helpers/pivotCalculator');

const {
    ConfluenceSig,
    side,
    BiasInc,
    market,
    signalQuality,
    tradeParameters,
    TC,
    BC
} = require('../helpers/signalGenerator')

async function getCandlestickData(pairs) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const formattedToday = today.toISOString().split('T')[0];
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    const candlestickDataPromises = pairs.split(',').map(async (pair) => {
        const [baseCurrency, quoteCurrency] = pair.split('/');
        const response = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday`,
            {
                params: {
                    fsym: baseCurrency,
                    tsym: quoteCurrency,
                    limit: 2, // 2 days to ensure we have enough data for the last two days
                },
            }
        );

        const coinData = response.data.Data.Data;

        // Filter data for the last two days
        const filteredData = coinData.filter((data) => {
            const date = new Date(data.time * 1000).toISOString().split('T')[0];
            return date >= formattedYesterday;
        });

        // Group candlestick data by day
        const groupedData = {};
        filteredData.forEach((data) => {
            const date = new Date(data.time * 1000).toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = [];
            }
            groupedData[date].push({
                time: data.time * 1000,
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
            });
        });

        const floorValuesByDay = {};

        // Calculate floor values for each day
        for (const [date, candles] of Object.entries(groupedData)) {
            const floorValues = {};
            for (let i = 1; i < 6; i++) {
                const floorValueP = pivotCalculations(0, 0, i, candles);
                const floorValueR = pivotCalculations(0, 1, i, candles);
                const floorValueS = pivotCalculations(0, 2, i, candles);
                floorValues[`P${i}`] = floorValueP.toFixed(4);
                floorValues[`R${i}`] = floorValueR.toFixed(4);
                floorValues[`S${i}`] = floorValueS.toFixed(4);
            }
            floorValuesByDay[date] = floorValues;
        }

        const camarillaValuesByDay = {};

        // Calculate camarilla values for each day
        for (const [date, candles] of Object.entries(groupedData)) {
            const camarillaValues = {};
            for (let i = 1; i < 6; i++) {
                const camarillaValueH = camarillaCalculations(0, 1, i, candles);
                const camarillaValueL = camarillaCalculations(0, 2, i, candles);
                camarillaValues[`L${i}`] = camarillaValueL.toFixed(4);
                camarillaValues[`H${i}`] = camarillaValueH.toFixed(4); // Fixed this line
            }
            camarillaValuesByDay[date] = camarillaValues; // Fixed this line
        }

        const floorValues2 = floorValuesByDay[formattedYesterday];
        const floorValues1 = floorValuesByDay[formattedToday];
        const camarillaValues2 = camarillaValuesByDay[formattedYesterday];
        const camarillaValues1 = camarillaValuesByDay[formattedToday];

        // Extract values for H3 and L3 camarilla values
        const camarillaTwoVar = {
            pH3: camarillaValues2.H3,
            pL3: camarillaValues2.L3,
            cH3: camarillaValues1.H3,
            cL3: camarillaValues1.L3
        };

        const floorTwoVar = {
            pH3: TC(floorValues2),
            pL3: BC(floorValues2),
            cH3: TC(floorValues1),
            cL3: BC(floorValues1)
        }

        const camarillaPivotValues = {
            H5: camarillaValues1.H5,
            H4: camarillaValues1.H4,
            H3: camarillaValues1.H3,
            H2: camarillaValues1.H2,
            H1: camarillaValues1.H1,
            L1: camarillaValues1.L1,
            L2: camarillaValues1.L2,
            L3: camarillaValues1.L3,
            L4: camarillaValues1.L4,
            L5: camarillaValues1.L5,
        }

        const floorPivotValues = {
            R4: floorValues1.R4,
            R3: floorValues1.R3,
            R2: floorValues1.R2,
            R1: floorValues1.R1,
            TC: TC(floorValues1),
            PP: floorValues1.P1,
            BC: BC(floorValues1),
            S1: floorValues1.S1,
            S2: floorValues1.S2,
            S3: floorValues1.S3,
            S4: floorValues1.S4,
        }

        const camTwoDayVar = twoDayVARString(twoDayVAR(camarillaTwoVar));
        const flrTwoDayVar = twoDayVARString(twoDayVAR(floorTwoVar));
        const gpz = ConfluenceSig(BC(floorValues1), TC(floorValues1), camarillaValues1.H2, camarillaValues1.H3, camarillaValues1.L2, camarillaValues1.L3);
        const pCorrelation = twoDayVARString(Breakout(floorValues1, floorValues2));
        const biasStrength = BiasInc(twoDayVAR(floorTwoVar)) + BiasInc(twoDayVAR(floorTwoVar)) + BiasInc(Breakout(floorValues1, floorValues2));
        const qualityStrength = signalQuality(biasStrength);
        const marketDir = market(biasStrength, Breakout(floorValues1, floorValues2));
        const tradeExecution = side(marketDir, floorValues1.P1, floorValues1.P5);
        const parameters = tradeParameters(marketDir, floorValues1);

        return {
            symbol: pair,
            marketDirection: marketDir,
            tradeExecution,
            floorPivot: flrTwoDayVar,
            camarillaPivot: camTwoDayVar,
            pivotCorrelation: pCorrelation,
            goldenPivotZone: gpz,
            signalQuality: qualityStrength,
            tradeParameters: parameters,
            camarillaPivotPoints: camarillaPivotValues,
            floorPivotPoints: floorPivotValues
        };
    });

    return Promise.all(candlestickDataPromises);
}

module.exports = getCandlestickData;