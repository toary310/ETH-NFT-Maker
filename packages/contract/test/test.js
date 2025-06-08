const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Web3Mint", function () {
  let mintContract;
  let owner;
  let user1;

  beforeEach(async function () {
    // アカウントを取得
    [owner, user1] = await ethers.getSigners();

    // コントラクトをデプロイ
    const Web3Mint = await ethers.getContractFactory("Web3Mint");
    mintContract = await Web3Mint.deploy();
    await mintContract.waitForDeployment(); // v6の新しい構文
  });

  it("Should return the nft", async function () {
    const testURI = "https://example.com/metadata/1.json";
    const mintPrice = await mintContract.mintPrice();
    
    // NFTをミント
    await expect(
      mintContract.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice })
    ).to.emit(mintContract, "NFTMinted")
      .withArgs(1, user1.address, testURI, testURI); // 4個の引数に修正

    // NFTの所有者とURIを確認
    expect(await mintContract.ownerOf(1)).to.equal(user1.address);
    expect(await mintContract.tokenURI(1)).to.equal(testURI);
    expect(await mintContract.totalSupply()).to.equal(1);
  });

  it("Should set the right owner", async function () {
    expect(await mintContract.owner()).to.equal(owner.address);
  });

  it("Should have correct initial settings", async function () {
    expect(await mintContract.name()).to.equal("TanyaNFT");
    expect(await mintContract.symbol()).to.equal("TANYA");
    expect(await mintContract.mintPrice()).to.equal(ethers.parseEther("0.001"));
    expect(await mintContract.MAX_SUPPLY()).to.equal(10000);
    expect(await mintContract.mintingEnabled()).to.equal(true);
  });

  it("Should mint IPFS NFT correctly", async function () {
    const testName = "Legacy Test IPFS NFT";
    const testDescription = "This is a legacy test for IPFS functionality";
    const testIPFSHash = "QmTestLegacyIPFSHash";
    const mintPrice = await mintContract.mintPrice();
    
    // IPFS NFTをミント
    await expect(
      mintContract.connect(user1).mintIpfsNFT(testName, testDescription, testIPFSHash, { value: mintPrice })
    ).to.emit(mintContract, "IPFSNFTMinted")
      .withArgs(1, user1.address, testIPFSHash);

    // NFT情報を確認
    const nftInfo = await mintContract.getNFTInfo(1);
    expect(nftInfo.name).to.equal(testName);
    expect(nftInfo.description).to.equal(testDescription);
    expect(nftInfo.imageURI).to.equal(`ipfs://${testIPFSHash}`);
    expect(nftInfo.minter).to.equal(user1.address);
    
    // 所有者を確認
    expect(await mintContract.ownerOf(1)).to.equal(user1.address);
    expect(await mintContract.totalSupply()).to.equal(1);
  });
});
