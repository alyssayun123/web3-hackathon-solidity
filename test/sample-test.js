const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stake Contract", () => {
  let stake;

  it("Should deploy", async () => {
    const Stake = await ethers.getContractFactory("Stake");
    stake = await Stake.deploy();
    await stake.deployed();
    expect(stake).to.be.ok;

    console.log("Stake deployed to:", stake.address);
  });

  it("Should stake the correct amount", async () => {
    const [signer] = await ethers.getSigners();
    // const stakeWithSigner = stake.connect(signer);
    const amount = ethers.utils.parseUnits("0.001", 18);

    // call the stake function
    const stakeTx = await stake.stake(amount, 1, {
      value: amount,
    });
    await stakeTx.wait();

    expect(await stake.getBalance()).to.equal(amount);
    expect(await stake.getStakedBalanceOf(signer.address)).to.equal(amount);
  });
});
