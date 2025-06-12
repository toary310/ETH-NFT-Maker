// Reactライブラリをインポート
// Material-UIのボタンコンポーネントをインポート
import { Button } from '@mui/material';

/**
 * 🔐 ウォレット接続コンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「デジタル財布の受付係」のような役割を果たします。
 * ユーザーがMetaMaskなどのウォレットを接続する入り口を提供し、
 * 接続状態に応じて適切なUIを表示します。
 *
 * 【表示パターン】
 * 1. 未接続時 - 接続ボタンと説明文を表示
 * 2. 接続中 - 接続処理中の状態を表示
 * 3. 接続済み - 接続中のアカウント情報と次のステップの案内を表示
 *
 * 【ウォレット接続の重要性】
 * - NFTの作成にはブロックチェーンとの通信が必要
 * - ウォレットは暗号通貨の管理とトランザクションの署名を行う
 * - セキュリティ上、ユーザーの明示的な許可が必要
 *
 * 【UXの配慮】
 * - 接続状態を明確に表示
 * - 処理中は操作を無効化
 * - アカウントアドレスは読みやすく短縮表示
 * - 次のステップを分かりやすく案内
 *
 * 【初心者向け解説】
 * - ウォレット = デジタル財布（MetaMask等）
 * - アカウント = ウォレット内の個別アドレス
 * - 接続 = アプリがウォレットにアクセスする許可を得ること
 * - トランザクション = ブロックチェーン上での取引
 *
 * @param {string} currentAccount - 現在接続中のウォレットアドレス
 * @param {boolean} isConnecting - ウォレット接続処理中かどうか
 * @param {function} connectWallet - ウォレット接続を実行する関数
 * @param {boolean} isPending - 何らかの処理が進行中かどうか
 */
const WalletConnection = ({
  currentAccount,
  isConnecting,
  connectWallet,
  isPending
}) => {

  // 🔌 未接続時のUI表示
  if (!currentAccount) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {/* 🔘 ウォレット接続ボタン */}
        <Button
          variant="contained"
          size="large"
          onClick={connectWallet}
          disabled={isConnecting || isPending}  // 処理中は無効化
          style={{
            padding: '12px 24px',
            fontSize: '1.1em',
            backgroundColor: '#1976d2',          // 青色
            '&:hover': {
              backgroundColor: '#1565c0'         // ホバー時の濃い青
            }
          }}
        >
          {(isConnecting || isPending) ? '接続中...' : 'Connect to Wallet'}
        </Button>

        {/* 📝 接続方法の説明 */}
        <div style={{
          marginTop: '10px',
          fontSize: '0.9em',
          color: '#666'
        }}>
          MetaMaskでウォレットを接続してください
        </div>
      </div>
    );
  }

  // ✅ 接続済み時のUI表示
  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      {/* 🎯 次のステップの案内 */}
      <div style={{
        marginBottom: '10px',
        fontSize: '1.1em',
        color: '#333'
      }}>
        画像を選択してオリジナルNFTを作成しましょう！
      </div>

      {/* 🔗 接続中のアカウント情報表示 */}
      <div style={{
        fontSize: '0.9em',
        color: '#666',
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',           // 薄いグレー背景
        borderRadius: '8px',
        display: 'inline-block'
      }}>
        <span style={{ marginRight: '8px' }}>🔗</span>
        {/* アドレスを短縮表示（最初6文字...最後4文字） */}
        接続中のアカウント: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
      </div>
    </div>
  );
};

export default WalletConnection;
