function camarillaCalculations(x, y, z, bars) {
    const bar = bars[x];

    const open = bar.open;
    const close = bar.close;
    const high = bar.high;
    const low = bar.low;

    const RANGE = high - low;

    const H1 = close + (RANGE * 1.1 / 12);
    const H2 = close + (RANGE * 1.1 / 6);
    const H3 = close + (RANGE * 1.1 / 4);
    const H4 = close + (RANGE * 1.1 / 2);
    const H5 = (high / low) * close;

    const L1 = close - (RANGE * 1.1 / 12);
    const L2 = close - (RANGE * 1.1 / 6);
    const L3 = close - (RANGE * 1.1 / 4);
    const L4 = close - (RANGE * 1.1 / 2);
    const L5 = close - (H5 - close);

    switch (y) {
        case 0:
            switch (z) {
                case 1:
                    return RANGE;
                default:
                    return 0;
            }
        case 1:
            switch (z) {
                case 1:
                    return H1;
                case 2:
                    return H2;
                case 3:
                    return H3;
                case 4:
                    return H4;
                case 5:
                    return H5;
                default:
                    return 0;
            }
        case 2:
            switch (z) {
                case 1:
                    return L1;
                case 2:
                    return L2;
                case 3:
                    return L3;
                case 4:
                    return L4;
                case 5:
                    return L5;
                default:
                    return 0;
            }
        default:
            return 0;
    }
}

module.exports = camarillaCalculations;