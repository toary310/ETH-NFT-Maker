const hre = require("hardhat");
const { ethers } = hre;

/**
 * Web3Mint NFT コントラクトのローカル実行・テストスクリプト（IPFS対応版）
 * 
 * 使用方法:
 * npx hardhat run scripts/run.js
 */
async function main() {
  try {
    console.log("🧪 Web3Mint NFT コントラクト（IPFS対応）のローカルテストを開始します...");
    
    // テストアカウントを取得
    const [owner, user1, user2] = await ethers.getSigners();
    
    console.log("📋 テストアカウント:");
    console.log(`  Owner: ${await owner.getAddress()}`);
    console.log(`  User1: ${await user1.getAddress()}`);
    console.log(`  User2: ${await user2.getAddress()}`);
    
    // コントラクトをデプロイ
    console.log("\n📦 Web3Mintコントラクトをデプロイ中...");
    const Web3Mint = await ethers.getContractFactory("Web3Mint");
    const nftContract = await Web3Mint.deploy();
    await nftContract.waitForDeployment();
    
    const contractAddress = await nftContract.getAddress();
    console.log(`✅ コントラクトアドレス: ${contractAddress}`);
    
    // コントラクトの初期状態を確認
    console.log("\n🔍 コントラクト情報:");
    const name = await nftContract.name();
    const symbol = await nftContract.symbol();
    const owner_address = await nftContract.owner();
    const mintPrice = await nftContract.mintPrice();
    const maxSupply = await nftContract.MAX_SUPPLY();
    const currentTokenId = await nftContract.getCurrentTokenId();
    const totalSupply = await nftContract.totalSupply();
    
    console.log(`  名前: ${name}`);
    console.log(`  シンボル: ${symbol}`);
    console.log(`  所有者: ${owner_address}`);
    console.log(`  ミント料金: ${ethers.formatEther(mintPrice)} ETH`);
    console.log(`  最大供給量: ${maxSupply}`);
    console.log(`  次のトークンID: ${currentTokenId}`);
    console.log(`  現在の総供給量: ${totalSupply}`);
    
    // テスト用のメタデータURI
    const testMetadataURIs = [
      "https://example.com/metadata/1.json",
      "https://example.com/metadata/2.json",
      "https://example.com/metadata/3.json"
    ];

    // テスト用のIPFSハッシュ
    const testIPFSHashes = [
      "QmYFNwqT8eZ6FybqwYS8e1X2Zl5TQaB3hMxRbC7PvKdUfG",
      "QmTWZGnCyQ9Xx4YvFpKhJe8MzLqNfPsRnK5WGbHdT6VcAe",
      "QmDxMnKyH5fYQ3vFgCsLwT9WjPr6XeGcV4RoE2KyUpNzB8"
    ];
    
    console.log("\n🎨 NFTミントテストを開始...");
    
    // 1. 従来の方法でのNFTミント
    console.log("\n1️⃣ 従来方式でのNFTミント:");
    let txn = await nftContract.ownerMint(await owner.getAddress(), testMetadataURIs[0]);
    await txn.wait();
    console.log(`  ✅ 従来方式NFT #1 がミントされました`);
    console.log(`  📋 Transaction: ${txn.hash}`);
    
    // 2. IPFSを使った有料ミント（User1）
    console.log("\n2️⃣ IPFS方式でのNFTミント（User1）:");
    const ipfsMintTx1 = await nftContract.connect(user1).mintIpfsNFT(
      "Awesome IPFS NFT #1",
      "This is a cool NFT stored on IPFS with dynamic metadata",
      testIPFSHashes[0],
      { value: mintPrice }
    );
    await ipfsMintTx1.wait();
    console.log(`  ✅ IPFS NFT #2 がミントされました`);
    console.log(`  📋 Transaction: ${ipfsMintTx1.hash}`);
    console.log(`  🌐 IPFS Hash: ${testIPFSHashes[0]}`);
    
    // 3. IPFSを使った有料ミント（User2）
    console.log("\n3️⃣ IPFS方式でのNFTミント（User2）:");
    const ipfsMintTx2 = await nftContract.connect(user2).mintIpfsNFT(
      "Epic IPFS Collection #2",
      "Another amazing NFT with on-chain metadata generation",
      testIPFSHashes[1],
      { value: mintPrice }
    );
    await ipfsMintTx2.wait();
    console.log(`  ✅ IPFS NFT #3 がミントされました`);
    console.log(`  📋 Transaction: ${ipfsMintTx2.hash}`);
    console.log(`  🌐 IPFS Hash: ${testIPFSHashes[1]}`);
    
    // 4. Owner用IPFS無料ミント
    console.log("\n4️⃣ Owner用IPFS無料ミント:");
    const ownerIpfsTx = await nftContract.ownerMintIpfs(
      await owner.getAddress(),
      "Special Owner NFT",
      "Exclusive NFT for the contract owner",
      testIPFSHashes[2]
    );
    await ownerIpfsTx.wait();
    console.log(`  ✅ Owner IPFS NFT #4 がミントされました`);
    console.log(`  📋 Transaction: ${ownerIpfsTx.hash}`);
    
    // 5. エラーテスト：空の名前でIPFSミント
    console.log("\n5️⃣ エラーテスト - 空の名前でIPFSミント:");
    try {
      await nftContract.connect(user1).mintIpfsNFT(
        "",
        "Description without name",
        testIPFSHashes[0],
        { value: mintPrice }
      );
      console.log("  ❌ エラーが発生するはずでした");
    } catch (error) {
      console.log(`  ✅ 期待通りエラー: ${error.message.includes("EmptyName") ? "EmptyName" : "Name error"}`);
    }
    
    // 6. エラーテスト：無効なIPFSハッシュ
    console.log("\n6️⃣ エラーテスト - 無効なIPFSハッシュ:");
    try {
      await nftContract.connect(user1).mintIpfsNFT(
        "Valid Name",
        "Valid Description",
        "",
        { value: mintPrice }
      );
      console.log("  ❌ エラーが発生するはずでした");
    } catch (error) {
      console.log(`  ✅ 期待通りエラー: ${error.message.includes("InvalidIPFSHash") ? "InvalidIPFSHash" : "IPFS error"}`);
    }
    
    // 7. NFT情報とメタデータの確認
    console.log("\n🔍 NFT情報とメタデータの確認:");
    for (let i = 1; i <= 4; i++) {
      try {
        const tokenOwner = await nftContract.ownerOf(i);
        const tokenURI = await nftContract.tokenURI(i);
        console.log(`\n  Token #${i}:`);
        console.log(`    所有者: ${tokenOwner}`);
        
        // IPFS NFTの場合、NFT情報も表示
        if (i >= 2) {
          const nftInfo = await nftContract.getNFTInfo(i);
          console.log(`    名前: ${nftInfo.name}`);
          console.log(`    説明: ${nftInfo.description}`);
          console.log(`    画像URI: ${nftInfo.imageURI}`);
          console.log(`    ミンター: ${nftInfo.minter}`);
          console.log(`    タイムスタンプ: ${nftInfo.timestamp}`);
        }
        
        // メタデータURIの先頭部分を表示
        const uriPreview = tokenURI.length > 100 ? 
          tokenURI.substring(0, 100) + "..." : tokenURI;
        console.log(`    メタデータURI: ${uriPreview}`);
        
        // data:application/json;base64の場合、Base64デコードを試行
        if (tokenURI.startsWith("data:application/json;base64,")) {
          try {
            const base64Data = tokenURI.split(",")[1];
            const jsonData = Buffer.from(base64Data, 'base64').toString('utf8');
            const metadata = JSON.parse(jsonData);
            console.log(`    デコードされたメタデータ:`);
            console.log(`      名前: ${metadata.name}`);
            console.log(`      説明: ${metadata.description}`);
            console.log(`      画像: ${metadata.image}`);
          } catch (e) {
            console.log(`    メタデータのデコードに失敗: ${e.message}`);
          }
        }
      } catch (error) {
        console.log(`  Token #${i}: 存在しません`);
      }
    }
    
    // 8. 管理者機能のテスト
    console.log("\n⚙️  管理者機能テスト:");
    
    // ミント価格の変更
    const newPrice = ethers.parseEther("0.002");
    const updatePriceTx = await nftContract.updateMintPrice(newPrice);
    await updatePriceTx.wait();
    const updatedPrice = await nftContract.mintPrice();
    console.log(`  ✅ ミント価格を更新: ${ethers.formatEther(updatedPrice)} ETH`);
    
    // ミント機能の無効化
    const toggleTx = await nftContract.toggleMinting(false);
    await toggleTx.wait();
    const mintingEnabled = await nftContract.mintingEnabled();
    console.log(`  ✅ ミント機能を無効化: ${mintingEnabled}`);
    
    // 無効化後のIPFSミントテスト
    console.log("\n7️⃣ ミント無効化後のIPFSミントテスト:");
    try {
      await nftContract.connect(user1).mintIpfsNFT(
        "Should Fail NFT",
        "This should fail because minting is disabled",
        testIPFSHashes[0],
        { value: newPrice }
      );
      console.log("  ❌ エラーが発生するはずでした");
    } catch (error) {
      console.log(`  ✅ 期待通りエラー: ${error.message.includes("MintingDisabled") ? "MintingDisabled" : "Minting error"}`);
    }
    
    // ミント機能を再有効化
    const reEnableTx = await nftContract.toggleMinting(true);
    await reEnableTx.wait();
    console.log("  ✅ ミント機能を再有効化");
    
    // コントラクトの残高確認
    const contractBalance = await nftContract.getContractBalance();
    console.log(`\n💰 コントラクト残高: ${ethers.formatEther(contractBalance)} ETH`);
    
    // 最終状態を確認
    const finalTotalSupply = await nftContract.totalSupply();
    const finalCurrentTokenId = await nftContract.getCurrentTokenId();
    
    console.log("\n📊 最終状態:");
    console.log(`  総供給量: ${finalTotalSupply}`);
    console.log(`  次のトークンID: ${finalCurrentTokenId}`);
    console.log(`  コントラクト残高: ${ethers.formatEther(contractBalance)} ETH`);
    console.log(`  従来型NFT: 1個`);
    console.log(`  IPFS NFT: ${finalTotalSupply - 1}個`);
    
    console.log("\n🎉 IPFS対応NFTコントラクトのテストが正常に完了しました！");
    
  } catch (error) {
    console.error("\n❌ テスト中にエラーが発生しました:");
    console.error(error);
    process.exitCode = 1;
  }
}

// エラーハンドリング付きでmain関数を実行
const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error("💥 予期しないエラー:", error);
    process.exit(1);
  }
};

runMain();
