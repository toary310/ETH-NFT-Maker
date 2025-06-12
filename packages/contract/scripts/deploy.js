// 🛠️ Hardhat開発環境をインポート
const hre = require("hardhat");
// 📦 Ethers.jsライブラリをインポート（ブロックチェーンとの通信用）
const { ethers } = hre;

/**
 * 🚀 Web3Mint NFTコントラクト デプロイスクリプト
 *
 * 【このスクリプトの役割】
 * このスクリプトは「コントラクトの建設監督」のような役割を果たします。
 * スマートコントラクトをブロックチェーン上に安全にデプロイし、
 * 必要な情報を収集・表示して、フロントエンドとの連携準備を行います。
 *
 * 【デプロイとは？】
 * - スマートコントラクトをブロックチェーン上に配置すること
 * - 一度デプロイされると、永続的にブロックチェーン上に存在
 * - デプロイ後は誰でもコントラクトと相互作用可能
 * - デプロイにはガス料金（手数料）が必要
 *
 * 【使用方法】
 * ローカル開発: npx hardhat run scripts/deploy.js
 * Sepoliaテストネット: npx hardhat run scripts/deploy.js --network sepolia
 *
 * 【実行される処理】
 * 1. デプロイ環境の確認（アドレス、残高、ネットワーク）
 * 2. コントラクトのコンパイル
 * 3. ブロックチェーンへのデプロイ
 * 4. デプロイ結果の確認と表示
 * 5. フロントエンド用設定情報の出力
 * 6. テスト環境での動作確認
 *
 * 【初心者向け解説】
 * - ガス = ブロックチェーン上での処理手数料
 * - gwei = ガス価格の単位（1 ETH = 10^9 gwei）
 * - トランザクション = ブロックチェーン上での取引記録
 * - Etherscan = Ethereumブロックチェーンの情報を見るサイト
 */
async function main() {
  try {
    // 🏁 デプロイ開始の案内
    console.log("🚀 Web3Mint NFT コントラクトのデプロイを開始します...");

    // 👤 デプロイ者（コントラクトを配置する人）の情報を取得
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);

    // 📊 デプロイ環境の詳細情報を表示
    console.log("📋 デプロイ情報:");
    console.log(`  デプロイアドレス: ${deployerAddress}`);
    console.log(`  残高: ${ethers.formatEther(deployerBalance)} ETH`);
    console.log(`  ネットワーク: ${hre.network.name}`);

    // 🌐 ネットワーク情報を取得
    const network = await ethers.provider.getNetwork();
    console.log(`  チェーンID: ${network.chainId}`);

    // ⛽ ガス価格を取得（Sepoliaテストネットの場合）
    if (hre.network.name === "sepolia") {
      const gasPrice = await ethers.provider.getFeeData();
      console.log(`  推定ガス価格: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);
      // 【ガス価格とは？】
      // - ブロックチェーン上での処理手数料の単価
      // - 高いほど処理が早く完了する
      // - ネットワークの混雑状況によって変動
    }

    // 📦 コントラクトのコンパイル開始
    console.log("\n📦 コントラクトをコンパイル中...");

    // 🏭 コントラクトファクトリーを取得（コントラクトの「設計図」）
    const Web3Mint = await ethers.getContractFactory("Web3Mint");

    console.log("⏳ Web3Mintコントラクトをデプロイ中...");

    // 🚀 コントラクトをブロックチェーンにデプロイ
    const web3Mint = await Web3Mint.deploy();

    // ⏰ デプロイの完了を待機（ブロックチェーンでの確認を待つ）
    await web3Mint.waitForDeployment();

    // 📍 デプロイされたコントラクトのアドレスを取得
    const contractAddress = await web3Mint.getAddress();

    console.log("\n✅ デプロイ完了!");
    console.log("📋 コントラクト情報:");
    console.log(`  コントラクトアドレス: ${contractAddress}`);
    console.log(`  トランザクションハッシュ: ${web3Mint.deploymentTransaction().hash}`);

    // 📊 コントラクトの基本情報を取得・表示
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

    // 🔗 Sepoliaテストネットの場合、Etherscanリンクを表示
    if (hre.network.name === "sepolia") {
      console.log("\n🔗 Etherscan リンク:");
      console.log(`  コントラクト: https://sepolia.etherscan.io/address/${contractAddress}`);
      console.log(`  デプロイTx: https://sepolia.etherscan.io/tx/${web3Mint.deploymentTransaction().hash}`);

      // 📝 コントラクト検証用のコマンドを表示
      console.log("\n📝 コントラクト認証コマンド:");
      console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
      // 【コントラクト認証とは？】
      // - デプロイしたコントラクトのソースコードをEtherscanで公開
      // - ユーザーがコントラクトの内容を確認できる
      // - 透明性と信頼性の向上
    }

    // 🔧 フロントエンドアプリケーション用の環境変数を表示
    console.log("\n🔧 フロントエンド用環境変数:");
    console.log(`REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`REACT_APP_NETWORK_NAME=${hre.network.name}`);
    console.log(`REACT_APP_CHAIN_ID=${network.chainId}`);
    // 【これらの変数の用途】
    // - フロントエンドがコントラクトと通信するために必要
    // - .envファイルに追加して使用
    // - ネットワーク切り替え時の自動設定に使用

    // 🧪 ローカル開発環境でのテストミント実行
    if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
      console.log("\n🧪 テストミントを実行中...");

      // テスト用のメタデータURIを設定
      const testTokenURI = "https://example.com/metadata/1.json";
      // 所有者権限でテストNFTをミント
      const mintTx = await web3Mint.ownerMint(deployerAddress, testTokenURI);
      // トランザクションの完了を待機
      await mintTx.wait();

      // ミント後の総供給量を確認
      const totalSupply = await web3Mint.totalSupply();
      console.log(`✅ テストNFTがミントされました。総供給量: ${totalSupply}`);
      // 【なぜテストミント？】
      // - デプロイ直後にコントラクトが正常動作するか確認
      // - ローカル環境でのみ実行（本番では不要）
      // - 開発効率の向上
    }

    console.log("\n🎉 デプロイプロセスが正常に完了しました！");

  } catch (error) {
    // ❌ エラーハンドリング
    console.error("\n❌ デプロイ中にエラーが発生しました:");
    console.error(error);
    process.exitCode = 1;  // プロセス終了コードを1に設定（エラー状態）
  }
}

// 🚀 メイン関数をエラーハンドリング付きで実行
main().catch((error) => {
  console.error("💥 予期しないエラー:", error);
  process.exitCode = 1;
});
