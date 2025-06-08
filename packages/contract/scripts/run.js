const hre = require("hardhat");
const { ethers } = hre;

/**
 * Web3Mint NFT contract local test script with IPFS support
 * 
 * Usage:
 * npx hardhat run scripts/run.js
 */
async function main() {
  try {
    console.log("🧪 Starting Web3Mint NFT contract (IPFS supported) local test...");
    
    // Get test accounts
    const [owner, user1, user2] = await ethers.getSigners();
    
    console.log("📋 Test accounts:");
    console.log(`  Owner: ${await owner.getAddress()}`);
    console.log(`  User1: ${await user1.getAddress()}`);
    console.log(`  User2: ${await user2.getAddress()}`);
    
    // Deploy contract
    console.log("\n📦 Deploying Web3Mint contract...");
    const Web3Mint = await ethers.getContractFactory("Web3Mint");
    const nftContract = await Web3Mint.deploy();
    await nftContract.waitForDeployment();
    
    const contractAddress = await nftContract.getAddress();
    console.log(`✅ Contract address: ${contractAddress}`);
    
    // Check initial contract state
    console.log("\n🔍 Contract information:");
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();
    const owner_address = await nftContract.owner();
    const mintPrice = await nftContract.mintPrice();
    const maxSupply = await nftContract.MAX_SUPPLY();
    const currentTokenId = await nftContract.getCurrentTokenId();
    const totalSupply = await nftContract.totalSupply();
    
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Owner: ${owner_address}`);
    console.log(`  Mint price: ${ethers.formatEther(mintPrice)} ETH`);
    console.log(`  Max supply: ${maxSupply.toString()}`);
    console.log(`  Next token ID: ${currentTokenId.toString()}`);
    console.log(`  Current total supply: ${totalSupply.toString()}`);
    
    // Test metadata URIs
    const testMetadataURIs = [
      "https://example.com/metadata/1.json",
      "https://example.com/metadata/2.json",
      "https://example.com/metadata/3.json"
    ];

    // Test IPFS hashes
    const testIPFSHashes = [
      "QmYFNwqT8eZ6FybqwYS8e1X2Zl5TQaB3hMxRbC7PvKdUfG",
      "QmTWZGnCyQ9Xx4YvFpKhJe8MzLqNfPsRnK5WGbHdT6VcAe",
      "QmDxMnKyH5fYQ3vFgCsLwT9WjPr6XeGcV4RoE2KyUpNzB8"
    ];
    
    console.log("\n🎨 Starting NFT minting tests...");
    
    // 1. Traditional NFT minting
    console.log("\n1️⃣ Traditional NFT minting:");
    let txn = await nftContract.ownerMint(await owner.getAddress(), testMetadataURIs[0]);
    await txn.wait();
    console.log(`  ✅ Traditional NFT #1 minted successfully`);
    console.log(`  📋 Transaction: ${txn.hash}`);
    
    // 2. IPFS paid minting (User1)
    console.log("\n2️⃣ IPFS NFT minting (User1):");
    const ipfsMintTx1 = await nftContract.connect(user1).mintIpfsNFT(
      "Awesome IPFS NFT #1",
      "This is a cool NFT stored on IPFS with dynamic metadata",
      testIPFSHashes[0],
      { value: mintPrice }
    );
    await ipfsMintTx1.wait();
    console.log(`  ✅ IPFS NFT #2 minted successfully`);
    console.log(`  📋 Transaction: ${ipfsMintTx1.hash}`);
    console.log(`  🌐 IPFS Hash: ${testIPFSHashes[0]}`);
    
    // 3. IPFS paid minting (User2)
    console.log("\n3️⃣ IPFS NFT minting (User2):");
    const ipfsMintTx2 = await nftContract.connect(user2).mintIpfsNFT(
      "Epic IPFS Collection #2",
      "Another amazing NFT with on-chain metadata generation",
      testIPFSHashes[1],
      { value: mintPrice }
    );
    await ipfsMintTx2.wait();
    console.log(`  ✅ IPFS NFT #3 minted successfully`);
    console.log(`  📋 Transaction: ${ipfsMintTx2.hash}`);
    console.log(`  🌐 IPFS Hash: ${testIPFSHashes[1]}`);
    
    // 4. Owner IPFS free minting
    console.log("\n4️⃣ Owner IPFS free minting:");
    const ownerIpfsTx = await nftContract.ownerMintIpfs(
      await owner.getAddress(),
      "Special Owner NFT",
      "Exclusive NFT for the contract owner",
      testIPFSHashes[2]
    );
    await ownerIpfsTx.wait();
    console.log(`  ✅ Owner IPFS NFT #4 minted successfully`);
    console.log(`  📋 Transaction: ${ownerIpfsTx.hash}`);
    
    // 5. Error test: IPFS minting with empty name
    console.log("\n5️⃣ Error test - IPFS minting with empty name:");
    try {
      await nftContract.connect(user1).mintIpfsNFT(
        "",
        "Description without name",
        testIPFSHashes[0],
        { value: mintPrice }
      );
      console.log("  ❌ Error should have occurred");
    } catch (error) {
      console.log(`  ✅ Expected error: ${error.message.includes("EmptyName") ? "EmptyName" : "Name error"}`);
    }
    
    // 6. Error test: Invalid IPFS hash
    console.log("\n6️⃣ Error test - Invalid IPFS hash:");
    try {
      await nftContract.connect(user1).mintIpfsNFT(
        "Valid Name",
        "Valid Description",
        "",
        { value: mintPrice }
      );
      console.log("  ❌ Error should have occurred");
    } catch (error) {
      console.log(`  ✅ Expected error: ${error.message.includes("InvalidIPFSHash") ? "InvalidIPFSHash" : "IPFS error"}`);
    }
    
    // 7. NFT information and metadata verification
    console.log("\n🔍 NFT information and metadata verification:");
    for (let i = 1; i <= 4; i++) {
      try {
        const tokenOwner = await nftContract.ownerOf(i);
        const tokenURI = await nftContract.tokenURI(i);
        console.log(`\n  Token #${i}:`);
        console.log(`    Owner: ${tokenOwner}`);
        
        // For IPFS NFTs, display NFT information
        if (i >= 2) {
          const nftInfo = await nftContract.getNFTInfo(i);
          console.log(`    Name: ${nftInfo.name}`);
          console.log(`    Description: ${nftInfo.description}`);
          console.log(`    Image URI: ${nftInfo.imageURI}`);
          console.log(`    Minter: ${nftInfo.minter}`);
          console.log(`    Timestamp: ${nftInfo.timestamp.toString()}`);
        }
        
        // Display metadata URI preview
        const uriPreview = tokenURI.length > 100 ? 
          tokenURI.substring(0, 100) + "..." : tokenURI;
        console.log(`    Metadata URI: ${uriPreview}`);
        
        // Try to decode Base64 for data:application/json;base64
        if (tokenURI.startsWith("data:application/json;base64,")) {
          try {
            const base64Data = tokenURI.split(",")[1];
            const jsonData = Buffer.from(base64Data, 'base64').toString('utf8');
            const metadata = JSON.parse(jsonData);
            console.log(`    Decoded metadata:`);
            console.log(`      Name: ${metadata.name}`);
            console.log(`      Description: ${metadata.description}`);
            console.log(`      Image: ${metadata.image}`);
          } catch (e) {
            console.log(`    Failed to decode metadata: ${e.message}`);
          }
        }
      } catch (error) {
        console.log(`  Token #${i}: Does not exist`);
      }
    }
    
    // 8. Admin function tests
    console.log("\n⚙️  Admin function tests:");
    
    // Update mint price
    const newPrice = ethers.parseEther("0.002");
    const updatePriceTx = await nftContract.updateMintPrice(newPrice);
    await updatePriceTx.wait();
    const updatedPrice = await nftContract.mintPrice();
    console.log(`  ✅ Mint price updated: ${ethers.formatEther(updatedPrice)} ETH`);
    
    // Disable minting
    const toggleTx = await nftContract.toggleMinting(false);
    await toggleTx.wait();
    const mintingEnabled = await nftContract.mintingEnabled();
    console.log(`  ✅ Minting disabled: ${mintingEnabled}`);
    
    // Test IPFS minting after disabling
    console.log("\n7️⃣ IPFS minting test after disabling:");
    try {
      await nftContract.connect(user1).mintIpfsNFT(
        "Should Fail NFT",
        "This should fail because minting is disabled",
        testIPFSHashes[0],
        { value: newPrice }
      );
      console.log("  ❌ Error should have occurred");
    } catch (error) {
      console.log(`  ✅ Expected error: ${error.message.includes("MintingDisabled") ? "MintingDisabled" : "Minting error"}`);
    }
    
    // Re-enable minting
    const reEnableTx = await nftContract.toggleMinting(true);
    await reEnableTx.wait();
    console.log("  ✅ Minting re-enabled");
    
    // Check contract balance
    const contractBalance = await nftContract.getContractBalance();
    console.log(`\n💰 Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
    
    // Final state verification
    const finalTotalSupply = await nftContract.totalSupply();
    const finalCurrentTokenId = await nftContract.getCurrentTokenId();
    
    // Convert BigInt to Number for calculation
    const totalSupplyNum = Number(finalTotalSupply);
    const ipfsNFTCount = totalSupplyNum - 1;
    
    console.log("\n📊 Final state:");
    console.log(`  Total supply: ${finalTotalSupply.toString()}`);
    console.log(`  Next token ID: ${finalCurrentTokenId.toString()}`);
    console.log(`  Contract balance: ${ethers.formatEther(contractBalance)} ETH`);
    console.log(`  Traditional NFTs: 1`);
    console.log(`  IPFS NFTs: ${ipfsNFTCount}`);
    
    console.log("\n🎉 IPFS-enabled NFT contract tests completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Error occurred during testing:");
    console.error(error);
    process.exitCode = 1;
  }
}

// Execute main function with error handling
const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  }
};

runMain();
