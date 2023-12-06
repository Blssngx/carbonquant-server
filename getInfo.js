// Run this script in a npm project with contractkit installed
// https://www.npmjs.com/package/@celo/contractkit

const { newKit } = require('@celo/contractkit')


// returns an object with {lockedGold, pending, cUSD, cEUR, cREAL}
async function wrapper() {
    // const CeloContract = Kit.CeloContract
    const kit = newKit('https://alfajores-forno.celo-testnet.org')
    const balances = await kit.getTotalBalance()
    console.log(balances)
    return balances
}


// returns an object with {cUSD, cEUR, cREAL}
// const balances = await miniKit.getTotalBalance()

// async function wrapper(){

//     let accounts = await kit.web3.eth.getAccounts()
//     let balance = await kit.getTotalBalance(accounts[0])

//     const goldTokenAddress = await kit.registry.addressFor(CeloContract.GoldToken)
//     const stableTokenAddress = await kit.registry.addressFor(CeloContract.StableToken)
//     const registryAddress = await kit.registry.addressFor(CeloContract.Registry)
//     const validatorsAddress = await kit.registry.addressFor(CeloContract.Validators)

//     console.log("Accounts: ", accounts)

//     for (let [key, value] of Object.entries(balance)) {
//         console.log(`${key}: ${value.toString(10)}`);
//     }

//     console.log("Gold Token Address: ", goldTokenAddress)
//     console.log("Stable Token Address: ", stableTokenAddress)
//     console.log("Registry Address: ", registryAddress)    
//     console.log("Validators Address: ", validatorsAddress)
// }

wrapper()