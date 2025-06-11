import React from 'react';
import { Button } from '@mui/material';

/**
 * ウォレット接続コンポーネント
 * 責務：
 * - ウォレット接続ボタンの表示
 * - 接続状態の表示
 * - アカウント情報の表示
 */
const WalletConnection = ({ 
  currentAccount, 
  isConnecting, 
  connectWallet, 
  isPending 
}) => {
  // 未接続時のUI
  if (!currentAccount) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Button
          variant="contained"
          size="large"
          onClick={connectWallet}
          disabled={isConnecting || isPending}
          style={{
            padding: '12px 24px',
            fontSize: '1.1em',
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          {(isConnecting || isPending) ? '接続中...' : 'Connect to Wallet'}
        </Button>
        
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

  // 接続済み時のUI
  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <div style={{ 
        marginBottom: '10px',
        fontSize: '1.1em',
        color: '#333'
      }}>
        画像を選択してオリジナルNFTを作成しましょう！
      </div>
      
      <div style={{ 
        fontSize: '0.9em', 
        color: '#666',
        padding: '8px 16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        display: 'inline-block'
      }}>
        <span style={{ marginRight: '8px' }}>🔗</span>
        接続中のアカウント: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
      </div>
    </div>
  );
};

export default WalletConnection;
