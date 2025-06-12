// Reactライブラリをインポート

/**
 * 🌐 IPFS状態表示コンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「ファイル保存サービスの案内係」のような役割を果たします。
 * 現在使用しているIPFS（分散ファイルストレージ）サービスの状態を表示し、
 * 実際のサービスを使用していない場合は設定方法を案内します。
 *
 * 【IPFSとは？】
 * InterPlanetary File System = 惑星間ファイルシステム
 * - 分散型のファイル保存システム
 * - ファイルは世界中の複数のサーバーに分散保存される
 * - 検閲に強く、永続的にファイルが保存される
 * - NFTの画像やメタデータの保存に最適
 *
 * 【表示する情報】
 * 1. 現在のIPFSサービス状態（実際 or テスト用）
 * 2. 各状態での機能の可用性
 * 3. 実際のIPFSサービス設定方法
 * 4. 注意事項とヒント
 *
 * 【初心者向け解説】
 * - 実際のIPFS = 本物の分散ストレージサービス（Storacha等）
 * - モックIPFS = テスト用の偽物サービス（開発・学習用）
 * - Etherscan = イーサリアムブロックチェーンの情報を見るサイト
 * - NFTマーケットプレイス = NFTを売買・展示するサイト
 *
 * @param {boolean} isUsingRealIPFS - 実際のIPFSサービスを使用中かどうか
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
      {/* 🏷️ タイトル部分 */}
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

      {/* 📊 状態表示部分 */}
      <div style={{
        color: isUsingRealIPFS ? "#2e7d32" : "#856404",
        lineHeight: "1.5"
      }}>
        {isUsingRealIPFS ? (
          // ✅ 実際のIPFS使用時の表示
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

            {/* 💡 実際のIPFS使用時のヒント */}
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
          // ⚠️ モックIPFS使用時の表示
          <div>
            <div style={{ marginBottom: "10px" }}>
              <strong>現在の状態:</strong>
            </div>

            {/* 現在の制限事項 */}
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

            {/* 設定方法の案内 */}
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

            {/* ⚠️ モックIPFS使用時の注意事項 */}
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
