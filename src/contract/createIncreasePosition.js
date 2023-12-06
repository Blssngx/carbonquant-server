const { ethers } = require('ethers');
const POSITION_ROUTER = require('./abi/IPositionRouter');
const VAULT = require('./abi/IVault');

async function createIncreasePosition() {
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
  console.log("executionFee: ", executionFee.toString());

  const indexToken = "0xd71Ffd0940c920786eC4DbB5A12306669b5b81EF"; // Replace with the actual index token
  try {
    const maxPrice = await vault.getMaxPrice(indexToken);
    console.log("maxPrice: ", maxPrice.toString());

    const collateral = "0x765DE816845861e75A25fCA122bb6898B8B1282a"; // celo

    const path = [collateral, indexToken];
    const amountIn = "4000000000000000000"; // 4 CELO (in Wei)
    const minOut = 0;
    const sizeDelta = "20423653259033587500000000000000"; // USD value of position with the leverage
    const isLong = true;
    const acceptablePrice = maxPrice;
    const referralCode = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const callbackTarget = "0x0000000000000000000000000000000000000000";

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
    // return tx;
  } catch (error) {
    console.error("Error fetching signal data: ", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
createIncreasePosition().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
