# NFT Uploader Component

## 概要

このコンポーネントは、ユーザーが画像ファイルをアップロードしてNFTを作成できる機能を提供します。

## 主な機能

- ✅ MetaMaskウォレット接続
- ✅ 画像ファイルのアップロード（ドラッグ&ドロップ対応）
- ✅ IPFSへのファイル保存
- ✅ スマートコントラクトとの連携
- ✅ エラーハンドリング
- ✅ ローディング状態の表示

## 技術スタック

- **React 18**: UI フレームワーク
- **ethers.js v6**: Ethereum ブロックチェーン連携
- **Material-UI**: UIコンポーネント
- **IPFS**: 分散ファイルストレージ

## セットアップ

### 1. 依存関係のインストール

```bash
cd packages/client
yarn install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```env
# IPFSサービス選択（どちらか一つを設定）
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_key

# または
REACT_APP_WEB3_STORAGE_TOKEN=your_web3_storage_token

# コントラクト設定
REACT_APP_CONTRACT_ADDRESS=0x590D13672DDB149A4602989A7B3B7D35a082B433
REACT_APP_NETWORK_NAME=sepolia

# 開発用（モックIPFS使用）
REACT_APP_USE_MOCK_IPFS=true
```

### 3. IPFSサービスの設定

#### Option A: Pinata（推奨）

1. [Pinata](https://pinata.cloud) でアカウント作成
2. API Keys セクションでAPIキーを生成
3. `.env`ファイルにキーを設定

#### Option B: web3.storage

1. [web3.storage console](https://console.web3.storage) でアカウント作成
2. w3up-clientを使用してトークンを設定
3. `.env`ファイルにトークンを設定

#### Option C: 開発用モック

IPFSサービスを設定せずにテストしたい場合：

```env
REACT_APP_USE_MOCK_IPFS=true
```

## ファイル構造

```
src/components/NftUploader/
├── NftUploader.jsx         # メインコンポーネント
├── NftUploader.css         # スタイル
└── image.svg              # アイコン

src/utils/
├── ipfs.js                # IPFS アップロード機能
├── mockIPFS.js            # 開発用モック
└── Web3Mint.json          # コントラクト ABI
```

## 使用方法

### 基本的な使用

```jsx
import NftUploader from './components/NftUploader/NftUploader';

function App() {
  return (
    <div className="App">
      <NftUploader />
    </div>
  );
}
```

## API リファレンス

### Props

NftUploaderコンポーネントはpropsを受け取りません。全ての設定は環境変数で行います。

### Environment Variables

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `REACT_APP_CONTRACT_ADDRESS` | NFTコントラクトのアドレス | ✅ |
| `REACT_APP_NETWORK_NAME` | ネットワーク名（etherscanリンク用） | ❌ |
| `REACT_APP_PINATA_API_KEY` | Pinata APIキー | ❌* |
| `REACT_APP_PINATA_SECRET_API_KEY` | Pinata シークレットキー | ❌* |
| `REACT_APP_WEB3_STORAGE_TOKEN` | web3.storage トークン | ❌* |
| `REACT_APP_USE_MOCK_IPFS` | 開発用モック使用フラグ | ❌ |

*IPFSサービスのいずれか一つは必須（モック使用時を除く）

## エラーハンドリング

コンポーネントは以下のエラーを適切に処理します：

- ✅ MetaMask未インストール
- ✅ ウォレット接続失敗
- ✅ ファイルサイズ制限超過（10MB）
- ✅ 不正なファイル形式
- ✅ IPFS アップロード失敗
- ✅ コントラクト呼び出し失敗

## カスタマイズ

### ファイルサイズ制限の変更

```jsx
// NftUploader.jsx の handleFileSelect 関数内
if (file.size > 50 * 1024 * 1024) { // 50MBに変更
  setError("ファイルサイズが50MBを超えています");
  return;
}
```

### サポートファイル形式の変更

```jsx
// accept属性を変更
accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
```

### UI カスタマイズ

`NftUploader.css`ファイルでスタイルをカスタマイズできます。

## トラブルシューティング

### よくある問題

1. **MetaMask接続エラー**
   - MetaMaskがインストールされているか確認
   - 正しいネットワーク（Sepolia）に接続されているか確認

2. **IPFS アップロードエラー**
   - APIキーが正しく設定されているか確認
   - ネットワーク接続を確認

3. **コントラクト呼び出しエラー**
   - コントラクトアドレスが正しいか確認
   - 十分なETHがあるか確認

### デバッグ方法

ブラウザのコンソールでログを確認：

```javascript
// 開発者ツール > Console
console.log("Current account:", currentAccount);
console.log("Selected file:", selectedFile);
```

## 今後の改善予定

- [ ] ドラッグ&ドロップUI の改善
- [ ] 複数ファイル同時アップロード
- [ ] NFT プレビュー機能
- [ ] アップロード進捗表示
- [ ] メタデータ編集機能
- [ ] 作成したNFT一覧表示

## 貢献

プルリクエストやイシューの報告を歓迎します。

## ライセンス

MIT License