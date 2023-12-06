// main.js
// const convertWei = require('./src/contract/convertWei');

// Example usage:
const amountString = '24'; // 1 CELO in wei
const sizeDelta = "20423653259033587500000000000000"; 
                   24000000000000000000000000000000// USD value of position with the leverage
// Convert from wei to ether
const convertedToWei = BigInt(amountString) * BigInt('1000000000000000000');
console.log(`Converted to Wei: ${convertedToWei}`);

const convertedToMWei = convertedToWei * BigInt('1000000');
console.log(`Converted to MWei (cUSD): ${convertedToMWei}`);

const convertedToEther = BigInt(sizeDelta) / (BigInt('1000000000000') * BigInt('1000000000000000000'));
console.log(`Converted to Ether: ${convertedToEther}`);

const delta = BigInt(amountString) * (BigInt('1000000000000') * BigInt('1000000000000000000'));
console.log(`Converted to Ether: ${delta}`);