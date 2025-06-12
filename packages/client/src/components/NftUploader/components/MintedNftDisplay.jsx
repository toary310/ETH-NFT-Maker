// Material-UIのボタンコンポーネントをインポート
import { Button } from '@mui/material';
// Ethereumブロックチェーンとの通信ライブラリをインポート
import { ethers } from 'ethers';
// Reactの機能をインポート
import { useCallback, useState } from 'react';
// スマートコントラクトの設計図（ABI）をインポート
import Web3Mint from '../../../utils/Web3Mint.json';

/**
 * 🎉 作成済みNFT表示コンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「NFT作成完了の祝福係」のような役割を果たします。
 * NFTの作成が成功した時に、作成されたNFTの詳細情報を表示し、
 * ユーザーが様々な方法でNFTを確認・共有できるリンクや機能を提供します。
 *
 * 【主な機能】
 * 1. NFT作成成功情報の表示 - コントラクトアドレス、トークンID、トランザクションハッシュ
 * 2. 外部リンクの提供 - Etherscan、Gemcase等での確認リンク
 * 3. メタデータ確認機能 - NFTのメタデータURIを取得・表示
 * 4. Etherscan検証機能 - 表示状況の簡易チェック
 * 5. 詳細調査機能 - 高度なデバッグ・診断ツール
 * 6. 使用方法の案内 - 初心者向けの操作説明
 *
 * 【表示される情報】
 * - コントラクトアドレス（NFTが保存されている場所）
 * - トークンID（NFTの識別番号）
 * - トランザクションハッシュ（ブロックチェーン上の記録ID）
 * - 各種確認リンク（Etherscan、Gemcase等）
 * - 注意事項とヒント
 *
 * 【初心者向け解説】
 * - コントラクトアドレス = NFTが保存されているブロックチェーン上の住所
 * - トークンID = NFTの個別識別番号（同じコントラクト内でユニーク）
 * - トランザクションハッシュ = ブロックチェーン上の取引記録ID
 * - メタデータ = NFTの詳細情報（名前、説明、画像URLなど）
 *
 * @param {object} mintedNftInfo - 作成されたNFTの詳細情報
 * @param {function} onClose - ダイアログを閉じる関数
 */
const MintedNftDisplay = ({
  mintedNftInfo,
  onClose
}) => {

  // 📊 検証処理中の状態管理
  const [validating, setValidating] = useState(false);

  // 📄 メタデータ確認機能
  // NFTのメタデータURI（詳細情報の保存場所）を取得して表示
  const handleMetadataCheck = useCallback(async () => {
    // 📋 事前チェック：NFT情報が存在するか確認
    if (!mintedNftInfo) return;

    try {
      // 🔗 Ethereumプロバイダーとコントラクトインスタンスを作成
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(
        mintedNftInfo.contractAddress,  // NFTコントラクトのアドレス
        Web3Mint.abi,                  // コントラクトとの通信方法
        provider                       // ネットワーク接続
      );

      // 📡 ブロックチェーンからメタデータURIを取得
      const tokenURI = await contract.tokenURI(mintedNftInfo.tokenId);

      // 🖥️ コンソールに詳細情報を出力（開発者向け）
      console.log(`\n📄 Token ${mintedNftInfo.tokenId} Metadata URI:`);
      console.log(tokenURI);

      // 💬 ユーザーにメタデータURIを表示
      alert(`メタデータURI:\n${tokenURI}\n\n詳細はコンソールを確認してください。`);
    } catch (error) {
      // ❌ エラーハンドリング
      console.error('メタデータ取得エラー:', error);
      alert('メタデータの取得に失敗しました');
    }
  }, [mintedNftInfo]);

  // Etherscan検証（簡易版）
  const handleEtherscanValidation = useCallback(async () => {
    if (!mintedNftInfo) return;

    setValidating(true);
    try {
      // 簡易的な検証メッセージを表示
      const message = [
        '🎯 Etherscan表示検証',
        '',
        `Token ID: ${mintedNftInfo.tokenId}`,
        `Contract: ${mintedNftInfo.contractAddress}`,
        '',
        '💡 ヒント:',
        '・IPFS伝播には数分～数時間かかる場合があります',
        '・画像が表示されない場合は時間をおいて再確認してください',
        '・メインネットでは安定した表示が期待できます',
        '',
        '詳細はコンソールを確認してください。'
      ].join('\n');

      alert(message);

    } catch (error) {
      console.error('Etherscan検証エラー:', error);
      alert(`検証中にエラーが発生しました: ${error.message}`);
    } finally {
      setValidating(false);
    }
  }, [mintedNftInfo]);

  // 詳細調査
  const handleDetailedInvestigation = useCallback(async () => {
    if (!mintedNftInfo) return;

    console.log('🔍 詳細調査を開始します...');
    console.log('==========================================');
    console.log('🔧 環境変数確認:');
    console.log('  REACT_APP_W3UP_EMAIL:', !!process.env.REACT_APP_W3UP_EMAIL);
    console.log('  NODE_ENV:', process.env.NODE_ENV);

    try {
      // 動的インポートで調査ツールを読み込み
      const { investigateEtherscanDisplay } = await import('../../../utils/etherscanDebugger');

      const result = await investigateEtherscanDisplay(
        mintedNftInfo.contractAddress,
        mintedNftInfo.tokenId
      );

      console.log('📊 調査結果:', result);

      // 画像URLの詳細確認
      if (result.steps && result.steps.length > 1) {
        const metadataStep = result.steps.find(s => s.step === 2);
        if (metadataStep && metadataStep.metadata) {
          console.log('🖼️ 画像URL詳細分析:');
          console.log('  画像URL:', metadataStep.metadata.image);
          console.log('  HTTPS形式:', metadataStep.metadata.image?.startsWith('https://'));
          console.log('  IPFS形式:', metadataStep.metadata.image?.startsWith('ipfs://'));
        }
      }

      // 結果をユーザーに表示
      const summary = result.analysis ? [
        '🔍 詳細調査完了',
        '',
        `📊 Etherscan表示確率: ${result.analysis.etherscanDisplayProbability}%`,
        `📈 総合ステータス: ${result.analysis.overallStatus}`,
        '',
        '🔧 推奨事項:',
        ...result.analysis.recommendations.map(r => `  • ${r}`),
        '',
        '詳細はコンソールを確認してください。'
      ].join('\n') : '調査中にエラーが発生しました。コンソールを確認してください。';

      alert(summary);

    } catch (error) {
      console.error('❌ 詳細調査エラー:', error);
      alert(`詳細調査中にエラーが発生しました: ${error.message}`);
    }
  }, [mintedNftInfo]);

  if (!mintedNftInfo) {
    return null;
  }

  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "#e8f5e8",
      borderRadius: "8px",
      border: "1px solid #4caf50"
    }}>
      {/* タイトル */}
      <h3 style={{
        margin: "0 0 15px 0",
        color: "#2e7d32",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        🎉 NFT作成成功！
      </h3>

      {/* コントラクトアドレス */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          📋 Contract Address:
        </div>
        <div style={{
          fontFamily: "monospace",
          fontSize: "0.9em",
          backgroundColor: "#f5f5f5",
          padding: "8px",
          borderRadius: "4px",
          wordBreak: "break-all",
          border: "1px solid #ddd"
        }}>
          {mintedNftInfo.contractAddress}
        </div>
      </div>

      {/* トークンIDとトランザクション */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>🏷️ Token ID:</strong> {mintedNftInfo.tokenId}
        </div>
        <div style={{ marginBottom: "5px" }}>
          <strong>📄 Transaction:</strong>
        </div>
        <div style={{
          fontFamily: "monospace",
          fontSize: "0.8em",
          backgroundColor: "#f5f5f5",
          padding: "8px",
          borderRadius: "4px",
          wordBreak: "break-all",
          border: "1px solid #ddd"
        }}>
          {mintedNftInfo.txHash}
        </div>
      </div>

      {/* 確認リンク */}
      <div style={{ marginTop: "20px" }}>
        <h4 style={{ margin: "0 0 10px 0" }}>🔗 確認リンク</h4>

        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap"
        }}>
          <a
            href={`https://${mintedNftInfo.networkName}.etherscan.io/tx/${mintedNftInfo.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#1976d2",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.9em"
            }}
          >
            🔍 Etherscanで確認
          </a>

          <a
            href="https://gemcase.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#9c27b0",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.9em"
            }}
          >
            🖼️ Gemcaseで確認
          </a>
        </div>

        {/* 操作ボタン */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap"
        }}>
          <Button
            onClick={handleEtherscanValidation}
            disabled={validating}
            size="small"
            style={{
              backgroundColor: validating ? "#ccc" : "#ff9800",
              color: "white",
              fontWeight: "bold"
            }}
          >
            🎯 Etherscan表示検証
          </Button>

          <Button
            onClick={handleMetadataCheck}
            size="small"
            style={{
              backgroundColor: "#2196f3",
              color: "white"
            }}
          >
            📄 メタデータURI確認
          </Button>

          <Button
            onClick={handleDetailedInvestigation}
            size="small"
            style={{
              backgroundColor: "#e91e63",
              color: "white"
            }}
          >
            🔍 詳細調査
          </Button>
        </div>
      </div>

      {/* 使用方法の説明 */}
      <div style={{
        fontSize: "0.9em",
        color: "#666",
        backgroundColor: "#f9f9f9",
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "15px"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          📱 Gemcaseでの確認手順:
        </div>
        <div style={{ fontSize: "0.8em", lineHeight: "1.4" }}>
          1. 上記リンクでGemcaseを開く<br />
          2. Addressフィールドに Contract Address を入力<br />
          3. Token IDフィールドに {mintedNftInfo.tokenId} を入力
        </div>
      </div>

      {/* 注意事項 */}
      <div style={{
        fontSize: "0.8em",
        color: "#666",
        backgroundColor: "#f9f9f9",
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "15px"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
          💡 表示について:
        </div>
        <div style={{ lineHeight: "1.4" }}>
          ・IPFS伝播には数分～数時間かかる場合があります<br />
          ・画像が表示されない場合は時間をおいて再確認してください<br />
          ・メインネットでは安定した表示が期待できます
        </div>
      </div>

      {/* 閉じるボタン */}
      <Button
        onClick={onClose}
        variant="outlined"
        size="small"
        style={{
          borderColor: "#ccc",
          color: "#666"
        }}
      >
        閉じる
      </Button>
    </div>
  );
};

export default MintedNftDisplay;
