const Web3 = require('web3');
const CONTRACT_ABI = require('./config');
const CONTRACT_ADDRESS = require('./config');

if (typeof web3 !== 'undefined') {
        var web3 = new Web3(web3.currentProvider); 
} else {
        var web3 = new Web3(new Web3.providers.HttpProvider('https://celo-mainnet.infura.io/v3/8f43ca69ad8f44218d6873f2f70bb8a2'));
}

// Create a contract instance
const contract = new web3.eth.Contract(CONTRACT_ABI.CONTRACT_ABI, CONTRACT_ADDRESS.CONTRACT_ADDRESS);

// Call the minExecutionFee function
contract.methods.minExecutionFee().call((error, result) => {
  if (!error) {
    console.log('minExecutionFee:', result);
  } else {
    console.error('Error calling minExecutionFee:', error);
  }
});
