// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const contract = require("../artifacts/contracts/Stake.sol/Stake.json");
const contractAddress = "0xaDA41bB2DD8c0b79ceC8F9dF1e0eeAa2EF165621";
const Contract = new hre.ethers.Contract(
  contractAddress,
  contract.abi,
  new hre.ethers.providers.AlchemyProvider("maticmum")
);
async function main() {
  const balance = await Contract.getBalance();
  console.log(balance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
