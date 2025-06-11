import React from 'react';
import { Button } from '@mui/material';

/**
 * コントラクト状態表示コンポーネント
 * 責務：
 * - コントラクト情報の表示
 * - ミント状態の表示
 * - エラー状態の表示
 */
const ContractStatus = ({ 
  contractInfo, 
  loading, 
  error, 
  onRefresh 
}) => {
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
        <div style={{ 
          fontWeight: "bold", 
          marginBottom: "10px",
          color: "#d32f2f"
        }}>
          ⚠️ コントラクト情報取得エラー
        </div>
        
        <div style={{ 
          color: "#d32f2f",
          marginBottom: "10px"
        }}>
          {error}
        </div>

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
