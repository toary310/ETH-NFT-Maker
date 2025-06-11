import { ethers } from 'ethers';
import { useCallback, useState, useTransition } from 'react';
import Web3Mint from '../../../utils/Web3Mint.json';
import { getIPFSUploader } from '../../../utils/ipfsService';

/**
 * NFTミント処理用カスタムフック
 * 責務：
 * - NFTミント処理の管理
 * - 進捗状態の管理
 * - エラーハンドリング
 */
const useNftMinting = () => {
  const [isPending, startTransition] = useTransition();

  const [uploading, setUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mintedNftInfo, setMintedNftInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // コントラクトアドレス
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ||
    '0x590D13672DDB149A4602989A7B3B7D35a082B433';
  const NETWORK_NAME = process.env.REACT_APP_NETWORK_NAME || 'sepolia';

  // 進捗更新
  const updateProgress = useCallback((step, progress) => {
    setLoadingStep(step);
    setLoadingProgress(progress);
  }, []);

  // NFTミント処理
  const mintNFT = useCallback(async (file, currentAccount) => {
    if (!file || !currentAccount) {
      throw new Error('ファイルまたはアカウントが指定されていません');
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      updateProgress('ミント処理を開始しています...', 0);

      // 1. IPFSアップロード
      updateProgress('IPFSに画像をアップロード中...', 20);
      const ipfsUploader = getIPFSUploader();

      const fileName = file.name.replace(/\.[^/.]+$/, ""); // 拡張子を除去
      const metadataURI = await ipfsUploader.uploadNFTData(
        file,
        fileName,
        `${fileName} - Created with NFT Maker`
      );

      updateProgress('スマートコントラクトを呼び出し中...', 60);

      // 2. スマートコントラクト呼び出し
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('MetaMaskが見つかりません');
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Web3Mint.abi, signer);

      // コントラクト状態を詳細確認
      const mintingEnabled = await contract.mintingEnabled();
      const mintPrice = await contract.mintPrice();
      const currentSupply = await contract.totalSupply();
      const maxSupply = await contract.MAX_SUPPLY();
      const currentTokenId = await contract.getCurrentTokenId();
      const contractBalance = await contract.getContractBalance();

      console.log('📊 コントラクト状態詳細確認:');
      console.log('  ミント機能:', mintingEnabled ? '有効' : '無効');
      console.log('  ミント価格:', ethers.formatEther(mintPrice), 'ETH');
      console.log('  現在の発行数:', currentSupply.toString());
      console.log('  最大発行数:', maxSupply.toString());
      console.log('  次のトークンID:', currentTokenId.toString());
      console.log('  コントラクト残高:', ethers.formatEther(contractBalance), 'ETH');
      console.log('  送信ETH:', ethers.formatEther(mintPrice), 'ETH');
      console.log('  ユーザーアドレス:', currentAccount);

      // ミント前の検証
      if (!mintingEnabled) {
        throw new Error('ミント機能が無効になっています');
      }

      if (currentTokenId > maxSupply) {
        throw new Error(`最大発行数に達しています (${currentTokenId} > ${maxSupply})`);
      }

      // ユーザーの残高確認
      const userBalance = await provider.getBalance(currentAccount);
      console.log('  ユーザー残高:', ethers.formatEther(userBalance), 'ETH');

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
