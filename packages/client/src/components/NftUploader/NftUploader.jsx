// Reactの機能をインポート（useCallbackは関数を最適化するために使用）
import { useCallback } from 'react';

// 自作のカスタムフック（独自に作った便利な機能）をインポート
import useContract from '../../hooks/useContract'; // スマートコントラクトとの通信を管理
import useWallet from '../../hooks/useWallet'; // MetaMaskウォレットとの接続を管理
import { isPinataAvailable } from '../../utils/ipfsService'; // IPFS（分散ストレージ）の利用可能性をチェック

// UIコンポーネント（画面の見た目を担当）をインポート
import NftUploaderLayout from './components/NftUploaderLayout';

// ファイルアップロードとNFTミント（作成）の機能をインポート
import useFileUpload from './hooks/useFileUpload'; // ファイルのアップロード処理を管理
import useNftMinting from './hooks/useNftMinting'; // NFTの作成処理を管理

// CSSスタイルファイルをインポート（見た目の装飾）
import './NftUploader.css';

/**
 * 🎨 NFTアップローダーのメインコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「指揮者」のような役割を果たします。
 * オーケストラの指揮者が各楽器をまとめて美しい音楽を作るように、
 * このコンポーネントは様々な機能（ウォレット接続、ファイルアップロード、NFT作成など）を
 * まとめて、ユーザーが簡単にNFTを作れるアプリケーションを作ります。
 *
 * 【主な責務（やること）】
 * 1. 全体の状態管理 - アプリ全体の「今の状況」を把握・管理
 * 2. カスタムフックの統合 - 各機能を連携させる
 * 3. イベントハンドリング - ユーザーの操作（クリック、ファイル選択など）に対応
 *
 * 【初心者向け解説】
 * - コンポーネント = 画面の部品（ボタン、入力欄、表示エリアなど）
 * - フック = Reactの便利な機能（状態管理や副作用処理など）
 * - 状態 = アプリの「今の状況」（ログイン中、ファイル選択中、アップロード中など）
 */
const NftUploader = () => {

  // 🔐 ウォレット関連の機能を取得
  // useWallet()は、MetaMaskとの接続や管理を行うカスタムフック
  const {
    currentAccount,      // 現在接続されているウォレットのアドレス
    isConnecting,        // ウォレットに接続中かどうかの状態
    error: walletError,  // ウォレット関連のエラーメッセージ
    networkError,        // ネットワーク（Ethereum、Sepoliaなど）関連のエラー
    connectWallet,       // ウォレットに接続する関数
    switchToSepolia,     // Sepoliaテストネットに切り替える関数
    setError: setWalletError,  // ウォレットエラーを設定する関数
    isPending: walletPending   // ウォレット処理が進行中かどうか
  } = useWallet();

  // 📄 スマートコントラクト関連の機能を取得
  // useContract()は、ブロックチェーン上のスマートコントラクトとの通信を管理
  const {
    contractInfo,        // コントラクトの情報（価格、供給量など）
    loading: contractLoading,    // コントラクト情報を読み込み中かどうか
    error: contractError,        // コントラクト関連のエラーメッセージ
    refetchContractInfo,         // コントラクト情報を再取得する関数
    isPending: contractPending   // コントラクト処理が進行中かどうか
  } = useContract(currentAccount);

  // 📁 ファイルアップロード関連の機能を取得
  // useFileUpload()は、ユーザーが選択した画像ファイルの管理を行う
  const {
    selectedFile,        // ユーザーが選択した画像ファイル
    error: fileError,    // ファイル関連のエラーメッセージ
    handleFileSelect,    // ファイル選択時の処理関数
    handleDragOver,      // ファイルをドラッグしている時の処理関数
    handleDrop,          // ファイルをドロップした時の処理関数
    clearFile           // 選択したファイルをクリアする関数
  } = useFileUpload();

  // 🎨 NFTミント（作成）関連の機能を取得
  // useNftMinting()は、実際にNFTを作成する処理を管理
  const {
    uploading,           // NFT作成処理中かどうかの状態
    loadingStep,         // 現在の処理ステップ（「アップロード中」「ミント中」など）
    loadingProgress,     // 処理の進捗状況（0-100%）
    mintedNftInfo,       // 作成完了したNFTの情報
    error: mintError,    // NFT作成時のエラーメッセージ
    success,             // 成功メッセージ
    isPending: mintPending,      // NFT作成処理が進行中かどうか
    mintNFT,             // NFTを作成する関数
    clearMintedInfo,     // 作成済みNFT情報をクリアする関数
    clearError: clearMintError   // NFT作成エラーをクリアする関数
  } = useNftMinting();

  // 🌐 IPFS（分散ストレージ）の利用状況をチェック
  // IPFSは画像ファイルを分散型ネットワークに保存するサービス
  // true = 実際のIPFSサービス（Pinata）を使用、false = テスト用のモック使用
  const isUsingRealIPFS = isPinataAvailable();

  // ⏳ 全体の処理状況を統合
  // いずれかの処理が進行中の場合、全体として「処理中」とみなす
  // || は「または」の意味（どれか一つでもtrueなら全体がtrue）
  const isPending = walletPending || contractPending || mintPending;

  // 🎯 NFTミント（作成）ボタンがクリックされた時の処理
  // useCallbackは関数を最適化して、不要な再レンダリングを防ぐReactの機能
  const handleMintClick = useCallback(async () => {
    // 📋 事前チェック：ファイルが選択されていて、ウォレットが接続されているか確認
    if (!selectedFile || !currentAccount) return;

    try {
      // 🧹 エラーメッセージをクリア（前回のエラーを消去）
      clearMintError();      // NFT作成関連のエラーをクリア
      setWalletError('');    // ウォレット関連のエラーをクリア

      // 🎨 実際にNFTを作成する処理を実行
      // mintNFT関数は以下の処理を順番に行います：
      // 1. 画像ファイルをIPFS（分散ストレージ）にアップロード
      // 2. スマートコントラクトを呼び出してNFTを作成
      // 3. ブロックチェーンに記録されるまで待機
      await mintNFT(selectedFile, currentAccount);

      // ✅ 成功時：選択したファイルをクリアして次の作業に備える
      clearFile();
    } catch (error) {
      // ❌ エラーが発生した場合の処理
      console.error('ミント処理エラー:', error);
      // 注意：エラーの詳細な処理はuseNftMintingフック内で行われます
      // ここではエラーをログに記録するだけです
    }
  }, [selectedFile, currentAccount, mintNFT, clearFile, clearMintError, setWalletError]);
  // 依存配列：これらの値が変更された時のみ、この関数を再作成します

  // 🗂️ 作成済みNFT情報ダイアログを閉じる処理
  // ユーザーがNFT作成完了の通知を閉じたい時に呼ばれます
  const handleCloseMintedInfo = useCallback(() => {
    clearMintedInfo(); // 作成済みNFTの情報をクリアして、ダイアログを非表示にする
  }, [clearMintedInfo]);

  // 🎨 実際の画面を表示する部分
  // NftUploaderLayoutコンポーネントに必要な情報を渡して画面を構築
  //
  // 【渡している情報の説明】
  // 🔐 ウォレット関連：現在のアカウント、接続状態、接続関数など
  // 🌐 ネットワーク関連：エラーメッセージ、成功メッセージ、ネットワーク切り替え関数など
  // 📁 ファイル関連：選択されたファイル、エラー、ドラッグ&ドロップ処理関数など
  // 🎨 NFTミント関連：アップロード状態、進捗、作成済みNFT情報、ミント実行関数など
  // 📄 コントラクト関連：コントラクト情報、読み込み状態、エラー、更新関数など
  // 🌐 IPFS関連：実際のIPFSサービス使用状況など
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

// このコンポーネントを他のファイルから使用できるようにエクスポート
export default NftUploader;
