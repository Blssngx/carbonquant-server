function ConfluenceSig(BC, TC, H2, H3, L2, L3) {
    // GPZ - Confluence
    // Buy Sentiment
    if (L2 >= BC && L2 <= TC) {
        if (L3 >= BC && L3 <= TC) {
            return "Bullish GPZ";
        }
    } else if (H2 <= BC && H2 >= TC) {
        // Sell Sentiment
        if (H3 <= BC && H3 >= TC) {
            return "Bearish GPZ";
        }
    }
    return "None";
}

function side(market, price, open) {
    if (market == "Bullish") {
        if (price > open) {
            return "Buy Stop";
        } else if (price < open) {
            return "Buy Limit";
        }
    } else if (market == "Bearish") {
        if (price < open) {
            return "Sell Stop";
        } else if (price > open) {
            return "Sell Limit";
        }
    } else {
        return " - ";
    }
}

function BiasInc(twoDayValue) {
    if (twoDayValue === 3 || twoDayValue === 4) {
        return 1;
    } else if (twoDayValue === 5 || twoDayValue === 6) {
        return -1;
    } else {
        return 0;
    }
}

function market(BiasStrength, Breakout) {
    if (BiasStrength > 0 || (BiasStrength === 0 && Breakout === 3)) {
        return "Bullish";
    } else if (BiasStrength < 0 || (BiasStrength === 0 && Breakout === 5)) {
        return "Bearish";
    }
}

function signalQuality(BiasStrength) {
    switch (Math.abs(BiasStrength)) {
        case 1:
            return "Poor";
        case 2:
            return "Fair";
        case 3:
            return "Best";
        default:
            return "Neutral";
    }
}

function tradeParameters(market, flr) {
    let entry, sl, tp1, tp2;

    if (market === "Bullish") {
        entry = flr.P1;
        sl = flr.S1;
        tp1 = flr.R1;
        tp2 = flr.R2;
    } else if (market === "Bearish") {
        entry = flr.P1;
        sl = flr.R1;;
        tp1 = flr.S1;
        tp2 = flr.S2;
    }

    return { entry, sl, tp1, tp2 };
}

function TC(flrFunction) {
    const flrValue1 = flrFunction.P2;
    const flrValue2 = flrFunction.P3;

    return flrValue1 > flrValue2 ? flrValue1 : flrValue2;
}

function BC(flrFunction) {
    const flrValue1 = flrFunction.P2;
    const flrValue2 = flrFunction.P3;

    return flrValue1 > flrValue2 ? flrValue2 : flrValue1;
}

module.exports = {
    ConfluenceSig,
    side,
    BiasInc,
    market,
    signalQuality,
    tradeParameters,
    TC,
    BC,
};
