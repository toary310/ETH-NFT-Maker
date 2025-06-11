import React from 'react';

/**
 * IPFS状態表示コンポーネント
 * 責務：
 * - IPFSサービスの状態表示
 * - 設定方法の案内
 * - サービス切り替えの説明
 */
const IpfsStatus = ({ isUsingRealIPFS }) => {
  return (
    <div style={{
      marginTop: "20px",
      padding: "15px",
      backgroundColor: isUsingRealIPFS ? "#e8f5e8" : "#fff3cd",
      border: `1px solid ${isUsingRealIPFS ? "#4caf50" : "#ffeaa7"}`,
      borderRadius: "8px",
      fontSize: "0.9em"
    }}>
      {/* タイトル */}
      <div style={{ 
        fontWeight: "bold", 
        marginBottom: "10px", 
        color: isUsingRealIPFS ? "#2e7d32" : "#856404",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <span>{isUsingRealIPFS ? "🌍" : "📝"}</span>
        {isUsingRealIPFS ? "IPFSサービス状態" : "IPFSサービス設定"}
      </div>

      {/* 状態表示 */}
      <div style={{ 
        color: isUsingRealIPFS ? "#2e7d32" : "#856404", 
        lineHeight: "1.5" 
      }}>
        {isUsingRealIPFS ? (
          // 実際のIPFS使用時
          <div>
            <div style={{ marginBottom: "10px" }}>
              <strong>現在の状態:</strong>
            </div>
            
            <div style={{ marginLeft: "10px" }}>
              <div style={{ marginBottom: "5px" }}>
                ✅ <strong>Storacha (w3up)</strong>を使用中（実際IPFS）
              </div>
              <div style={{ marginBottom: "5px" }}>
                ✅ 画像が正常に表示されます
              </div>
              <div style={{ marginBottom: "5px" }}>
                ✅ データは永続的に保存されます
              </div>
              <div>
                ✅ Etherscanで画像が表示されます
              </div>
            </div>

            <div style={{ 
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "rgba(46, 125, 50, 0.1)",
              borderRadius: "4px",
              fontSize: "0.8em"
            }}>
              <strong>💡 ヒント:</strong> 実際のIPFSを使用しているため、作成したNFTは
              Etherscan、OpenSea、その他のNFTマーケットプレイスで正常に表示されます。
            </div>
          </div>
        ) : (
          // モックIPFS使用時
          <div>
            <div style={{ marginBottom: "10px" }}>
              <strong>現在の状態:</strong>
            </div>
            
            <div style={{ marginLeft: "10px", marginBottom: "15px" }}>
              <div style={{ marginBottom: "5px" }}>
                🧪 <strong>モックIPFS</strong>を使用中（テスト用）
              </div>
              <div style={{ marginBottom: "5px" }}>
                ⚠️ 画像は表示されません
              </div>
              <div style={{ marginBottom: "5px" }}>
                ⚠️ テストネットでのみ使用可能
              </div>
              <div>
                ⚠️ Etherscanで画像が表示されません
              </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>実際IPFSを使用するには:</strong>
            </div>
            
            <div style={{ marginLeft: "10px", fontSize: "0.85em" }}>
              <div style={{ marginBottom: "5px" }}>
                1. <a 
                  href="https://console.storacha.network/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: "#856404", textDecoration: "underline" }}
                >
                  console.storacha.network
                </a> でアカウント作成
              </div>
              <div style={{ marginBottom: "5px" }}>
                2. メール認証を完了
              </div>
              <div style={{ marginBottom: "5px" }}>
                3. .envファイルに <code>REACT_APP_W3UP_EMAIL=your-email@example.com</code> を追加
              </div>
              <div>
                4. アプリを再起動
              </div>
            </div>

            <div style={{ 
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "rgba(133, 100, 4, 0.1)",
              borderRadius: "4px",
              fontSize: "0.8em"
            }}>
              <strong>⚠️ 注意:</strong> モックIPFSではNFTの画像が表示されません。
              実際のNFTを作成する場合は、上記の手順でStorachaを設定してください。
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IpfsStatus;
