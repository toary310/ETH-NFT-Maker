import React from 'react';
import { CircularProgress } from '@mui/material';

/**
 * ローディングオーバーレイコンポーネント
 * 責務：
 * - ローディング状態の表示
 * - 進捗バーの表示
 * - ローディングメッセージの表示
 */
const LoadingOverlay = ({ 
  uploading, 
  isPending, 
  loadingStep, 
  loadingProgress 
}) => {
  if (!uploading && !isPending) {
    return null;
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
      }}>
        {/* 円形プログレスバー */}
        <div style={{ marginBottom: "20px" }}>
          <CircularProgress 
            size={60} 
            variant="determinate" 
            value={loadingProgress}
            style={{ color: "#1976d2" }}
          />
        </div>
        
        {/* メインタイトル */}
        <div style={{
          fontSize: "1.2em",
          fontWeight: "bold",
          marginBottom: "10px",
          color: "#333"
        }}>
          {isPending ? "UI更新中..." : "NFT作成中..."}
        </div>
        
        {/* ステップメッセージ */}
        <div style={{
          fontSize: "0.9em",
          color: "#666",
          marginBottom: "15px",
          minHeight: "20px"
        }}>
          {loadingStep}
        </div>
        
        {/* 線形プログレスバー */}
        <div style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "10px"
        }}>
          <div style={{
            width: `${loadingProgress}%`,
            height: "100%",
            backgroundColor: "#1976d2",
            borderRadius: "4px",
            transition: "width 0.3s ease"
          }} />
        </div>
        
        {/* パーセンテージ表示 */}
        <div style={{
          fontSize: "0.8em",
          color: "#999",
          marginBottom: "20px"
        }}>
          {loadingProgress}% 完了
        </div>
        
        {/* 注意メッセージ */}
        <div style={{
          fontSize: "0.8em",
          color: "#666",
          lineHeight: "1.4",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <div style={{ marginBottom: "5px" }}>
            ⚠️ この処理には数分かかる場合があります
          </div>
          <div>
            ブラウザを閉じないでお待ちください
          </div>
        </div>

        {/* 処理段階の説明 */}
        <div style={{
          marginTop: "15px",
          fontSize: "0.7em",
          color: "#999",
          textAlign: "left"
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
