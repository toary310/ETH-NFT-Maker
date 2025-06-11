# Web3.Storage w3up セットアップガイド

## 🚨 重要な変更について

Web3.Storage は2024年に大幅にアップデートされ、新しい**w3up**システムに移行されました。

### ❌ 旧システム（廃止済み）
- `web3.storage` パッケージ（v4.5.5）→ **DEPRECATED**
- APIトークン方式 → **廃止**

### ✅ 新システム（現在）
- `@web3-storage/w3up-client` パッケージ
- Email認証 + Space作成方式
- UCANトークンによる認証

## 🛠️ セットアップ手順

### 1. Web3.Storageアカウント作成

1. **console.web3.storage** にアクセス
   ```
   https://console.web3.storage/
   ```

2. **アカウント作成**
   - メールアドレスでサインアップ
   - メール認証を完了

3. **プラン選択**
   - **Starter**: 5GB無料
   - **Lite**: $10/月（100GB）
   - **Business**: $100/月（2TB）

### 2. 環境変数設定

プロジェクトの`.env`ファイルに以下を追加：

```bash
# Web3.Storage w3up設定
REACT_APP_W3UP_EMAIL=your-email@example.com
```

**注意**: 実際に登録したメールアドレスを使用してください。

### 3. パッケージ更新

```bash
# 古いパッケージを削除
npm uninstall web3.storage

# 新しいパッケージをインストール
npm install @web3-storage/w3up-client

# または、package.jsonが更新済みの場合
npm install
```

### 4. 初回認証プロセス

アプリを起動すると、初回のみ以下の手順が実行されます：

1. **メール認証開始**
   ```
   📧 w3up: Email認証を行います...
   Email: your-email@example.com
   メールで送られたリンクをクリックして認証してください。
   ```

2. **メール確認**
   - 受信したメールのリンクをクリック
   - 認証を完了

3. **Space作成**
   - 自動的にNFT用のSpaceが作成されます
   - 以降の使用では認証は不要

## 🎯 現在の動作

### ✅ w3upが設定済みの場合
```
🌍 w3up email found - Real IPFS will be used
✅ 画像が正常にIPFSにアップロード
✅ Etherscan、OpenSea、Gemcaseで画像表示
✅ 永続的なデータ保存
```

### 🧪 w3upが未設定の場合
```
ℹ️ w3up email not found. To use real IPFS:
   1. Sign up at: https://console.web3.storage/
   2. Add REACT_APP_W3UP_EMAIL=your_email@example.com to .env file
   3. Follow email verification process
🧪 Using mock IPFS service for development
```

## 🔗 確認方法

### 1. コンソールログで確認
```javascript
// 成功時のログ例
✅ File uploaded successfully!
📸 Image CID: bafybeic...
🔗 IPFS URI: ipfs://bafybeic...
🌍 HTTPS URL: https://bafybeic....ipfs.w3s.link
```

### 2. NFTミント後の確認
- **Etherscan**: トランザクション詳細で画像確認
- **Gemcase**: Contract Address + Token IDで表示
- **OpenSea**: メインネット上でNFT表示

## 🛠️ トラブルシューティング

### 問題1: メール認証が完了しない
```bash
# 解決方法
1. スパムフォルダを確認
2. 別のメールアドレスを試す
3. .envファイルのメールアドレスを確認
```

### 問題2: "w3up client not available" エラー
```bash
# 原因: パッケージがインストールされていない
npm install @web3-storage/w3up-client

# または環境変数が設定されていない
# .envファイルにREACT_APP_W3UP_EMAIL=... を追加
```

### 問題3: アップロードが失敗する
```bash
# デバッグ手順
1. コンソールでエラーメッセージを確認
2. ネットワーク接続を確認
3. ファイルサイズが10MB以下か確認
4. プランの容量制限を確認
```

## 📋 環境変数一覧

```bash
# .env ファイル例

# Web3.Storage w3up設定（新）
REACT_APP_W3UP_EMAIL=your-email@example.com

# 古い設定（削除可能）
# REACT_APP_WEB3_STORAGE_TOKEN=... (廃止済み)

# Ethereum設定
REACT_APP_CONTRACT_ADDRESS=0x590D13672DDB149A4602989A7B3B7D35a082B433
REACT_APP_NETWORK_NAME=sepolia
```

## 🚀 起動手順

```bash
# 1. 依存関係をインストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# .envファイルを編集してREACT_APP_W3UP_EMAILを設定

# 3. アプリケーション起動
npm start

# 4. 初回のみメール認証を完了
# ブラウザコンソールの指示に従ってメール認証
```

## 💡 追加情報

### コスト比較
- **無料プラン**: 5GB（個人開発・テスト用）
- **有料プラン**: $10/月〜（本格運用）
- **従来の中央集権サービス**: AWS S3等と競争力のある価格

### 技術的メリット
- **分散型**: 単一障害点なし
- **検証可能**: CIDによるデータ整合性
- **相互運用性**: IPFS標準対応
- **永続性**: Filecoinによる長期保存

### 開発体験
- **シンプル**: 従来と同じAPI
- **高速**: 最適化されたアップロード
- **信頼性**: エンタープライズグレード
- **サポート**: 活発なコミュニティ

---

**これで画像がEtherscanやNFTマーケットプレイスで正常に表示されるようになります！** 🎉