// 必要なライブラリをインポート
import { ethers } from 'ethers'; // Ethereumブロックチェーンとの通信ライブラリ
import { useCallback, useState, useTransition } from 'react'; // Reactの機能（フック）
import Web3Mint from '../../../utils/Web3Mint.json'; // スマートコントラクトの設計図（ABI）
import { getIPFSUploader } from '../../../utils/ipfsService'; // IPFS（分散ストレージ）サービス

/**
 * 🎨 NFTミント（作成）処理用カスタムフック
 *
 * 【このフックの役割】
 * このフックは「NFT工場の管理者」のような役割を果たします。
 * ユーザーが画像ファイルを持ってきたら、以下の工程を順番に管理します：
 * 1. 画像をIPFS（分散ストレージ）にアップロード
 * 2. スマートコントラクトを呼び出してNFTを作成
 * 3. ブロックチェーンに記録されるまで待機
 * 4. 完成したNFTの情報を整理して返却
 *
 * 【主な責務（やること）】
 * - NFTミント処理の全体管理 - 工程の進行管理
 * - 進捗状態の管理 - 「今何をしているか」をユーザーに表示
 * - エラーハンドリング - 問題が起きた時の対処
 *
 * 【初心者向け解説】
 * - ミント = NFTを新しく作成すること（鋳造という意味）
 * - フック = Reactで状態や処理を管理する仕組み
 * - IPFS = 分散型のファイル保存システム（画像データを保存）
 * - スマートコントラクト = ブロックチェーン上で動くプログラム
 */
const useNftMinting = () => {

  // 🔄 React 18の新機能：useTransition
  // 重い処理を行う時に、UIの応答性を保つための機能
  // isPending = 処理中かどうかの状態、startTransition = 処理を開始する関数
  const [isPending, startTransition] = useTransition();

  // 📊 状態管理：アプリの「今の状況」を記録する変数たち
  const [uploading, setUploading] = useState(false);           // アップロード中かどうか
  const [loadingStep, setLoadingStep] = useState('');          // 現在の処理ステップ（「アップロード中」など）
  const [loadingProgress, setLoadingProgress] = useState(0);   // 進捗パーセンテージ（0-100）
  const [mintedNftInfo, setMintedNftInfo] = useState(null);    // 作成完了したNFTの詳細情報
  const [error, setError] = useState('');                      // エラーメッセージ
  const [success, setSuccess] = useState('');                  // 成功メッセージ

  // 🏠 コントラクトアドレスとネットワーク設定
  // 環境変数から取得、設定されていない場合はデフォルト値を使用
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ||
    '0x590D13672DDB149A4602989A7B3B7D35a082B433';  // Sepoliaテストネットのコントラクトアドレス
  const NETWORK_NAME = process.env.REACT_APP_NETWORK_NAME || 'sepolia';  // ネットワーク名

  // 📈 進捗更新関数
  // ユーザーに「今何をしているか」を表示するための関数
  // useCallbackで最適化（不要な再作成を防ぐ）
  const updateProgress = useCallback((step, progress) => {
    setLoadingStep(step);      // 現在のステップを更新（例：「アップロード中...」）
    setLoadingProgress(progress);  // 進捗パーセンテージを更新（例：50）
  }, []);

  // 🎨 メインのNFTミント（作成）処理関数
  // この関数は「NFT工場の全工程」を管理する重要な関数です
  const mintNFT = useCallback(async (file, currentAccount) => {

    // 📋 事前チェック：必要な材料が揃っているか確認
    if (!file || !currentAccount) {
      throw new Error('ファイルまたはアカウントが指定されていません');
    }

    try {
      // 🏁 処理開始：状態をリセットして準備
      setUploading(true);        // アップロード中フラグをON
      setError('');              // 前回のエラーメッセージをクリア
      setSuccess('');            // 前回の成功メッセージをクリア
      updateProgress('ミント処理を開始しています...', 0);  // 進捗0%でスタート

      // 🌐 ステップ1：IPFSアップロード
      // IPFSは分散型のファイル保存システム。画像ファイルをここに保存します
      updateProgress('IPFSに画像をアップロード中...', 20);  // 進捗20%
      const ipfsUploader = getIPFSUploader();  // IPFSアップローダーを取得

      // ファイル名から拡張子を除去（例：「cat.jpg」→「cat」）
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // 実際にIPFSにファイルをアップロード
      // uploadNFTDataは画像ファイル、名前、説明を受け取ってIPFS URIを返します
      const metadataURI = await ipfsUploader.uploadNFTData(
        file,                                      // アップロードする画像ファイル
        fileName,                                  // NFTの名前
        `${fileName} - Created with NFT Maker`     // NFTの説明文
      );

      updateProgress('スマートコントラクトを呼び出し中...', 60);  // 進捗60%

      // 🔗 ステップ2：スマートコントラクトとの接続準備
      // MetaMaskを通じてブロックチェーンに接続します
      const { ethereum } = window;  // ブラウザのMetaMask拡張機能を取得
      if (!ethereum) {
        throw new Error('MetaMaskが見つかりません');
      }

      // Ethereumネットワークへの接続を確立
      const provider = new ethers.BrowserProvider(ethereum);  // ネットワークへの接続
      const signer = await provider.getSigner();              // トランザクション署名者（ユーザー）
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Web3Mint.abi, signer);  // コントラクトインスタンス

      // 📊 ステップ3：コントラクトの現在状態を詳細確認
      // NFTを作成する前に、コントラクトが正常に動作しているかチェック
      const mintingEnabled = await contract.mintingEnabled();    // ミント機能が有効か
      const mintPrice = await contract.mintPrice();              // ミント価格（ETH）
      const currentSupply = await contract.totalSupply();        // 現在の発行済みNFT数
      const maxSupply = await contract.MAX_SUPPLY();             // 最大発行可能数
      const currentTokenId = await contract.getCurrentTokenId(); // 次に発行されるトークンID
      const contractBalance = await contract.getContractBalance(); // コントラクトの残高

      // 🖥️ デバッグ情報をコンソールに出力（開発者が状況を把握するため）
      console.log('📊 コントラクト状態詳細確認:');
      console.log('  ミント機能:', mintingEnabled ? '有効' : '無効');
      console.log('  ミント価格:', ethers.formatEther(mintPrice), 'ETH');
      console.log('  現在の発行数:', currentSupply.toString());
      console.log('  最大発行数:', maxSupply.toString());
      console.log('  次のトークンID:', currentTokenId.toString());
      console.log('  コントラクト残高:', ethers.formatEther(contractBalance), 'ETH');
      console.log('  送信ETH:', ethers.formatEther(mintPrice), 'ETH');
      console.log('  ユーザーアドレス:', currentAccount);

      // 🔍 ステップ4：ミント前の検証
      // NFTを作成する前に、条件が満たされているかチェック

      // ミント機能が有効かチェック
      if (!mintingEnabled) {
        throw new Error('ミント機能が無効になっています');
      }

      // 最大発行数に達していないかチェック
      if (currentTokenId > maxSupply) {
        throw new Error(`最大発行数に達しています (${currentTokenId} > ${maxSupply})`);
      }

      // 💰 ユーザーのETH残高確認
      const userBalance = await provider.getBalance(currentAccount);
      console.log('  ユーザー残高:', ethers.formatEther(userBalance), 'ETH');

      // 残高が足りているかチェック
      if (userBalance < mintPrice) {
        throw new Error('ETH残高が不足しています');
      }

      updateProgress('トランザクションを送信中...', 80);

      // NFTをミント
      // mintIpfsNFT(name, description, ipfsHash) - ipfsHashはハッシュ部分のみ
      console.log('🚀 ミント実行中...');
      console.log('  名前:', fileName);
      console.log('  説明:', `${fileName} - Created with NFT Maker`);
      console.log('  メタデータURI:', metadataURI);
      console.log('  送信ETH:', ethers.formatEther(mintPrice));

      // IPFSハッシュを抽出（ipfs://プレフィックスを除去）
      const ipfsHash = metadataURI.replace('ipfs://', '');
      console.log('  IPFSハッシュ:', ipfsHash);

      // パラメータ検証
      console.log('🔍 パラメータ検証:');
      console.log('  名前の長さ:', fileName.length, '文字');
      console.log('  説明の長さ:', `${fileName} - Created with NFT Maker`.length, '文字');
      console.log('  IPFSハッシュの長さ:', ipfsHash.length, '文字');
      console.log('  IPFSハッシュが空:', ipfsHash.length === 0);

      // 空文字チェック
      if (fileName.length === 0) {
        throw new Error('NFT名が空です');
      }

      if (ipfsHash.length === 0) {
        throw new Error('IPFSハッシュが空です');
      }

      // ガス見積もりでエラーを事前検出
      console.log('⛽ ガス見積もり実行中...');
      let estimatedGas;
      try {
        estimatedGas = await contract.mintIpfsNFTWithMetadata.estimateGas(
          fileName,
          `${fileName} - Created with NFT Maker`,
          ipfsHash,
          metadataURI,
          { value: mintPrice }
        );
        console.log('✅ ガス見積もり成功:', estimatedGas.toString());
      } catch (gasError) {
        console.error('❌ ガス見積もりエラー:', gasError);

        // ガス見積もりエラーから詳細な原因を特定
        if (gasError.reason) {
          throw new Error(`コントラクトエラー: ${gasError.reason}`);
        } else if (gasError.message.includes('MintingDisabled')) {
          throw new Error('ミント機能が無効になっています');
        } else if (gasError.message.includes('MaxSupplyExceeded')) {
          throw new Error('最大発行数に達しています');
        } else if (gasError.message.includes('InsufficientPayment')) {
          throw new Error('支払い金額が不足しています');
        } else if (gasError.message.includes('EmptyName')) {
          throw new Error('NFT名が空です');
        } else if (gasError.message.includes('EmptyDescription')) {
          throw new Error('NFT説明が空です');
        } else if (gasError.message.includes('InvalidIPFSHash')) {
          throw new Error('IPFSハッシュが無効です');
        } else {
          throw new Error(`ガス見積もりエラー: ${gasError.message}`);
        }
      }

      // 推定ガスの1.2倍を安全なガス制限として設定
      const safeGasLimit = Math.ceil(Number(estimatedGas) * 1.2);
      console.log('⛽ 使用ガス制限:', safeGasLimit);

      let transaction;
      try {
        transaction = await contract.mintIpfsNFTWithMetadata(
          fileName,
          `${fileName} - Created with NFT Maker`,
          ipfsHash, // ハッシュ部分のみを渡す
          metadataURI, // メタデータURIを追加
          {
            value: mintPrice,
            gasLimit: safeGasLimit
          }
        );

        console.log('✅ トランザクション送信成功:', transaction.hash);
      } catch (txError) {
        console.error('❌ トランザクション送信エラー:', txError);

        // より詳細なエラー情報を取得
        if (txError.reason) {
          throw new Error(`コントラクトエラー: ${txError.reason}`);
        } else if (txError.code === 'CALL_EXCEPTION') {
          throw new Error('コントラクト実行エラー: 条件を満たしていない可能性があります');
        } else {
          throw txError;
        }
      }

      updateProgress('トランザクション確認中...', 90);

      const receipt = await transaction.wait();

      if (receipt.status === 0) {
        console.error('❌ トランザクション失敗:', receipt);
        throw new Error('トランザクションが失敗しました。コントラクトの条件を確認してください。');
      }

      console.log('✅ トランザクション完了:', receipt);

      // トークンIDをイベントログから取得
      let tokenId;
      try {
        // Transfer イベントからToken IDを取得
        const transferEvent = receipt.logs.find(log => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed.name === 'Transfer';
          } catch {
            return false;
          }
        });

        if (transferEvent) {
          const parsed = contract.interface.parseLog(transferEvent);
          tokenId = parsed.args.tokenId.toString();
          console.log('✅ イベントからToken ID取得:', tokenId);
        } else {
          // フォールバック: getCurrentTokenId() - 1
          const currentId = await contract.getCurrentTokenId();
          tokenId = (currentId - 1n).toString();
          console.log('⚠️ フォールバックでToken ID取得:', tokenId);
        }
      } catch (error) {
        console.error('❌ Token ID取得エラー:', error);
        // 最後の手段: getCurrentTokenId() - 1
        const currentId = await contract.getCurrentTokenId();
        tokenId = (currentId - 1n).toString();
        console.log('🔄 最終手段でToken ID取得:', tokenId);
      }

      // Token IDの存在確認
      try {
        const owner = await contract.ownerOf(tokenId);
        console.log('✅ Token ID確認成功:', tokenId, '所有者:', owner);
      } catch (verifyError) {
        console.error('❌ Token ID確認エラー:', verifyError);
        throw new Error(`Token ID ${tokenId} が見つかりません。ミント処理に問題があった可能性があります。`);
      }

      updateProgress('NFT作成完了！', 100);

      const nftInfo = {
        contractAddress: CONTRACT_ADDRESS,
        tokenId: tokenId.toString(),
        txHash: receipt.hash,
        networkName: NETWORK_NAME,
        metadataURI,
        fileName: file.name
      };

      startTransition(() => {
        setMintedNftInfo(nftInfo);
        setSuccess('NFTが正常に作成されました！');
      });

      console.log('🎉 NFT作成成功:', nftInfo);
      return nftInfo;

    } catch (error) {
      console.error('❌ NFTミントエラー:', error);

      let errorMessage = 'NFTの作成に失敗しました';

      if (error.code === 4001) {
        errorMessage = 'ユーザーによってトランザクションが拒否されました';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'ETHが不足しています';
      } else if (error.message.includes('MintingDisabled')) {
        errorMessage = 'ミント機能が無効になっています';
      } else if (error.message.includes('MaxSupplyExceeded')) {
        errorMessage = '最大発行数に達しています';
      } else if (error.message.includes('InsufficientPayment')) {
        errorMessage = '支払い金額が不足しています';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw error;
    } finally {
      setUploading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  }, [CONTRACT_ADDRESS, NETWORK_NAME, updateProgress]);

  // ミント情報をクリア
  const clearMintedInfo = useCallback(() => {
    startTransition(() => {
      setMintedNftInfo(null);
      setSuccess('');
    });
  }, []);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    // 状態
    uploading: uploading || isPending,
    loadingStep,
    loadingProgress,
    mintedNftInfo,
    error,
    success,
    isPending,

    // アクション
    mintNFT,
    clearMintedInfo,
    clearError,

    // ユーティリティ
    isMinting: uploading,
    hasError: !!error,
    hasSuccess: !!success,
    hasMintedNft: !!mintedNftInfo
  };
};

export default useNftMinting;
