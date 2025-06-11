# 🎨 ETH-NFT-Maker

**あなたの画像を簡単にNFTに変換できるWeb3アプリケーション**

![NFT Maker Demo](https://i.imgur.com/8hPawj3.png)

## 📖 アプリケーション概要

ETH-NFT-MakerはEthereumブロックチェーン上で独自のNFT（Non-Fungible Token）を作成・発行できるWebアプリケーションです。画像ファイルをアップロードするだけで、誰でも簡単にオリジナルNFTを作成できます。

### 🎯 主な機能

- **🖼️ 画像からNFT作成**: JPG、PNG、GIF、SVGファイルをNFTに変換
- **🌐 実際のIPFS統合**: w3up (Web3.Storage v2) による分散ストレージ
- **💰 ETH決済**: Sepoliaテストネットで安全にテスト可能
- **📱 MetaMask連携**: ウォレット接続で簡単認証
- **🔍 リアルタイム確認**: 作成したNFTをEtherscanで即座に確認
- **🎨 動的メタデータ**: オンチェーンでメタデータを自動生成

### 🏗️ 技術スタック

#### フロントエンド

- **React 19** - 最新のConcurrent Features対応
- **ethers.js v6** - Ethereum との通信
- **Material-UI** - モダンなUIコンポーネント
- **Web3.Storage (w3up)** - 分散ストレージサービス

#### スマートコントラクト

- **Solidity 0.8.28** - 最新のセキュリティ機能
- **OpenZeppelin** - 監査済みライブラリ
- **Hardhat** - 開発・テスト・デプロイ環境
- **ERC721URIStorage** - NFT標準規格

#### インフラ

- **Sepolia Testnet** - Ethereumテストネットワーク
- **IPFS** - 分散ファイルストレージ
- **Alchemy** - Ethereum API プロバイダー

---

## 🚀 クイックスタート

### 前提条件

以下のツールがインストールされている必要があります：

- **Node.js 18+** ([ダウンロード](https://nodejs.org/))
- **yarn** または **npm**
- **Git** ([ダウンロード](https://git-scm.com/))
- **MetaMask** ブラウザ拡張機能 ([インストール](https://metamask.io/))

### インストール手順

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ETH-NFT-Maker.git
   cd ETH-NFT-Maker
   ```
2. **依存関係をインストール**

   ```bash
   yarn install
   # または
   npm install
   ```
3. **環境変数を設定**

   **クライアント用 (.env)**

   ```bash
   # packages/client/.env
   REACT_APP_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
   REACT_APP_NETWORK_NAME=sepolia
   REACT_APP_CHAIN_ID=YOUR_CHAIN_ID

   # IPFS設定（オプション：実際のIPFSを使用する場合）
   REACT_APP_W3UP_EMAIL=your-email@example.com
   ```

   **コントラクト用 (.env)**

   ```bash
   # packages/contract/.env
   ALCHEMY_API_KEY=your_alchemy_api_key
   PRIVATE_KEY=your_wallet_private_key
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
   ```
4. **アプリケーションを起動**

   ```bash
   yarn client start
   # または
   npm run client:start
   ```
5. **ブラウザでアクセス**

   http://localhost:3000 を開いてアプリケーションを使用開始

---

## 🎮 アプリケーションの使い方

### 1. ウォレット接続

1. **MetaMaskをインストール**

   - [MetaMask公式サイト](https://metamask.io/)からブラウザ拡張機能をインストール
2. **Sepoliaテストネットに接続**

   - MetaMaskでSepoliaテストネットを追加
   - テストETHを取得（[Sepolia Faucet](https://sepoliafaucet.com/)）
3. **ウォレットを接続**

   - アプリで「Connect to Wallet」をクリック
   - MetaMaskで承認

### 2. NFT作成手順

1. **画像ファイルを選択**

   - 対応形式：JPG, PNG, GIF, SVG
   - 最大サイズ：10MB
   - ドラッグ&ドロップまたはファイル選択
2. **NFTを作成**

   - 「NFTを作成」ボタンをクリック
   - ミント料金（0.001 ETH）を支払い
   - MetaMaskで取引を承認
3. **処理完了を待機**

   - IPFSアップロード：1-2分
   - ブロックチェーン確認：1-3分
   - 完了通知を確認
4. **NFTを確認**

   - EtherscanリンクでOn-chain確認
   - Gemcaseで視覚的に確認

### 3. NFT詳細確認

作成完了後、以下の方法でNFTを確認できます：

**Etherscan（推奨）**

- 取引履歴とコントラクト詳細
- https://sepolia.etherscan.io/

**Gemcase（視覚的確認）**

- NFTの視覚的表示
- https://gemcase.vercel.app/

**OpenSea Testnet**

- NFTマーケットプレイス表示
- https://testnets.opensea.io/

---

## ⚠️ 重要な注意点

### セキュリティ

- **🔐 秘密鍵の管理**

  - 秘密鍵は絶対に他人と共有しない
  - .envファイルをGitにコミットしない
  - 本番環境では環境変数を使用
- **🧪 テストネット使用**

  - 必ずSepoliaテストネットを使用
  - 実際のETHを送金しない
  - テスト用途のみに使用

### 技術的制限

- **📊 ファイルサイズ制限**

  - 画像ファイル：最大10MB
  - IPFSアップロード時間は容量に依存
- **⏱️ 処理時間**

  - IPFS保存：1-5分
  - ブロックチェーン確認：1-3分
  - ネットワーク状況により変動
- **💰 コスト**

  - Sepoliaテストネット：無料（テストETH使用）
  - ガス料金：ネットワーク混雑度により変動

### IPFSサービス

- **🌍 実際のIPFS（推奨）**

  - w3up設定が必要
  - 永続的なデータ保存
  - 画像が正常に表示
- **🧪 モックIPFS（開発用）**

  - 設定不要で即座にテスト可能
  - 画像は表示されない（メタデータのみ）
  - テスト・開発目的のみ

---

## 🛠️ 開発者向け情報

### プロジェクト構造

```
ETH-NFT-Maker/
├── packages/
│   ├── client/          # React フロントエンド
│   │   ├── src/
│   │   │   ├── components/  # UIコンポーネント
│   │   │   ├── hooks/       # カスタムフック
│   │   │   └── utils/       # ユーティリティ関数
│   │   └── public/
│   └── contract/        # Solidity スマートコントラクト
│       ├── contracts/       # コントラクトファイル
│       ├── scripts/         # デプロイスクリプト
│       └── test/           # テストファイル
├── debug-nft-metadata.js   # デバッグ用スクリプト
└── test-w3up-direct.js     # IPFS接続テスト
```

### 開発用コマンド

```bash
# フロントエンド開発
yarn client start          # 開発サーバー起動
yarn client build          # 本番ビルド
yarn client test           # テスト実行

# スマートコントラクト開発
yarn contract compile      # コントラクトコンパイル
yarn contract test         # コントラクトテスト
yarn contract deploy       # ローカルデプロイ
yarn contract deploy --network sepolia  # Sepoliaデプロイ

# 統合テスト
yarn test                  # 全テスト実行
yarn lint                  # コード品質チェック
```

### デバッグ・トラブルシューティング

**メタデータ確認スクリプト**

```bash
# ブラウザコンソールで実行
node debug-nft-metadata.js
```

**IPFS接続テスト**

```bash
# w3up接続確認
node test-w3up-direct.js
```

**よくある問題と解決法**

1. **ウォレット接続失敗**

   - MetaMaskが最新版か確認
   - Sepoliaネットワークに切り替え
   - ブラウザを再起動
2. **IPFSアップロード失敗**

   - ネットワーク接続を確認
   - ファイルサイズが10MB以下か確認
   - w3up設定を再確認
3. **取引失敗**

   - テストETHが十分にあるか確認
   - ガス料金を適切に設定
   - ネットワーク混雑時は時間をおいて再試行

---

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. **Issue報告**

   - バグ報告
   - 機能リクエスト
   - ドキュメント改善提案
2. **Pull Request**

   - バグ修正
   - 新機能追加
   - コード改善
3. **開発ガイドライン**

   - ESLint・Prettierに準拠
   - テストカバレッジを維持
   - TypeScript型安全性を重視

### 開発環境セットアップ

```bash
# フォーク・クローン
git clone https://github.com/YOUR_USERNAME/ETH-NFT-Maker.git
cd ETH-NFT-Maker

# 開発用ブランチ作成
git checkout -b feature/your-feature-name

# 依存関係インストール
yarn install

# 開発サーバー起動
yarn dev
```

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

## 🔗 関連リンク

### 技術リファレンス

- [Ethereum公式ドキュメント](https://ethereum.org/developers/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)
- [Hardhat Documentation](https://hardhat.org/docs/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [React 19 Documentation](https://react.dev/)

### 開発ツール

- [MetaMask](https://metamask.io/) - Ethereumウォレット
- [Alchemy](https://www.alchemy.com/) - Ethereum API
- [IPFS](https://ipfs.tech/) - 分散ストレージ
- [Sepolia Faucet](https://sepoliafaucet.com/) - テストETH取得

### NFT確認ツール

- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Gemcase](https://gemcase.vercel.app/)
- [OpenSea Testnet](https://testnets.opensea.io/)

---

## 📞 サポート

### トラブルシューティング

問題が発生した場合は、以下の順序で確認してください：

1. **[FAQ](#faq)** を確認
2. **[既存のIssue](https://github.com/YOUR_USERNAME/ETH-NFT-Maker/issues)** を検索
3. **新しいIssue** を作成（詳細な情報を含める）

### コミュニティ

- **GitHub Discussions**: 質問・議論
- **Discord**: リアルタイム相談（あれば）
- **Twitter**: 最新情報（あれば）

---

*このプロジェクトは教育目的で作成されました。実際の資産取引には十分注意してください。*
