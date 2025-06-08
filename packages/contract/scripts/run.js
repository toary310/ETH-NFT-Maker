const hre = require("hardhat");
const { ethers } = hre;

/**
 * Web3Mint NFT コントラクトのローカル実行・テストスクリプト
 * 
 * 使用方法:
 * npx hardhat run scripts/run.js
 */
async function main() {
  try {
    console.log("🧪 Web3Mint NFT コントラクトのローカルテストを開始します...");
    
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
    
    console.log("\n🎨 NFTミントテストを開始...");
    
    // Owner用無料ミント
    console.log("\n1️⃣ Owner用無料ミント:");
    let txn = await nftContract.ownerMint(await owner.getAddress(), testMetadataURIs[0]);
    await txn.wait();
    console.log(`  ✅ Owner NFT #1 がミントされました`);
    console.log(`  📋 Transaction: ${txn.hash}`);
    
    // User1の有料ミント（正常ケース）
    console.log("\n2️⃣ User1の有料ミント:");
    const mintTx1 = await nftContract.connect(user1).makeAnEpicNFT(testMetadataURIs[1], {
      value: mintPrice
    });
    await mintTx1.wait();
    console.log(`  ✅ User1 NFT #2 がミントされました`);
    console.log(`  📋 Transaction: ${mintTx1.hash}`);
    
    // User2の有料ミント（正常ケース）
    console.log("\n3️⃣ User2の有料ミント:");
    const mintTx2 = await nftContract.connect(user2).makeAnEpicNFT(testMetadataURIs[2], {
      value: mintPrice
    });
    await mintTx2.wait();
    console.log(`  ✅ User2 NFT #3 がミントされました`);
    console.log(`  📋 Transaction: ${mintTx2.hash}`);
    
    // エラーテスト：料金不足
    console.log("\n4️⃣ エラーテスト - 料金不足:");
    try {
      await nftContract.connect(user1).makeAnEpicNFT("https://example.com/fail.json", {
        value: ethers.parseEther("0.0005") // 不足金額
      });
      console.log("  ❌ エラーが発生するはずでした");
    } catch (error) {
      console.log(`  ✅ 期待通りエラー: ${error.message.includes("InsufficientPayment") ? "InsufficientPayment" : "Payment error"}`);
    }
    
    // エラーテスト：空のメタデータURI
    console.log("\n5️⃣ エラーテスト - 空のメタデータURI:");
    try {
      await nftContract.connect(user1).makeAnEpicNFT("", {
        value: mintPrice
      });
      console.log("  ❌ エラーが発生するはずでした");
    } catch (error) {
      console.log(`  ✅ 期待通りエラー: ${error.message.includes("InvalidTokenURI") ? "InvalidTokenURI" : "URI error"}`);
    }
    
    // NFT所有者情報を確認
    console.log("\n🔍 NFT所有者情報:");
    for (let i = 1; i <= 3; i++) {
      try {
        const tokenOwner = await nftContract.ownerOf(i);
        const tokenURI = await nftContract.tokenURI(i);
        console.log(`  Token #${i}:`);
        console.log(`    所有者: ${tokenOwner}`);
        console.log(`    URI: ${tokenURI}`);
      } catch (error) {
        console.log(`  Token #${i}: 存在しません`);
      }
    }
    
    // 管理者機能のテスト
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
    
    // 無効化後のミントテスト
    console.log("\n6️⃣ ミント無効化後のテスト:");
    try {
      await nftContract.connect(user1).makeAnEpicNFT("https://example.com/disabled.json", {
        value: newPrice
      });
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
    
    console.log("\n🎉 すべてのテストが正常に完了しました！");
    
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
