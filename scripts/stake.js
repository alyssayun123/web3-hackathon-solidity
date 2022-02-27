// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { ethers } = require("hardhat");
const crypto = require("crypto");

const contract = require("../artifacts/contracts/Stake.sol/Stake.json");
const contractAddress = "0xCC186f8c31Ad9e07Fbf9bd60cf3EF8361d58Bb44";
const provider = new hre.ethers.providers.AlchemyProvider("maticmum");
const Contract = new hre.ethers.Contract(
  contractAddress,
  contract.abi,
  provider
);

const getRandomUint256 = () => {
  return ethers.BigNumber.from(crypto.randomBytes(32)).toString();
};

function getMessageHash(recipient, amount, nonce, _contractAddress) {
  var hash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256", "address"],
    [recipient, amount, nonce, _contractAddress]
  );
  let messageHashBinary = ethers.utils.arrayify(hash);
  return messageHashBinary;
}

async function main() {
  const [signer, recipient] = await ethers.getSigners();
  const amount = ethers.utils.parseUnits("0.0001", 18);
  const nonce = getRandomUint256();

  const hash = getMessageHash(
    recipient.address,
    amount,
    nonce,
    contractAddress
  );

  /** step1: sign the transaction and stake with signer */
  const sign = await signer.signMessage(hash);
  const stakeTx = await Contract.connect(signer).stake(amount, nonce, {
    value: amount,
  });
  await stakeTx.wait();

  /** step2: verify nonce owner is signer */
  const nonceOwner = await Contract.getNonceOwner(nonce);
  console.log("step2: verify nonce owner is signer");
  console.log(`nonceOwner`, nonceOwner);

  /** step3: verify recipient can claim the correct amount staked */
  const recipientSigner = Contract.connect(recipient);
  const stakedBalance = await recipientSigner.getStakedBalanceOf(
    signer.address
  );
  console.log("step3: verify recipient can claim the amount staked");
  console.log(`stakedBalance`, stakedBalance);

  /** step4: claim payment */
  const paymentTx = await recipientSigner.claimPayment(amount, nonce, sign);
  await paymentTx.wait();

  /** step5: new staked balance should be 0 */
  const newStakedBalance = await recipientSigner.getStakedBalanceOf(
    signer.address
  );
  console.log("step5: new staked balance should be 0");
  console.log(`newStakedBalance`, newStakedBalance);

  /** step6: new nonce owner should be null address */
  const newNonceOwner = await Contract.getNonceOwner(nonce);
  console.log("step6: new nonce owner should be null address");
  console.log(`newNonceOwner`, newNonceOwner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
