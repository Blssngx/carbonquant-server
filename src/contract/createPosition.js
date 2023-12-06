// createPosition.js
const { ethers } = require('ethers');
const POSITION_ROUTER = require('./abi/IPositionRouter');
const VAULT = require('./abi/IVault');
const getHash = require('./getHash');
const isBuyAction = require('./isBuyAction');

async function createPosition(
//   privateKey,
//   nodeUrl,
  baseSymbol,
//   quoteSymbol,
  side,
  stake,
  leverage,
) {
//   const provider = new ethers.JsonRpcProvider(nodeUrl); // Replace with your Celo node URL
//   const wallet = new ethers.Wallet(privateKey, provider);

  const provider = new ethers.JsonRpcProvider('https://celo-mainnet.infura.io/v3/8f43ca69ad8f44218d6873f2f70bb8a2'); // Replace with your Celo node URL
  const wallet = new ethers.Wallet('ad6d49fae8bd723bdbf479dae8b9d488795a916a65e56ef2cabbb29f13f89d59', provider); // Replace with your private key


  const positionRouter = new ethers.Contract(
    POSITION_ROUTER.CONTRACT_ADDRESS,
    POSITION_ROUTER.CONTRACT_ABI,
    wallet
  );

  const vault = new ethers.Contract(
    VAULT.CONTRACT_ADDRESS,
    VAULT.CONTRACT_ABI,
    wallet
  );

  const executionFee = await positionRouter.minExecutionFee();
  const indexToken = getHash(baseSymbol);
//   const collateral = getHash(quoteSymbol);

  try {
    const maxPrice = await vault.getMaxPrice(indexToken);
    console.log("maxPrice: ", maxPrice.toString());
    const acceptablePrice = maxPrice;
    const collateral = "0x765DE816845861e75A25fCA122bb6898B8B1282a";;
    const isLong = side;
    const amountIn = BigInt(stake) * BigInt('1000000000000000000');
    const sizeDelta = BigInt(stake) * BigInt(leverage) * (BigInt('1000000000000') * BigInt('1000000000000000000')); // USD value of position with the leverage
    const minOut = 0;
    const referralCode = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const callbackTarget = "0x0000000000000000000000000000000000000000";

    const path = [collateral, indexToken];
    const tx = await positionRouter.createIncreasePosition(
      path,
      indexToken,
      amountIn,
      minOut,
      sizeDelta,
      isLong,
      acceptablePrice,
      executionFee,
      referralCode,
      callbackTarget,
      { value: executionFee }
    );

    console.log("tx: ", tx.hash);
  } catch (error) {
    console.error("Error creating position: ", error.shortMessage);
  }
}

module.exports = createPosition;