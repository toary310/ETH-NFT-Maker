import React from 'react';
import WalletConnection from './WalletConnection';
import NetworkAlert from './NetworkAlert';
import FileUpload from './FileUpload';
import LoadingOverlay from './LoadingOverlay';
import MintedNftDisplay from './MintedNftDisplay';
import IpfsStatus from './IpfsStatus';
import ContractStatus from './ContractStatus';

/**
 * NFTアップローダーレイアウトコンポーネント
 * 責務：
 * - 全体のレイアウト構成
 * - 各コンポーネントの配置
 * - 条件付きレンダリング
 */
const NftUploaderLayout = ({
  // ウォレット関連
  currentAccount,
  isConnecting,
  connectWallet,
  isPending,

  // ネットワーク関連
  networkError,
  walletError,
  success,
  switchToSepolia,

  // ファイルアップロード関連
  selectedFile,
  fileError,
  onFileSelect,
  onDragOver,
  onDrop,

  // ミント関連
  uploading,
  loadingStep,
  loadingProgress,
  mintedNftInfo,
  onMintClick,
  onCloseMintedInfo,

  // コントラクト関連
  contractInfo,
  contractLoading,
  contractError,
  onRefreshContract,

  // IPFS関連
  isUsingRealIPFS
}) => {
  return (
    <div className="outerBox">
      {/* タイトル */}
      <div className="title">
        <h2>NFTアップローダー</h2>
      </div>

      {/* ウォレット接続 */}
      <WalletConnection
        currentAccount={currentAccount}
        isConnecting={isConnecting}
        connectWallet={connectWallet}
        isPending={isPending}
      />

      {/* ネットワーク・エラーアラート */}
      <NetworkAlert
        networkError={networkError}
        walletError={walletError}
        success={success}
        switchToSepolia={switchToSepolia}
      />

      {/* ファイルアップロード（ウォレット接続時のみ） */}
      {currentAccount && (
        <FileUpload
          selectedFile={selectedFile}
          error={fileError}
          uploading={uploading}
          isPending={isPending}
          onFileSelect={onFileSelect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMintClick={onMintClick}
          currentAccount={currentAccount}
          networkError={networkError}
        />
      )}

      {/* 作成済みNFT表示 */}
      <MintedNftDisplay
        mintedNftInfo={mintedNftInfo}
        onClose={onCloseMintedInfo}
      />

      {/* IPFSサービス状態 */}
      <IpfsStatus isUsingRealIPFS={isUsingRealIPFS} />

      {/* コントラクト情報（ウォレット接続時のみ） */}
      {currentAccount && (
        <ContractStatus
          contractInfo={contractInfo}
          loading={contractLoading}
          error={contractError}
          onRefresh={onRefreshContract}
        />
      )}

      {/* ローディングオーバーレイ */}
      <LoadingOverlay
        uploading={uploading}
        isPending={isPending}
        loadingStep={loadingStep}
        loadingProgress={loadingProgress}
      />
    </div>
  );
};

export default NftUploaderLayout;
