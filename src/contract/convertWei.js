// convertWei.js
function convertWei(amountString) {
    // const wei = BigInt(amountString);
  
    // Define conversion factors
    const weiToEther = BigInt('1000000000000000000'); // 1 CELO = 10^18 wei
    const weiToMWei = BigInt('1000000'); // 1 cUSD = 10^6 wei
  
    // Perform the conversion
    let result;
    result = amountString * BigInt('1000000000000000000');
    // switch (fromUnit) {
    //   case 'wei':
    //     result = wei / (toUnit === 'ether' ? weiToEther : weiToMWei);
    //     break;
    //   case 'ether':
    //     result = wei * weiToEther;
    //     break;
    //   case 'mwei':
    //     result = wei * weiToMWei * weiToEther;
    //     break;
    //   default:
    //     throw new Error('Unsupported units');
    // }
  
    return result.toString();
  }
  
  module.exports = convertWei;
  