function twoDayVAR(flrcam) {
    const pH = flrcam.pH3;
    const cH = flrcam.cH3;
    const pL = flrcam.pL3;
    const cL = flrcam.cL3;

    // Unchanged Value - Sideways/Breakout
    if (pH === cH && pL === cL) {
        return 0;
    } else if (pH < cH && pL > cL) {
        // Outside Value - Sideways
        return 1;
    } else if (pH > cH && pL < cL) {
        // Inside Value - Breakout
        return 2;
    } else if (pH < cL) {
        // Higher Value - Bullish
        return 3;
    } else if (pH < cH && pL < cL && pH > cL && pL < cH) {
        // Overlapping Higher Value - Moderately Bullish
        return 4;
    } else if (pL > cH) {
        // Lower Value - Bearish
        return 5;
    } else if (pH > cH && pL > cL && pH > cL && pL < cH) {
        // Overlapping Lower Value - Moderately Bearish
        return 6;
    }

    return 7;
}

function twoDayVARString(twoDayValue) {
    switch (twoDayValue) {
        case 0:
            return "Unchanged Value - Sideways/Breakout";
        case 1:
            return "Outside Value - Sideways";
        case 2:
            return "Inside Value - Breakout";
        case 3:
            return "Higher Value - Bullish";
        case 4:
            return "Overlapping Higher Value - Moderately Bullish";
        case 5:
            return "Lower Value - Bearish";
        case 6:
            return "Overlapping Lower Value - Moderately Bearish";
        default:
            return "Neutral";
    }
}

function Breakout(flrDC1, flrDC2) {
    // Pivot Correlation
    const currentDC = flrDC1.P4;
    const previousDC = flrDC2.P4;

    if (previousDC < 0 && currentDC > 0) {
        // Bullish Breakout
        return 3;
    } else if (previousDC > 0 && currentDC > 0) {
        // Bullish
        return 4;
    } else if (previousDC > 0 && currentDC < 0) {
        // Bearish Breakout
        return 5;
    } else if (previousDC < 0 && currentDC < 0) {
        // Bearish
        return 6;
    } else {
        return 7;
    }
}

module.exports = {
    twoDayVAR,
    twoDayVARString,
    Breakout,
};
