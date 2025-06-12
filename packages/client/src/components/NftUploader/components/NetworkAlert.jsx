// Reactライブラリをインポート
// Material-UIのアラートとボタンコンポーネントをインポート
import { Alert, Button } from '@mui/material';

/**
 * 🚨 ネットワークアラートコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「システムの状況案内係」のような役割を果たします。
 * ネットワーク接続の問題、ウォレットの問題、成功メッセージなど、
 * ユーザーが知るべき重要な情報を適切な色とアイコンで分かりやすく表示します。
 *
 * 【表示するアラートの種類】
 * 1. ネットワークエラー（警告） - 間違ったネットワークに接続している場合
 * 2. ウォレットエラー（エラー） - ウォレット関連の問題が発生した場合
 * 3. 成功メッセージ（成功） - 操作が正常に完了した場合
 *
 * 【ネットワークエラーの対応】
 * - Sepoliaテストネットワーク以外に接続している場合に警告表示
 * - ワンクリックでSepoliaに切り替えられるボタンを提供
 * - 分かりやすいエラーメッセージで状況を説明
 *
 * 【初心者向け解説】
 * - ネットワーク = ブロックチェーンの種類（Ethereum、Sepolia等）
 * - Sepolia = Ethereumのテストネットワーク（無料でテスト可能）
 * - ウォレット = MetaMaskなどのデジタル財布
 * - アラート = ユーザーへの重要な通知
 *
 * @param {string} networkError - ネットワーク関連のエラーメッセージ
 * @param {string} walletError - ウォレット関連のエラーメッセージ
 * @param {string} success - 成功メッセージ
 * @param {function} switchToSepolia - Sepoliaネットワークに切り替える関数
 */
const NetworkAlert = ({
  networkError,
  walletError,
  success,
  switchToSepolia
}) => {
  return (
    <div style={{ margin: '10px 0' }}>
      {/* ⚠️ ネットワークエラーアラート（警告レベル） */}
      {networkError && (
        <Alert
          severity="warning"           // 警告レベル（オレンジ色）
          style={{
            margin: "10px 0",
            whiteSpace: "pre-line"     // 改行文字を実際の改行として表示
          }}
          action={
            // 🔄 Sepoliaネットワーク切り替えボタン
            <Button
              onClick={switchToSepolia}
              size="small"
              style={{
                backgroundColor: "#ff9800",  // オレンジ色
                color: "white",
                '&:hover': {
                  backgroundColor: "#f57c00"  // ホバー時の濃いオレンジ
                }
              }}
            >
              Sepoliaに切り替え
            </Button>
          }
        >
          {networkError}
        </Alert>
      )}

      {/* ❌ ウォレットエラーアラート（エラーレベル） */}
      {walletError && (
        <Alert severity="error" style={{ margin: "10px 0" }}>
          {walletError}
        </Alert>
      )}

      {/* ✅ 成功メッセージアラート（成功レベル） */}
      {success && (
        <Alert severity="success" style={{ margin: "10px 0" }}>
          {success}
        </Alert>
      )}
    </div>
  );
};

export default NetworkAlert;
