// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { ethers } = require("hardhat");

const contract = require("../artifacts/contracts/Stake.sol/Stake.json");
const contractAddress = "0xaDA41bB2DD8c0b79ceC8F9dF1e0eeAa2EF165621";
const provider = new hre.ethers.providers.AlchemyProvider("maticmum");
const Contract = new hre.ethers.Contract(
  contractAddress,
  contract.abi,
  provider
);

async function signPayment(
  recipient,
  amount,
  nonce,
  _contractAddress,
  callback
) {
  var hash = hre.ethers.utils
    .solidityKeccak256(
      ["address", "uint256", "uint256", "address"],
      [recipient, amount, nonce, _contractAddress]
    )
    .toString("hex");
  const [signer] = await ethers.getSigners();

  signer.signMessage(hash, callback);
}

async function main(recipient) {
  const amount = ethers.utils.parseUnits("0.001", 18);
  await signPayment(recipient, amount, 1, contractAddress, () => {
    console.log("done");
  });
  const owner = await Contract.getNonceOwner(1);
  console.log(owner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
