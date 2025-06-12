// ?? Hardhat開発フレームワークの必要なツールをインポート
require("@nomicfoundation/hardhat-toolbox");
// ? 環境変数を読み込むためのdotenvライブラリをインポート
require("dotenv").config({ path: "./.env" });

/**
 * ?? ETH-NFT-Makerプロジェクト用Hardhat設定ファイル
 *
 * 【このファイルの役割】
 * このファイルは「開発環境の設計図」のような役割を果たします。
 * スマートコントラクトの開発、テスト、デプロイに必要な全ての設定を
 * 一箇所にまとめて管理し、開発者が効率的に作業できるようにします。
 *
 * 【Hardhatとは？】
 * - Ethereumスマートコントラクト開発用のフレームワーク
 * - コンパイル、テスト、デプロイを統合管理
 * - ローカル開発環境とテストネットの両方をサポート
 * - デバッグ機能やガス使用量レポート機能を提供
 *
 * 【サポートする機能】
 * ? ローカル開発（Hardhatネットワーク）
 * ? Sepoliaテストネットデプロイ（Alchemy経由）
 * ? 環境変数による安全な秘密鍵管理
 * ? コントラクト最適化設定
 * ? ガス使用量レポート
 * ? Etherscanでのコントラクト検証
 *
 * 【必要な環境変数】
 * - ALCHEMY_API_KEY: AlchemyのAPIキー（Sepoliaネットワーク用）
 * - PRIVATE_KEY: ウォレットの秘密鍵（0xプレフィックスなし）
 * - SEPOLIA_RPC_URL: Sepolia RPC URL（オプション、デフォルトはAlchemy）
 * - ETHERSCAN_API_KEY: Etherscan APIキー（コントラクト検証用）
 *
 * 【初心者向け解説】
 * - RPC = Remote Procedure Call（ブロックチェーンとの通信方法）
 * - Alchemy = Ethereumノードサービスプロバイダー
 * - Sepolia = Ethereumのテストネットワーク（無料でテスト可能）
 * - 秘密鍵 = ウォレットの「パスワード」（絶対に他人に教えてはいけない）
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // ? Solidityコンパイラの設定
  solidity: {
    version: "0.8.28",                    // 使用するSolidityのバージョン
    settings: {
      optimizer: {                        // コード最適化の設定
        enabled: true,                    // 最適化を有効にする
        runs: 200,                        // 最適化の実行回数（多いほど実行時ガス削減、少ないほどデプロイ時ガス削減）
      },
      viaIR: true,                        // 中間表現を使用してより良い最適化を実現
    },
  },

  // ? ネットワーク設定（ローカル開発とテストネット）
  networks: {
    // ? ローカル開発ネットワーク（Hardhat内蔵）
    hardhat: {
      chainId: 31337,                     // ローカルネットワークのチェーンID
      // 【特徴】
      // - 完全にローカルで動作（インターネット不要）
      // - 無料でテスト可能
      // - 高速な実行
      // - デバッグ機能が豊富
    },

    // ? Sepoliaテストネットワーク設定
    sepolia: {
      // ? RPC URL（ブロックチェーンとの通信エンドポイント）
      url: process.env.SEPOLIA_RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      // ? デプロイに使用するアカウント（秘密鍵から生成）
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,                  // SepoliaのチェーンID
      gasPrice: "auto",                   // ガス価格を自動設定
      gas: "auto",                        // ガス制限を自動設定
      // 【特徴】
      // - 実際のEthereumネットワークに近い環境
      // - 無料のテストETHを使用
      // - Etherscanで確認可能
      // - 本番環境への最終テストに最適
    },
  },

  // ? Etherscanでのコントラクト検証設定（オプション）
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    // 【コントラクト検証とは？】
    // - デプロイしたコントラクトのソースコードをEtherscanで公開
    // - ユーザーがコントラクトの内容を確認できる
    // - 透明性と信頼性の向上
    // - Etherscan上でコントラクトと直接やり取り可能
  },

  // ? ガス使用量レポート設定
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,  // REPORT_GAS環境変数が設定されている場合のみ有効
    currency: "USD",                                // 通貨単位
    // 【ガスレポートとは？】
    // - 各関数のガス使用量を詳細に分析
    // - コスト最適化のための重要な情報
    // - 関数ごとの実行コストを把握
    // - パフォーマンス改善の指標
  },

  // ? ファイルパス設定
  paths: {
    sources: "./contracts",               // Solidityソースファイルの場所
    tests: "./test",                      // テストファイルの場所
    cache: "./cache",                     // コンパイルキャッシュの場所
    artifacts: "./artifacts",             // コンパイル成果物の場所
  },

  // ? Mochaテストフレームワーク設定
  mocha: {
    timeout: 40000,                       // テストのタイムアウト時間（40秒）
    // 【なぜ長めのタイムアウト？】
    // - ブロックチェーンとの通信は時間がかかる
    // - ネットワークの遅延を考慮
    // - 複雑なテストケースに対応
  },
};
