import { useCallback } from 'react';
import useContract from '../../hooks/useContract';
import useWallet from '../../hooks/useWallet';
import { isPinataAvailable } from '../../utils/ipfsService';
import NftUploaderLayout from './components/NftUploaderLayout';
import useFileUpload from './hooks/useFileUpload';
import useNftMinting from './hooks/useNftMinting';
import './NftUploader.css';

/**
 * NFTアップローダーメインコンテナ
 * 責務：
 * - 全体の状態管理
 * - カスタムフックの統合
 * - イベントハンドリング
 */
const NftUploader = () => {
  // カスタムフック
  const {
    currentAccount,
    isConnecting,
    error: walletError,
    networkError,
    connectWallet,
    switchToSepolia,
    setError: setWalletError,
    isPending: walletPending
  } = useWallet();

  const {
    contractInfo,
    loading: contractLoading,
    error: contractError,
    refetchContractInfo,
    isPending: contractPending
  } = useContract(currentAccount);

  const {
    selectedFile,
    error: fileError,
    handleFileSelect,
    handleDragOver,
    handleDrop,
    clearFile
  } = useFileUpload();

  const {
    uploading,
    loadingStep,
    loadingProgress,
    mintedNftInfo,
    error: mintError,
    success,
    isPending: mintPending,
    mintNFT,
    clearMintedInfo,
    clearError: clearMintError
  } = useNftMinting();

  // IPFS状態
  const isUsingRealIPFS = isPinataAvailable();

  // 統合されたpending状態
  const isPending = walletPending || contractPending || mintPending;

  // NFTミント処理
  const handleMintClick = useCallback(async () => {
    if (!selectedFile || !currentAccount) return;

    try {
      clearMintError();
      setWalletError('');

      await mintNFT(selectedFile, currentAccount);
      clearFile(); // 成功時にファイルをクリア
    } catch (error) {
      console.error('ミント処理エラー:', error);
      // エラーはuseNftMintingで処理される
    }
  }, [selectedFile, currentAccount, mintNFT, clearFile, clearMintError, setWalletError]);

  // 作成済みNFT情報を閉じる
  const handleCloseMintedInfo = useCallback(() => {
    clearMintedInfo();
  }, [clearMintedInfo]);

  return (
    <NftUploaderLayout
      // ウォレット関連
      currentAccount={currentAccount}
      isConnecting={isConnecting}
      connectWallet={connectWallet}
      isPending={isPending}

      // ネットワーク関連
      networkError={networkError}
      walletError={walletError || mintError}
      success={success}
      switchToSepolia={switchToSepolia}

      // ファイルアップロード関連
      selectedFile={selectedFile}
      fileError={fileError}
      onFileSelect={handleFileSelect}
      onDragOver={handleDragOver}
      onDrop={handleDrop}

      // ミント関連
      uploading={uploading}
      loadingStep={loadingStep}
      loadingProgress={loadingProgress}
      mintedNftInfo={mintedNftInfo}
      onMintClick={handleMintClick}
      onCloseMintedInfo={handleCloseMintedInfo}

      // コントラクト関連
      contractInfo={contractInfo}
      contractLoading={contractLoading}
      contractError={contractError}
      onRefreshContract={refetchContractInfo}

      // IPFS関連
      isUsingRealIPFS={isUsingRealIPFS}
    />
  );
};

export default NftUploader;
