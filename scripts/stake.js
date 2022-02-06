// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { ethers } = require("hardhat");

const contract = require("../artifacts/contracts/Stake.sol/Stake.json");
const contractAddress = "0x7115c8Aca94E7dBAEb8DadB57b81757d3d1851ee";
const provider = new hre.ethers.providers.AlchemyProvider("maticmum");
const Contract = new hre.ethers.Contract(
  contractAddress,
  contract.abi,
  provider
);

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
  const amount = ethers.utils.parseUnits("0.001", 18);
  const nonce = 1;

  const hash = getMessageHash(
    recipient.address,
    amount,
    nonce,
    contractAddress
  );

  const sign = await signer.signMessage(hash);
  let recovered = ethers.utils.verifyMessage(hash, sign);

  console.log(`signer address`, signer.address);
  console.log(`recovered`, recovered);

  const recipientSigner = Contract.connect(recipient);
  const messageSigner = await recipientSigner.getMessageSigner(
    amount,
    nonce,
    sign
  );
  console.log(`messageSigner`, messageSigner);

  // signer.signMessage(hash);
  // const recipientSigner = Contract.connect(recipient);
  // console.log(hash);

  // await recipientSigner.claimPayment(amount, nonce, hash, {
  //   gasLimit: 21000,
  // });

  // const balance = await Contract.getBalance();
  // console.log(balance);

  // const nonceOwner = await Contract.getNonceOwner(nonce);
  // console.log(nonceOwner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
