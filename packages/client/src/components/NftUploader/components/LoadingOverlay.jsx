// Reactライブラリをインポート
// Material-UIの円形プログレスバーをインポート
import { CircularProgress } from '@mui/material';

/**
 * ⏳ ローディングオーバーレイコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「処理中の案内板」のような役割を果たします。
 * NFT作成などの時間のかかる処理中に画面全体を覆い、
 * ユーザーに現在の進捗状況と待機時間の目安を分かりやすく表示します。
 *
 * 【主な機能】
 * 1. フルスクリーンオーバーレイ - 他の操作を防ぐ
 * 2. 円形プログレスバー - 視覚的な進捗表示
 * 3. 線形プログレスバー - 詳細な進捗パーセンテージ
 * 4. ステップメッセージ - 現在何をしているかの説明
 * 5. 処理段階の説明 - 全体の流れの案内
 * 6. 注意事項 - ユーザーへの重要な案内
 *
 * 【UXの配慮】
 * - 処理が長時間かかることをユーザーに事前に伝える
 * - 現在の進捗を視覚的に分かりやすく表示
 * - 各段階で何をしているかを詳しく説明
 * - ブラウザを閉じないよう注意喚起
 *
 * 【初心者向け解説】
 * - オーバーレイ = 画面全体を覆う半透明の層
 * - z-index = 要素の重なり順序（大きいほど前面）
 * - トランザクション = ブロックチェーンでの取引記録
 * - IPFS = 分散ファイルストレージシステム
 *
 * @param {boolean} uploading - アップロード処理中かどうか
 * @param {boolean} isPending - React 19のpending状態かどうか
 * @param {string} loadingStep - 現在の処理ステップメッセージ
 * @param {number} loadingProgress - 進捗パーセンテージ（0-100）
 */
const LoadingOverlay = ({
  uploading,
  isPending,
  loadingStep,
  loadingProgress
}) => {

  // 📋 表示条件チェック：処理中でない場合は何も表示しない
  if (!uploading && !isPending) {
    return null;
  }

  return (
    // 🖥️ フルスクリーンオーバーレイ（画面全体を覆う）
    <div style={{
      position: "fixed",                    // 画面に固定
      top: 0,                              // 上端から
      left: 0,                             // 左端から
      right: 0,                            // 右端まで
      bottom: 0,                           // 下端まで
      backgroundColor: "rgba(0, 0, 0, 0.8)", // 半透明の黒背景
      display: "flex",                     // フレックスボックスレイアウト
      justifyContent: "center",            // 水平方向中央揃え
      alignItems: "center",                // 垂直方向中央揃え
      zIndex: 9999                         // 最前面に表示
    }}>
      {/* 📦 メインコンテンツボックス */}
      <div style={{
        backgroundColor: "white",           // 白背景
        padding: "40px",                   // 内側の余白
        borderRadius: "12px",              // 角を丸く
        textAlign: "center",               // テキスト中央揃え
        maxWidth: "400px",                 // 最大幅
        width: "90%",                      // レスポンシブ対応
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" // 影効果
      }}>
        {/* 🔄 円形プログレスバー */}
        <div style={{ marginBottom: "20px" }}>
          <CircularProgress
            size={60}                      // サイズ（ピクセル）
            variant="determinate"          // 進捗値を表示するタイプ
            value={loadingProgress}        // 進捗値（0-100）
            style={{ color: "#1976d2" }}   // 青色
          />
        </div>

        {/* 🏷️ メインタイトル */}
        <div style={{
          fontSize: "1.2em",
          fontWeight: "bold",
          marginBottom: "10px",
          color: "#333"
        }}>
          {isPending ? "UI更新中..." : "NFT作成中..."}
        </div>

        {/* 📝 現在のステップメッセージ */}
        <div style={{
          fontSize: "0.9em",
          color: "#666",
          marginBottom: "15px",
          minHeight: "20px"               // 最小高さを確保（レイアウト安定化）
        }}>
          {loadingStep}
        </div>

        {/* 📊 線形プログレスバー（詳細な進捗表示） */}
        <div style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#f0f0f0",        // 背景色（グレー）
          borderRadius: "4px",               // 角を丸く
          overflow: "hidden",                // はみ出し部分を隠す
          marginBottom: "10px"
        }}>
          <div style={{
            width: `${loadingProgress}%`,     // 進捗に応じて幅を変更
            height: "100%",
            backgroundColor: "#1976d2",      // 進捗バーの色（青）
            borderRadius: "4px",
            transition: "width 0.3s ease"    // スムーズなアニメーション
          }} />
        </div>

        {/* 📈 パーセンテージ表示 */}
        <div style={{
          fontSize: "0.8em",
          color: "#999",
          marginBottom: "20px"
        }}>
          {loadingProgress}% 完了
        </div>

        {/* ⚠️ 重要な注意メッセージ */}
        <div style={{
          fontSize: "0.8em",
          color: "#666",
          lineHeight: "1.4",
          padding: "15px",
          backgroundColor: "#f8f9fa",        // 薄いグレー背景
          borderRadius: "8px",
          border: "1px solid #dee2e6"        // 薄いグレーの枠線
        }}>
          <div style={{ marginBottom: "5px" }}>
            ⚠️ この処理には数分かかる場合があります
          </div>
          <div>
            ブラウザを閉じないでお待ちください
          </div>
        </div>

        {/* 📋 処理段階の詳細説明 */}
        <div style={{
          marginTop: "15px",
          fontSize: "0.7em",
          color: "#999",
          textAlign: "left"                  // 左揃え（読みやすさのため）
        }}>
          <div><strong>処理段階:</strong></div>
          <div>1. ファイル検証 (0-10%)</div>
          <div>2. IPFS アップロード (10-60%)</div>
          <div>3. スマートコントラクト実行 (60-90%)</div>
          <div>4. トランザクション確認 (90-100%)</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
