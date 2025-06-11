import React, { useState, useEffect, useCallback } from 'react';
import { validateEtherscanNFTDisplay, convertIpfsToHttps } from '../../utils/mockIPFS';

/**
 * Etherscan表示ステータスコンポーネント - React 19対応版
 * NFTのEtherscan表示互換性をリアルタイムで監視・表示
 */
const EtherscanStatus = ({ tokenUri, onStatusUpdate }) => {
  const [status, setStatus] = useState({
    isChecking: false,
    isCompatible: null,
    lastChecked: null,
    details: null,
    error: null
  });

  // Etherscan互換性チェック
  const checkCompatibility = useCallback(async () => {
    if (!tokenUri) return;

    try {
      setStatus(prev => ({ ...prev, isChecking: true, error: null }));
      
      const validation = await validateEtherscanNFTDisplay(tokenUri);
      
      const newStatus = {
        isChecking: false,
        isCompatible: validation.isEtherscanCompatible,
        lastChecked: new Date(),
        details: validation,
        error: null
      };
      
      setStatus(newStatus);
      
      // 親コンポーネントに結果を通知
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }
      
    } catch (error) {
      const errorStatus = {
        isChecking: false,
        isCompatible: false,
        lastChecked: new Date(),
        details: null,
        error: error.message
      };
      
      setStatus(errorStatus);
      
      if (onStatusUpdate) {
        onStatusUpdate(errorStatus);
      }
    }
  }, [tokenUri, onStatusUpdate]);

  // 自動チェック（初回と定期実行）
  useEffect(() => {
    if (tokenUri) {
      // 初回チェック
      checkCompatibility();
      
      // 5分ごとに再チェック（IPFS伝播監視）
      const interval = setInterval(checkCompatibility, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [tokenUri, checkCompatibility]);

  // ステータス表示の色とアイコン
  const getStatusDisplay = () => {
    if (status.isChecking) {
      return {
        color: '#ff9800',
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        icon: '🔄',
        text: '検証中...'
      };
    }
    
    if (status.error) {
      return {
        color: '#d32f2f',
        backgroundColor: '#ffebee',
        borderColor: '#ffcdd2',
        icon: '❌',
        text: 'エラー'
      };
    }
    
    if (status.isCompatible === true) {
      return {
        color: '#2e7d32',
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
        icon: '✅',
        text: 'Etherscan表示対応'
      };
    }
    
    if (status.isCompatible === false) {
      return {
        color: '#d84315',
        backgroundColor: '#fbe9e7',
        borderColor: '#ffab91',
        icon: '⚠️',
        text: '表示未確認'
      };
    }
    
    return {
      color: '#666',
      backgroundColor: '#f5f5f5',
      borderColor: '#e0e0e0',
      icon: '❓',
      text: '未チェック'
    };
  };

  const displayInfo = getStatusDisplay();

  return (
    <div style={{
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${displayInfo.borderColor}`,
      backgroundColor: displayInfo.backgroundColor,
      marginTop: '10px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{
          fontWeight: 'bold',
          color: displayInfo.color,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{displayInfo.icon}</span>
          <span>{displayInfo.text}</span>
        </div>
        
        <button
          onClick={checkCompatibility}
          disabled={status.isChecking}
          style={{
            padding: '4px 8px',
            fontSize: '0.8em',
            backgroundColor: status.isChecking ? '#ccc' : displayInfo.color,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: status.isChecking ? 'not-allowed' : 'pointer'
          }}
        >
          {status.isChecking ? '⏳' : '🔄'} 再チェック
        </button>
      </div>

      {/* 詳細情報 */}
      {status.details && (
        <div style={{ fontSize: '0.85em', lineHeight: '1.4' }}>
          <div style={{ marginBottom: '6px' }}>
            <strong>📄 メタデータ:</strong> {status.details.metadataAccessible ? '✅ アクセス可能' : '❌ アクセス不可'}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong>🖼️ 画像表示:</strong> {status.details.imageAccessible ? '✅ 表示可能' : '❌ 表示不可'}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong>🔗 HTTPS形式:</strong> {status.details.imageIsHttps ? '✅ 対応' : '❌ 非対応'}
          </div>
          
          {status.details.alternativeImageUrl && (
            <div style={{ 
              marginTop: '8px', 
              padding: '6px', 
              backgroundColor: 'rgba(255,255,255,0.7)', 
              borderRadius: '4px',
              fontSize: '0.8em'
            }}>
              <strong>🔧 代替URL:</strong>
              <div style={{ 
                wordBreak: 'break-all', 
                fontFamily: 'monospace',
                marginTop: '2px'
              }}>
                {status.details.alternativeImageUrl}
              </div>
            </div>
          )}
        </div>
      )}

      {/* エラー情報 */}
      {status.error && (
        <div style={{ 
          fontSize: '0.85em', 
          color: '#d32f2f',
          marginTop: '8px',
          padding: '6px',
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '4px'
        }}>
          <strong>エラー詳細:</strong> {status.error}
        </div>
      )}

      {/* 最終チェック時刻 */}
      {status.lastChecked && (
        <div style={{ 
          fontSize: '0.75em', 
          color: '#888', 
          marginTop: '8px',
          textAlign: 'right'
        }}>
          最終チェック: {status.lastChecked.toLocaleTimeString('ja-JP')}
        </div>
      )}

      {/* IPFS伝播についての説明 */}
      {status.isCompatible === false && !status.isChecking && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: '4px',
          fontSize: '0.8em',
          color: '#666'
        }}>
          <div><strong>💡 ヒント:</strong></div>
          <div>• IPFS伝播には時間がかかる場合があります</div>
          <div>• 数分後に自動で再チェックされます</div>
          <div>• 手動で「再チェック」ボタンも使用できます</div>
        </div>
      )}
    </div>
  );
};

export default EtherscanStatus;
