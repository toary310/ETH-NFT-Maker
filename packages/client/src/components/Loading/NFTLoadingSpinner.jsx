// Reactライブラリをインポート
// Material-UIのコンポーネントをインポート
import { Box, CircularProgress, Fade, Typography } from '@mui/material';

/**
 * ⏳ NFTアプリケーション専用ローディングスピナーコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「待機中の案内係」のような役割を果たします。
 * ユーザーが何かの処理を待っている間に、美しいアニメーションと
 * 分かりやすいメッセージで「今何をしているか」を伝えます。
 *
 * 【ローディングUIの重要性】
 * - ユーザーに処理が進行中であることを伝える
 * - 不安や混乱を防ぐ
 * - アプリが固まっていないことを示す
 * - 処理時間の体感を短くする
 *
 * 【主な機能】
 * 1. 美しい円形プログレスアニメーション
 * 2. カスタマイズ可能なメッセージ表示
 * 3. フルスクリーンモード対応
 * 4. フェードイン/アウトアニメーション
 * 5. NFTアイコン付きデザイン
 *
 * 【React 19 Suspense対応】
 * - 新しいReactの非同期処理機能に対応
 * - スムーズなローディング体験を提供
 *
 * @param {string} message - 表示するメッセージ
 * @param {number} size - スピナーのサイズ（ピクセル）
 * @param {boolean} showMessage - メッセージを表示するかどうか
 * @param {boolean} fullScreen - フルスクリーン表示するかどうか
 */
const NFTLoadingSpinner = ({
  message = 'Loading...',
  size = 60,
  showMessage = true,
  fullScreen = false
}) => {

  // 🎨 ローディングコンテンツの内部コンポーネント
  const LoadingContent = () => (
    <Fade in timeout={300}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        p={3}
      >
        {/* 🔄 メインのローディングスピナー */}
        <Box position="relative">
          <CircularProgress
            size={size}
            thickness={4}
            style={{ color: '#1976d2' }}
          />
          {/* 🖼️ 中央のNFTアイコン */}
          <Box
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            right={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography
              variant="caption"
              component="div"
              style={{ fontSize: '1.5rem' }}
            >
              🖼️
            </Typography>
          </Box>
        </Box>

        {/* 📝 メインメッセージ（オプション） */}
        {showMessage && (
          <Typography
            variant="h6"
            color="textSecondary"
            style={{
              fontWeight: 500,
              animation: 'pulse 2s infinite'
            }}
          >
            {message}
          </Typography>
        )}

        {/* 💬 サブメッセージ */}
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ opacity: 0.7 }}
        >
          NFTの準備をしています...
        </Typography>

        {/* 🎭 CSSアニメーション定義 */}
        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </Box>
    </Fade>
  );

  // 🖥️ フルスクリーンモードの場合
  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="rgba(255, 255, 255, 0.9)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <LoadingContent />
      </Box>
    );
  }

  // 📦 通常モードの場合
  return (
    <Box
      minHeight="200px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <LoadingContent />
    </Box>
  );
};

// 🔐 ウォレット接続専用ローディングスピナー
export const WalletLoadingSpinner = () => (
  <NFTLoadingSpinner
    message="ウォレットに接続中..."
    size={50}
  />
);

// 📄 コントラクト情報取得専用ローディングスピナー
export const ContractLoadingSpinner = () => (
  <NFTLoadingSpinner
    message="コントラクト情報を取得中..."
    size={40}
  />
);

// 🌐 IPFSアップロード専用ローディングスピナー
export const IPFSLoadingSpinner = () => (
  <NFTLoadingSpinner
    message="IPFSにアップロード中..."
    size={50}
  />
);

// 💰 トランザクション処理専用ローディングスピナー（フルスクリーン）
export const TransactionLoadingSpinner = () => (
  <NFTLoadingSpinner
    message="トランザクション処理中..."
    size={60}
    fullScreen
  />
);

export default NFTLoadingSpinner;
