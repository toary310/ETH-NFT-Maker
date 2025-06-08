const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * IPFS画像URLのログ出力関数
 * @param {string} ipfsHash - IPFSハッシュ
 * @param {string} gateway - IPFSゲートウェイURL（デフォルト: https://ipfs.io/ipfs/）
 * @returns {string} - 画像URL
 */
const logIPFSImageUrl = (ipfsHash, gateway = 'https://ipfs.io/ipfs/') => {
  const imageUrl = `${gateway}${ipfsHash}`;
  console.log('\n=== IPFS Image URL Information ===');
  console.log('🔗 Primary IPFS Image URL:', imageUrl);
  console.log('📋 Alternative Gateway URLs:');
  console.log('  • Cloudflare IPFS:', `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`);
  console.log('  • Infura IPFS:', `https://ipfs.infura.io/ipfs/${ipfsHash}`);
  console.log('  • Pinata Gateway:', `https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
  console.log('  • IPFS Protocol:', `ipfs://${ipfsHash}`);
  console.log('  • Dweb Link:', `https://dweb.link/ipfs/${ipfsHash}`);
  console.log('================================\n');
  return imageUrl;
};

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
    
    console.log('🎯 Testing NFT with URI:', testURI);
    
    // NFTをミント
    await expect(
      mintContract.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice })
    ).to.emit(mintContract, "NFTMinted")
      .withArgs(1, user1.address, testURI, testURI); // 4個の引数に修正

    // NFTの所有者とURIを確認
    expect(await mintContract.ownerOf(1)).to.equal(user1.address);
    expect(await mintContract.tokenURI(1)).to.equal(testURI);
    expect(await mintContract.totalSupply()).to.equal(1);
    
    console.log('✅ NFT minted successfully with URI:', testURI);
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
    
    console.log('\n🚀 Starting IPFS NFT Mint Test');
    console.log('📝 NFT Name:', testName);
    console.log('📄 NFT Description:', testDescription);
    console.log('🔑 IPFS Hash:', testIPFSHash);
    
    // IPFS画像URLをログ出力
    logIPFSImageUrl(testIPFSHash);
    
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
    
    console.log('✅ IPFS NFT minted successfully!');
    console.log('🎨 Final Image URI:', nftInfo.imageURI);
    console.log('👤 Minter Address:', nftInfo.minter);
    console.log('🏷️ Token ID: 1');
    console.log('📊 Total Supply:', (await mintContract.totalSupply()).toString());
  });

  it("Should mint multiple IPFS NFTs and display all URLs", async function () {
    const testCases = [
      {
        name: "Test IPFS NFT #1",
        description: "First test IPFS NFT",
        hash: "QmTestHash1ABC123"
      },
      {
        name: "Test IPFS NFT #2", 
        description: "Second test IPFS NFT",
        hash: "QmTestHash2DEF456"
      },
      {
        name: "Test IPFS NFT #3",
        description: "Third test IPFS NFT", 
        hash: "QmTestHash3GHI789"
      }
    ];
    
    const mintPrice = await mintContract.mintPrice();
    
    console.log('\n🎯 Testing Multiple IPFS NFT Minting');
    console.log('📈 Number of NFTs to mint:', testCases.length);
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const tokenId = i + 1;
      
      console.log(`\n--- Minting NFT #${tokenId} ---`);
      console.log('📝 Name:', testCase.name);
      console.log('📄 Description:', testCase.description);
      console.log('🔑 IPFS Hash:', testCase.hash);
      
      // IPFS画像URLをログ出力
      logIPFSImageUrl(testCase.hash);
      
      // IPFS NFTをミント
      await expect(
        mintContract.connect(user1).mintIpfsNFT(testCase.name, testCase.description, testCase.hash, { value: mintPrice })
      ).to.emit(mintContract, "IPFSNFTMinted")
        .withArgs(tokenId, user1.address, testCase.hash);
      
      // NFT情報を確認
      const nftInfo = await mintContract.getNFTInfo(tokenId);
      expect(nftInfo.name).to.equal(testCase.name);
      expect(nftInfo.description).to.equal(testCase.description);
      expect(nftInfo.imageURI).to.equal(`ipfs://${testCase.hash}`);
      expect(nftInfo.minter).to.equal(user1.address);
      
      console.log(`✅ NFT #${tokenId} minted successfully!`);
    }
    
    // 最終的な総供給量を確認
    expect(await mintContract.totalSupply()).to.equal(testCases.length);
    
    console.log('\n🎉 All IPFS NFTs minted successfully!');
    console.log('📊 Final Total Supply:', (await mintContract.totalSupply()).toString());
    
    // 全てのNFTの情報をまとめて表示
    console.log('\n📋 Summary of All Minted IPFS NFTs:');
    for (let i = 1; i <= testCases.length; i++) {
      const nftInfo = await mintContract.getNFTInfo(i);
      const ipfsHash = nftInfo.imageURI.replace('ipfs://', '');
      console.log(`  Token #${i}: ${nftInfo.name}`);
      console.log(`    🔗 IPFS URL: https://ipfs.io/ipfs/${ipfsHash}`);
      console.log(`    📄 Description: ${nftInfo.description}`);
    }
  });
});
