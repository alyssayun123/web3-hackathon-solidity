const { ethers } = require("hardhat");

function getMessageHash(recipient, amount, nonce, _contractAddress) {
  var hash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256", "address"],
    [recipient, amount, nonce, _contractAddress]
  );
  let messageHashBinary = ethers.utils.arrayify(hash);
  return messageHashBinary;
}

module.exports = {
  getMessageHash,
};
