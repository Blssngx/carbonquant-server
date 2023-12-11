// createPosition.js
const { ethers } = require('ethers');
const POSITION_ROUTER = require('./abi/IPositionRouter');
const VAULT = require('./abi/IVault');
const getHash = require('./helper/getHash');

async function createPosition(
  baseSymbol,
  side,
  stake,
  leverage,
) {
  const privateKey = process.env.PRIVATE_KEY;
  const infuraKey = process.env.INFURA_KEY;

  const provider = new ethers.JsonRpcProvider(`https://celo-mainnet.infura.io/v3/${infuraKey}`); // Replace with your Celo node URL
  const wallet = new ethers.Wallet(`${privateKey}`, provider); // Replace with your private key


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

  try {
    const maxPrice = await vault.getMaxPrice(indexToken);
    console.log("maxPrice: ", maxPrice.toString());
    const acceptablePrice = maxPrice;
    const collateral = "0x765DE816845861e75A25fCA122bb6898B8B1282a";;
    const isLong = side === 'BUY';
    console.log("isLong: ", isLong);
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
