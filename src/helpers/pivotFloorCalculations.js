function pivotFloorCalculations(x, y, z, bars) {
    const bar = bars[x];

    const open = bar.open;
    const close = bar.close;
    const high = bar.high;
    const low = bar.low;

    const BC = (high + low) / 2;
    const PP = (high + low + close) / 3;
    const TC = PP + (PP - BC);
    const DC = PP - BC;

    const R1 = (2 * PP) - low;
    const R2 = PP + (high - low);
    const R3 = high + 2 * (PP - low);
    const R4 = R3 + (R2 - R1);

    const S1 = (2 * PP) - high;
    const S2 = PP - (high - low);
    const S3 = low - 2 * (high - PP);
    const S4 = S3 - (S1 - S2);

    switch (y) {
        case 0:
            switch (z) {
                case 1:
                    return PP;
                case 2:
                    return BC;
                case 3:
                    return TC;
                case 4:
                    return DC;
                case 5:
                    return close;
            }
            break;
        case 1:
            switch (z) {
                case 1:
                    return R1;
                case 2:
                    return R2;
                case 3:
                    return R3;
                case 4:
                    return R4;
                case 5:
                    return high;
            }
            break;
        case 2:
            switch (z) {
                case 1:
                    return S1;
                case 2:
                    return S2;
                case 3:
                    return S3;
                case 4:
                    return S4;
                case 5:
                    return low;
            }
            break;
    }
    return 0;
}

module.exports = pivotFloorCalculations;