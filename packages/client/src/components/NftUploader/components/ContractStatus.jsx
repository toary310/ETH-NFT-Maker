// Reactライブラリをインポート
// Material-UIのボタンコンポーネントをインポート
import { Button } from '@mui/material';

/**
 * 📋 スマートコントラクト状態表示コンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「コントラクトの健康診断書」のような役割を果たします。
 * ブロックチェーン上のスマートコントラクトの現在の状態を分かりやすく表示し、
 * ユーザーがNFTを作成できるかどうかを一目で判断できるようにします。
 *
 * 【表示する情報】
 * 1. ミント機能の有効性 - NFT作成が可能かどうか
 * 2. ミント価格 - NFT作成にかかる費用（ETH）
 * 3. 発行状況 - 現在の発行数と最大発行数
 * 4. 進捗バー - 発行状況の視覚的表示
 * 5. 警告メッセージ - 問題がある場合の通知
 *
 * 【状態管理】
 * - ローディング状態 - 情報取得中の表示
 * - エラー状態 - 取得失敗時の表示と再試行機能
 * - 正常状態 - 詳細情報の表示
 *
 * 【初心者向け解説】
 * - スマートコントラクト = ブロックチェーン上で動くプログラム
 * - ミント = NFTを新しく作成すること
 * - ETH = イーサリアムの暗号通貨
 * - 発行数 = 作成済みのNFTの数
 *
 * @param {object} contractInfo - コントラクトの詳細情報
 * @param {boolean} loading - 情報取得中かどうか
 * @param {string} error - エラーメッセージ
 * @param {function} onRefresh - 情報更新関数
 */
const ContractStatus = ({
  contractInfo,
  loading,
  error,
  onRefresh
}) => {

  // ⏳ ローディング状態の表示
  if (loading) {
    return (
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        fontSize: "0.9em",
        textAlign: "center"
      }}>
        <div>📡 コントラクト情報を取得中...</div>
      </div>
    );
  }

  // ❌ エラー状態の表示
  if (error) {
    return (
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#ffebee",
        border: "1px solid #f44336",
        borderRadius: "8px",
        fontSize: "0.9em"
      }}>
        {/* エラータイトル */}
        <div style={{
          fontWeight: "bold",
          marginBottom: "10px",
          color: "#d32f2f"
        }}>
          ⚠️ コントラクト情報取得エラー
        </div>

        {/* エラーメッセージ */}
        <div style={{
          color: "#d32f2f",
          marginBottom: "10px"
        }}>
          {error}
        </div>

        {/* 再試行ボタン */}
        <Button
          size="small"
          onClick={onRefresh}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            '&:hover': {
              backgroundColor: "#d32f2f"
            }
          }}
        >
          再試行
        </Button>
      </div>
    );
  }

  if (!contractInfo) {
    return null;
  }

  const {
    mintingEnabled,
    mintPrice,
    currentSupply,
    maxSupply,
    isMaxReached
  } = contractInfo;

  return (
    <div style={{
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#f8f9fa",
      border: "1px solid #dee2e6",
      borderRadius: "8px",
      fontSize: "0.9em"
    }}>
      {/* タイトル */}
      <div style={{
        fontWeight: "bold",
        marginBottom: "15px",
        color: "#333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <span>📋 コントラクト情報</span>

        <Button
          size="small"
          onClick={onRefresh}
          style={{
            fontSize: "0.7em",
            padding: "2px 8px",
            minWidth: "auto"
          }}
        >
          🔄
        </Button>
      </div>

      {/* 情報表示 */}
      <div style={{ lineHeight: "1.6" }}>
        {/* ミント機能状態 */}
        <div style={{
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontWeight: "bold" }}>ミント機能:</span>
          <span style={{
            color: mintingEnabled ? "#4caf50" : "#f44336",
            fontWeight: "bold"
          }}>
            {mintingEnabled ? "✅ 有効" : "❌ 無効"}
          </span>
        </div>

        {/* ミント価格 */}
        <div style={{
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontWeight: "bold" }}>ミント価格:</span>
          <span style={{
            fontFamily: "monospace",
            backgroundColor: "#e9ecef",
            padding: "2px 6px",
            borderRadius: "4px"
          }}>
            {mintPrice} ETH
          </span>
        </div>

        {/* 発行数 */}
        <div style={{
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontWeight: "bold" }}>発行数:</span>
          <span>
            {currentSupply} / {maxSupply}
          </span>
          <div style={{
            width: "100px",
            height: "6px",
            backgroundColor: "#e9ecef",
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${(currentSupply / maxSupply) * 100}%`,
              height: "100%",
              backgroundColor: isMaxReached ? "#f44336" : "#4caf50",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
      </div>

      {/* 警告メッセージ */}
      {(isMaxReached || !mintingEnabled) && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "4px"
        }}>
          {isMaxReached && (
            <div style={{ color: "#d32f2f", marginBottom: "5px" }}>
              ⚠️ 最大発行数に達しています
            </div>
          )}
          {!mintingEnabled && (
            <div style={{ color: "#d32f2f" }}>
              ⚠️ ミント機能が無効です
            </div>
          )}
        </div>
      )}

      {/* 正常状態のメッセージ */}
      {mintingEnabled && !isMaxReached && (
        <div style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#e8f5e8",
          border: "1px solid #4caf50",
          borderRadius: "4px",
          color: "#2e7d32",
          fontSize: "0.8em"
        }}>
          ✅ NFTの作成が可能です
        </div>
      )}
    </div>
  );
};

export default ContractStatus;
