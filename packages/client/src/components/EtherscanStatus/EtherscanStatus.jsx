// Reactの機能をインポート
import { useCallback, useEffect, useState } from 'react';
// IPFS関連のユーティリティ関数をインポート
import { validateEtherscanNFTDisplay } from '../../utils/mockIPFS';

/**
 * 🔍 Etherscan表示ステータス監視コンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「NFTの表示品質チェッカー」のような役割を果たします。
 * 作成したNFTがEtherscan（イーサリアムのブロックエクスプローラー）で
 * 正しく表示されるかどうかをリアルタイムで監視・確認します。
 *
 * 【Etherscanとは？】
 * - イーサリアムブロックチェーンの「図書館」のような存在
 * - トランザクション、アドレス、NFTなどの情報を検索・表示
 * - NFTの画像やメタデータも表示される
 * - 多くの人がNFTの確認に使用する重要なサービス
 *
 * 【主な機能】
 * 1. NFTメタデータのアクセス可能性チェック
 * 2. 画像ファイルの表示可能性チェック
 * 3. HTTPS形式での提供確認
 * 4. IPFS伝播状況の監視
 * 5. 自動再チェック機能（5分間隔）
 *
 * 【初心者向け解説】
 * - メタデータ = NFTの詳細情報（名前、説明、画像URLなど）
 * - IPFS伝播 = ファイルが世界中のIPFSノードに広がること
 * - HTTPS = セキュアなウェブ通信プロトコル
 *
 * @param {string} tokenUri - チェック対象のNFTメタデータURI
 * @param {function} onStatusUpdate - 親コンポーネントへの状態通知関数
 */
const EtherscanStatus = ({ tokenUri, onStatusUpdate }) => {

  // 📊 チェック状況の状態管理
  const [status, setStatus] = useState({
    isChecking: false,      // 現在チェック中かどうか
    isCompatible: null,     // Etherscan互換性（true/false/null）
    lastChecked: null,      // 最後にチェックした時刻
    details: null,          // 詳細なチェック結果
    error: null             // エラー情報
  });

  // 🔍 Etherscan互換性チェック関数
  // useCallbackで最適化（不要な再作成を防ぐ）
  const checkCompatibility = useCallback(async () => {
    // 📋 事前チェック：tokenUriが存在するか確認
    if (!tokenUri) return;

    try {
      // 🏁 チェック開始：状態を「チェック中」に更新
      setStatus(prev => ({ ...prev, isChecking: true, error: null }));

      // 🔍 実際の互換性検証を実行
      const validation = await validateEtherscanNFTDisplay(tokenUri);

      // 📊 チェック結果をまとめる
      const newStatus = {
        isChecking: false,                              // チェック完了
        isCompatible: validation.isEtherscanCompatible, // 互換性結果
        lastChecked: new Date(),                        // チェック時刻
        details: validation,                            // 詳細結果
        error: null                                     // エラーなし
      };

      // 📈 状態を更新
      setStatus(newStatus);

      // 📡 親コンポーネントに結果を通知
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }

    } catch (error) {
      // ❌ エラーが発生した場合の処理
      const errorStatus = {
        isChecking: false,          // チェック完了（エラーで）
        isCompatible: false,        // 互換性なし
        lastChecked: new Date(),    // エラー発生時刻
        details: null,              // 詳細なし
        error: error.message        // エラーメッセージ
      };

      setStatus(errorStatus);

      // 📡 親コンポーネントにエラー状況を通知
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
