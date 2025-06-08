# ETH-NFT-Maker Contract

このディレクトリには、NFTを作成・ミントするためのスマートコントラクト（Web3Mint）が含まれています。

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
# コントラクトディレクトリに移動
cd packages/contract

# 依存関係をインストール
yarn install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、必要な値を設定してください：

```bash
cp .env.example .env
```

`.env`ファイルに以下の値を設定：

```env
# Alchemy API Key for Sepolia network
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Private key of your wallet (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (optional - defaults to Alchemy)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key_here

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**⚠️ 重要：** `.env`ファイルは絶対にGitにコミットしないでください。秘密鍵が含まれています。

### 3. 必要なツール

- **Alchemy API Key**: [Alchemy](https://www.alchemy.com/)でアカウントを作成し、Sepoliaネットワーク用のAPIキーを取得
- **Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)からテストETHを取得
- **MetaMask**: Sepoliaネットワークの設定

## 📋 コントラクト情報

### Web3Mint.sol

モダンなERC721 NFTコントラクトです。

**主な機能:**
- ✅ NFTの安全なミント
- ✅ トークンURIの設定
- ✅ 所有者限定機能
- ✅ リエントランシー攻撃の防止
- ✅ ミント料金の設定
- ✅ 最大供給量の制限
- ✅ ミント機能の有効/無効切り替え

**技術仕様:**
- **Solidity**: `^0.8.28` （最新版）
- **OpenZeppelin**: `v5.3.0`
- **継承**: ERC721URIStorage, Ownable, ReentrancyGuard
- **最適化**: ガス効率、IR有効化

## 🛠 使用方法

### ローカルテスト

```bash
# コントラクトのコンパイル
yarn compile

# ローカルでのテスト実行
yarn run:script

# 単体テストの実行
yarn test
```

### Sepoliaテストネットへのデプロイ

1. 環境変数が正しく設定されていることを確認
2. SepoliaネットワークにテストETHがあることを確認
3. デプロイ実行：

```bash
yarn deploy
```

### ローカルネットワークでのデプロイ

```bash
# 別ターミナルでローカルノードを起動
yarn node

# ローカルネットワークにデプロイ
yarn deploy:local
```

## 📝 スクリプト一覧

| コマンド | 説明 |
|----------|------|
| `yarn compile` | コントラクトのコンパイル |
| `yarn run:script` | ローカル環境でのテスト実行 |
| `yarn deploy` | Sepoliaネットワークへのデプロイ |
| `yarn deploy:local` | ローカルネットワークへのデプロイ |
| `yarn test` | 単体テストの実行 |
| `yarn verify <address>` | Etherscanでのコントラクト認証 |
| `yarn node` | ローカルHardhatノードの起動 |

## 🔍 デプロイ後の作業

### 1. コントラクト認証（Sepolia）

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### 2. フロントエンド用環境変数

デプロイ後、以下の環境変数をフロントエンド用に設定：

```env
REACT_APP_CONTRACT_ADDRESS=<デプロイされたコントラクトアドレス>
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
```

## 🎮 コントラクトの使用方法

### 基本的なNFTミント

```javascript
// MetaMaskなどのウォレットから
const mintPrice = await contract.mintPrice();
const tx = await contract.makeAnEpicNFT("https://your-metadata-uri.json", {
  value: mintPrice
});
await tx.wait();
```

### 管理者機能（コントラクト所有者のみ）

```javascript
// ミント価格の変更
await contract.updateMintPrice(ethers.parseEther("0.002"));

// ミント機能の有効/無効切り替え
await contract.toggleMinting(false); // 無効化
await contract.toggleMinting(true);  // 有効化

// 所有者用無料ミント
await contract.ownerMint(address, "https://metadata-uri.json");

// コントラクト残高の引き出し
await contract.withdraw();
```

## ⚡ Solidity 0.8.28の新機能

このプロジェクトでは最新のSolidity 0.8.28を使用しており、以下の利点があります：

- **パフォーマンス向上**: コンパイラの最適化改善
- **ガス効率**: より効率的なバイトコード生成
- **セキュリティ強化**: 最新のセキュリティパッチ
- **開発体験**: より良いエラーメッセージとデバッグ機能

## 🔗 便利なリンク

- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [MetaMask](https://metamask.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity 0.8.28 Documentation](https://docs.soliditylang.org/)

## 🚨 セキュリティ注意事項

1. **秘密鍵の管理**: `.env`ファイルは絶対に公開しないでください
2. **テストネット使用**: 本番前は必ずSepoliaでテストしてください
3. **コントラクト認証**: デプロイ後はEtherscanで認証を行ってください
4. **権限管理**: 所有者権限は適切に管理してください
5. **最新版維持**: Solidityとライブラリを最新に保ってください

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. 環境変数が正しく設定されているか
2. SepoliaネットワークにテストETHがあるか
3. Alchemy APIキーが有効か
4. 依存関係が正しくインストールされているか
5. Solidity 0.8.28のコンパイラが使用されているか

---

**Happy Building with Solidity 0.8.28! 🚀**
