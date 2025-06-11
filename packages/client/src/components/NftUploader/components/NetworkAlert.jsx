import React from 'react';
import { Alert, Button } from '@mui/material';

/**
 * ネットワークアラートコンポーネント
 * 責務：
 * - ネットワークエラーの表示
 * - ネットワーク切り替えボタン
 * - エラーメッセージの表示
 */
const NetworkAlert = ({ 
  networkError, 
  walletError, 
  success, 
  switchToSepolia 
}) => {
  return (
    <div style={{ margin: '10px 0' }}>
      {/* ネットワークエラーアラート */}
      {networkError && (
        <Alert 
          severity="warning" 
          style={{ 
            margin: "10px 0",
            whiteSpace: "pre-line"
          }}
          action={
            <Button
              onClick={switchToSepolia}
              size="small"
              style={{
                backgroundColor: "#ff9800",
                color: "white",
                '&:hover': {
                  backgroundColor: "#f57c00"
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

      {/* ウォレットエラーアラート */}
      {walletError && (
        <Alert severity="error" style={{ margin: "10px 0" }}>
          {walletError}
        </Alert>
      )}

      {/* 成功メッセージ */}
      {success && (
        <Alert severity="success" style={{ margin: "10px 0" }}>
          {success}
        </Alert>
      )}
    </div>
  );
};

export default NetworkAlert;
