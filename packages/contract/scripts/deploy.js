const hre = require("hardhat");
const { ethers } = hre;

/**
 * Web3Mint NFT コントラクトをデプロイするスクリプト
 * 
 * 使用方法:
 * ローカル: npx hardhat run scripts/deploy.js
 * Sepolia: npx hardhat run scripts/deploy.js --network sepolia
 */
async function main() {
  try {
    console.log("🚀 Web3Mint NFT コントラクトのデプロイを開始します...");
    
    // デプロイ者の情報を取得
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    
    console.log("📋 デプロイ情報:");
    console.log(`  デプロイアドレス: ${deployerAddress}`);
    console.log(`  残高: ${ethers.formatEther(deployerBalance)} ETH`);
    console.log(`  ネットワーク: ${hre.network.name}`);
    
    // ネットワーク情報を取得
    const network = await ethers.provider.getNetwork();
    console.log(`  チェーンID: ${network.chainId}`);
    
    // ガス価格を取得（Sepoliaの場合）
    if (hre.network.name === "sepolia") {
      const gasPrice = await ethers.provider.getFeeData();
      console.log(`  推定ガス価格: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
    }
    
    console.log("\n📦 コントラクトをコンパイル中...");
    
    // コントラクトファクトリーを取得
    const Web3Mint = await ethers.getContractFactory("Web3Mint");
    
    console.log("⏳ Web3Mintコントラクトをデプロイ中...");
    
    // コントラクトをデプロイ
    const web3Mint = await Web3Mint.deploy();
    
    // デプロイの完了を待機
    await web3Mint.waitForDeployment();
    
    const contractAddress = await web3Mint.getAddress();
    
    console.log("\n✅ デプロイ完了!");
    console.log("📋 コントラクト情報:");
    console.log(`  コントラクトアドレス: ${contractAddress}`);
    console.log(`  トランザクションハッシュ: ${web3Mint.deploymentTransaction().hash}`);
    
    // コントラクトの基本情報を表示
    const name = await web3Mint.name();
    const symbol = await web3Mint.symbol();
    const owner = await web3Mint.owner();
    const mintPrice = await web3Mint.mintPrice();
    const maxSupply = await web3Mint.MAX_SUPPLY();
    
    console.log("\n🔍 コントラクト詳細:");
    console.log(`  名前: ${name}`);
    console.log(`  シンボル: ${symbol}`);
    console.log(`  所有者: ${owner}`);
    console.log(`  ミント料金: ${ethers.formatEther(mintPrice)} ETH`);
    console.log(`  最大供給量: ${maxSupply}`);
    
    // Sepoliaの場合、Etherscanリンクを表示
    if (hre.network.name === "sepolia") {
      console.log("\n🔗 Etherscan リンク:");
      console.log(`  https://sepolia.etherscan.io/address/${contractAddress}`);
      console.log(`  https://sepolia.etherscan.io/tx/${web3Mint.deploymentTransaction().hash}`);
      
      console.log("\n📝 コントラクト認証コマンド:");
      console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
    }
    
    // 環境変数としてエクスポートする情報を表示
    console.log("\n🔧 フロントエンド用環境変数:");
    console.log(`REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`REACT_APP_NETWORK_NAME=${hre.network.name}`);
    console.log(`REACT_APP_CHAIN_ID=${network.chainId}`);
    
    // ローカルテスト用のミント実行（ローカルネットワークの場合のみ）
    if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
      console.log("\n🧪 テストミントを実行中...");
      
      const testTokenURI = "https://example.com/metadata/1.json";
      const mintTx = await web3Mint.ownerMint(deployerAddress, testTokenURI);
      await mintTx.wait();
      
      const totalSupply = await web3Mint.totalSupply();
      console.log(`テストNFTがミントされました。総供給量: ${totalSupply}`);
    }
    
    console.log("\n🎉 デプロイプロセスが正常に完了しました！");
    
  } catch (error) {
    console.error("\n❌ デプロイ中にエラーが発生しました:");
    console.error(error);
    process.exitCode = 1;
  }
}

// エラーハンドリング付きでmain関数を実行
main().catch((error) => {
  console.error("💥 予期しないエラー:", error);
  process.exitCode = 1;
});
