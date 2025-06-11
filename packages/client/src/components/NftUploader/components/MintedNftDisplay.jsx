import { Button } from '@mui/material';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import Web3Mint from '../../../utils/Web3Mint.json';

/**
 * 作成済みNFT表示コンポーネント
 * 責務：
 * - NFT作成成功情報の表示
 * - 外部リンクの提供
 * - メタデータ確認機能
 * - Etherscan検証機能
 */
const MintedNftDisplay = ({
  mintedNftInfo,
  onClose
}) => {
  const [validating, setValidating] = useState(false);

  // メタデータ確認
  const handleMetadataCheck = useCallback(async () => {
    if (!mintedNftInfo) return;

    try {
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(
        mintedNftInfo.contractAddress,
        Web3Mint.abi,
        provider
      );

      const tokenURI = await contract.tokenURI(mintedNftInfo.tokenId);
      console.log(`\n📄 Token ${mintedNftInfo.tokenId} Metadata URI:`);
      console.log(tokenURI);

      alert(`メタデータURI:\n${tokenURI}\n\n詳細はコンソールを確認してください。`);
    } catch (error) {
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
