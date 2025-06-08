const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3Mint", function () {
  let web3Mint;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // アカウントを取得
    [owner, user1, user2] = await ethers.getSigners();

    // コントラクトをデプロイ
    const Web3Mint = await ethers.getContractFactory("Web3Mint");
    web3Mint = await Web3Mint.deploy();
    await web3Mint.waitForDeployment(); // v6の新しい構文
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await web3Mint.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await web3Mint.name()).to.equal("TanyaNFT");
      expect(await web3Mint.symbol()).to.equal("TANYA");
    });

    it("Should have correct initial settings", async function () {
      expect(await web3Mint.mintPrice()).to.equal(ethers.parseEther("0.001"));
      expect(await web3Mint.MAX_SUPPLY()).to.equal(10000);
      expect(await web3Mint.mintingEnabled()).to.equal(true);
      expect(await web3Mint.getCurrentTokenId()).to.equal(1);
      expect(await web3Mint.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    const testURI = "https://example.com/metadata/1.json";

    it("Should mint NFT with correct payment", async function () {
      const mintPrice = await web3Mint.mintPrice();
      
      await expect(
        web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice })
      ).to.emit(web3Mint, "NFTMinted")
        .withArgs(1, user1.address, testURI);

      expect(await web3Mint.ownerOf(1)).to.equal(user1.address);
      expect(await web3Mint.tokenURI(1)).to.equal(testURI);
      expect(await web3Mint.totalSupply()).to.equal(1);
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.0005");
      
      await expect(
        web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: insufficientPayment })
      ).to.be.revertedWithCustomError(web3Mint, "InsufficientPayment");
    });

    it("Should fail with empty URI", async function () {
      const mintPrice = await web3Mint.mintPrice();
      
      await expect(
        web3Mint.connect(user1).makeAnEpicNFT("", { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "InvalidTokenURI");
    });

    it("Should fail when minting is disabled", async function () {
      await web3Mint.toggleMinting(false);
      const mintPrice = await web3Mint.mintPrice();
      
      await expect(
        web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "MintingDisabled");
    });
  });

  describe("Owner functions", function () {
    const testURI = "https://example.com/metadata/owner.json";

    it("Should allow owner to mint for free", async function () {
      await expect(
        web3Mint.ownerMint(user1.address, testURI)
      ).to.emit(web3Mint, "NFTMinted")
        .withArgs(1, user1.address, testURI);

      expect(await web3Mint.ownerOf(1)).to.equal(user1.address);
    });

    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.002");
      
      await expect(web3Mint.updateMintPrice(newPrice))
        .to.emit(web3Mint, "MintPriceUpdated")
        .withArgs(newPrice);

      expect(await web3Mint.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to toggle minting", async function () {
      await expect(web3Mint.toggleMinting(false))
        .to.emit(web3Mint, "MintingToggled")
        .withArgs(false);

      expect(await web3Mint.mintingEnabled()).to.equal(false);
    });

    it("Should allow owner to withdraw", async function () {
      // ユーザーがミントして残高を作る
      const mintPrice = await web3Mint.mintPrice();
      await web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await expect(web3Mint.withdraw())
        .to.changeEtherBalance(owner, mintPrice);
    });

    it("Should fail when non-owner tries to use owner functions", async function () {
      await expect(
        web3Mint.connect(user1).ownerMint(user2.address, testURI)
      ).to.be.revertedWithCustomError(web3Mint, "OwnableUnauthorizedAccount");

      await expect(
        web3Mint.connect(user1).updateMintPrice(ethers.parseEther("0.002"))
      ).to.be.revertedWithCustomError(web3Mint, "OwnableUnauthorizedAccount");
    });
  });

  describe("Supply limits", function () {
    it("Should track token IDs correctly", async function () {
      const testURI1 = "https://example.com/1.json";
      const testURI2 = "https://example.com/2.json";
      const mintPrice = await web3Mint.mintPrice();

      // 最初のミント
      await web3Mint.connect(user1).makeAnEpicNFT(testURI1, { value: mintPrice });
      expect(await web3Mint.getCurrentTokenId()).to.equal(2);
      expect(await web3Mint.totalSupply()).to.equal(1);

      // 2番目のミント
      await web3Mint.connect(user2).makeAnEpicNFT(testURI2, { value: mintPrice });
      expect(await web3Mint.getCurrentTokenId()).to.equal(3);
      expect(await web3Mint.totalSupply()).to.equal(2);
    });
  });
});
