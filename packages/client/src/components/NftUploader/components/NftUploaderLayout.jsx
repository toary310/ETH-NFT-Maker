// 各種コンポーネントをインポート
import MarketplaceButtons from '../../GemcaseButton/GemcaseButton'; // NFTマーケットプレイスボタン群
import ContractStatus from './ContractStatus'; // スマートコントラクト状態表示
import FileUpload from './FileUpload'; // ファイルアップロード機能
import IpfsStatus from './IpfsStatus'; // IPFS接続状態表示
import LoadingOverlay from './LoadingOverlay'; // ローディング画面オーバーレイ
import MintedNftDisplay from './MintedNftDisplay'; // 作成済みNFT表示
import NetworkAlert from './NetworkAlert'; // ネットワーク関連アラート
import WalletConnection from './WalletConnection'; // ウォレット接続機能

/**
 * 🎨 NFTアップローダーレイアウトコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「舞台監督」のような役割を果たします。
 * NFTアプリケーションの全ての要素（ウォレット接続、ファイルアップロード、
 * NFT作成、状態表示など）を適切な順序と位置に配置し、
 * ユーザーが迷わずにNFTを作成できる流れを作ります。
 *
 * 【主な責務（やること）】
 * 1. 全体のレイアウト構成 - 各要素の配置と順序を決定
 * 2. 各コンポーネントの配置 - 適切な場所に適切な機能を配置
 * 3. 条件付きレンダリング - 状況に応じて表示/非表示を制御
 * 4. プロップスの橋渡し - 親から受け取った情報を子コンポーネントに配布
 *
 * 【レイアウトの流れ】
 * 1. タイトル表示
 * 2. ウォレット接続（最初に必要）
 * 3. ネットワーク状態確認
 * 4. ファイルアップロード（ウォレット接続後）
 * 5. NFT作成結果表示
 * 6. 各種状態表示（IPFS、コントラクト等）
 * 7. マーケットプレイスリンク
 * 8. ローディング表示（必要時）
 *
 * 【初心者向け解説】
 * - レイアウトコンポーネント = 画面全体の構成を決める設計図
 * - 条件付きレンダリング = 状況に応じて表示内容を変える仕組み
 * - プロップス = 親コンポーネントから子コンポーネントに渡すデータ
 *
 * @param {string} currentAccount - 現在接続中のウォレットアドレス
 * @param {boolean} isConnecting - ウォレット接続処理中かどうか
 * @param {function} connectWallet - ウォレット接続関数
 * @param {boolean} isPending - 何らかの処理が進行中かどうか
 * @param {string} networkError - ネットワーク関連エラー
 * @param {string} walletError - ウォレット関連エラー
 * @param {string} success - 成功メッセージ
 * @param {function} switchToSepolia - Sepoliaネットワーク切り替え関数
 * @param {File} selectedFile - 選択されたファイル
 * @param {string} fileError - ファイル関連エラー
 * @param {function} onFileSelect - ファイル選択処理関数
 * @param {function} onDragOver - ドラッグオーバー処理関数
 * @param {function} onDrop - ドロップ処理関数
 * @param {boolean} uploading - アップロード中かどうか
 * @param {string} loadingStep - 現在の処理ステップ
 * @param {number} loadingProgress - 処理進捗（0-100）
 * @param {object} mintedNftInfo - 作成済みNFT情報
 * @param {function} onMintClick - NFT作成ボタンクリック処理
 * @param {function} onCloseMintedInfo - NFT情報ダイアログクローズ処理
 * @param {object} contractInfo - コントラクト情報
 * @param {boolean} contractLoading - コントラクト情報読み込み中かどうか
 * @param {string} contractError - コントラクト関連エラー
 * @param {function} onRefreshContract - コントラクト情報更新関数
 * @param {boolean} isUsingRealIPFS - 実際のIPFSサービス使用中かどうか
 */
const NftUploaderLayout = ({
  // 🔐 ウォレット関連のプロップス
  currentAccount,
  isConnecting,
  connectWallet,
  isPending,

  // 🌐 ネットワーク関連のプロップス
  networkError,
  walletError,
  success,
  switchToSepolia,

  // 📁 ファイルアップロード関連のプロップス
  selectedFile,
  fileError,
  onFileSelect,
  onDragOver,
  onDrop,

  // 🎨 NFTミント関連のプロップス
  uploading,
  loadingStep,
  loadingProgress,
  mintedNftInfo,
  onMintClick,
  onCloseMintedInfo,

  // 📄 スマートコントラクト関連のプロップス
  contractInfo,
  contractLoading,
  contractError,
  onRefreshContract,

  // 🌐 IPFS関連のプロップス
  isUsingRealIPFS
}) => {
  // 🎨 実際の画面レイアウトを構築
  return (
    <div className="outerBox">
      {/* 🏷️ アプリケーションタイトル */}
      <div className="title">
        <h2>NFTアップローダー</h2>
      </div>

      {/* 🔐 ステップ1：ウォレット接続（最初に必要な操作） */}
      <WalletConnection
        currentAccount={currentAccount}
        isConnecting={isConnecting}
        connectWallet={connectWallet}
        isPending={isPending}
      />

      {/* ⚠️ ネットワーク・エラーアラート（問題がある場合に表示） */}
      <NetworkAlert
        networkError={networkError}
        walletError={walletError}
        success={success}
        switchToSepolia={switchToSepolia}
      />

      {/* 📁 ステップ2：ファイルアップロード（ウォレット接続後のみ表示） */}
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

      {/* 🎉 ステップ3：作成済みNFT表示（NFT作成完了時に表示） */}
      <MintedNftDisplay
        mintedNftInfo={mintedNftInfo}
        onClose={onCloseMintedInfo}
      />

      {/* 🌐 IPFS接続状態表示（技術的な情報） */}
      <IpfsStatus isUsingRealIPFS={isUsingRealIPFS} />

      {/* 🎨 NFTマーケットプレイスボタン（ウォレット接続後のみ表示） */}
      {/* 作成したNFTを各種マーケットプレイスで確認できるリンク */}
      {currentAccount && (
        <MarketplaceButtons
          contractAddress={process.env.REACT_APP_CONTRACT_ADDRESS}
          networkName={process.env.REACT_APP_NETWORK_NAME}
          sx={{ margin: '20px 0' }}
        />
      )}

      {/* 📄 スマートコントラクト情報（ウォレット接続後のみ表示） */}
      {/* コントラクトの詳細情報（価格、発行数など）を表示 */}
      {currentAccount && (
        <ContractStatus
          contractInfo={contractInfo}
          loading={contractLoading}
          error={contractError}
          onRefresh={onRefreshContract}
        />
      )}

      {/* ⏳ ローディングオーバーレイ（処理中に画面全体を覆う） */}
      {/* NFT作成中やアップロード中に表示される進捗画面 */}
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
