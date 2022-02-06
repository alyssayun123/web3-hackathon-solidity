const { expect } = require("chai");
const { ethers } = require("hardhat");

const { getMessageHash } = require("../helpers/getMessageHash");

describe("Stake Contract", () => {
  let stake;
  const nonce = 1;
  const amount = ethers.utils.parseUnits("0.001", 18);

  it("Should deploy", async () => {
    const Stake = await ethers.getContractFactory("Stake");
    stake = await Stake.deploy();
    await stake.deployed();
    expect(stake).to.be.ok;

    console.log("Stake deployed to:", stake.address);
  });

  describe("stake method", () => {
    it("Should stake the correct amount", async () => {
      const [signer] = await ethers.getSigners();

      // call the stake function
      const stakeTx = await stake.stake(amount, nonce, {
        value: amount,
      });
      await stakeTx.wait();

      expect(await stake.getStakedBalanceOf(signer.address)).to.equal(amount);
    });

    // it("Should throw if amount is incorect", async () => {
    //   const amount = ethers.utils.parseUnits("0.001", 18);

    //   expect(async () => await stake.stake(amount, nonce)).to.throw();
    // });

    it("Should change the nonce owner", async () => {
      const [signer] = await ethers.getSigners();

      const getNonceOwnerTx = await stake.getNonceOwner(nonce);
      expect(getNonceOwnerTx).to.equal(signer.address);
    });
  });

  describe("getMessageSigner method", () => {
    it("Should return the correct message", async () => {
      const [signer, recipient] = await ethers.getSigners();
      const hash = getMessageHash(
        recipient.address,
        amount,
        nonce,
        stake.address
      );

      const sign = await signer.signMessage(hash);

      const recipientSigner = stake.connect(recipient);

      const messageSigner = await recipientSigner.getMessageSigner(
        amount,
        nonce,
        sign
      );

      expect(messageSigner).to.equal(signer.address);
    });
  });

  describe("claimPayment method", () => {
    it("Should modify the staked amount", async () => {
      const [signer, recipient] = await ethers.getSigners();
      const hash = getMessageHash(
        recipient.address,
        amount,
        nonce,
        stake.address
      );

      const sign = await signer.signMessage(hash);

      const recipientSigner = stake.connect(recipient);

      const claimPaymentTx = await recipientSigner.claimPayment(
        amount,
        nonce,
        sign
      );
      await claimPaymentTx.wait();

      expect(await stake.getStakedBalanceOf(signer.address)).to.equal(0);
    });

    it("Should modify the nonce owner", async () => {
      const newNonceOwner = await stake.getNonceOwner(nonce);
      console.log(newNonceOwner);
      expect(newNonceOwner).to.equal(ethers.constants.AddressZero);
    });
  });
});
