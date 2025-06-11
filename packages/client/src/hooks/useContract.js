import { useState, useEffect, useRef, useCallback, useMemo, useTransition, startTransition } from 'react';
import { ethers } from 'ethers';
import Web3Mint from '../utils/Web3Mint.json';

/**
 * コントラクト情報カスタムフック - React 19対応版
 * 新機能:
 * - useTransition: ノンブロッキングな状態更新
 * - useMemo: コントラクトアドレスのメモ化
 * - startTransition: UI応答性の向上
 * - 改善されたエラーハンドリングとタイムアウト
 */
const useContract = (currentAccount) => {
  // React 19: useTransition for non-blocking updates
  const [isPending, startTransition] = useTransition();
  
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchedRef = useRef(false);
  const abortControllerRef = useRef(null);

  // React 19: useMemo for contract address (performance optimization)
  const CONTRACT_ADDRESS = useMemo(() => 
    process.env.REACT_APP_CONTRACT_ADDRESS || 
    '0x590D13672DDB149A4602989A7B3B7D35a082B433'
  , []);

  // タイムアウト設定（メモ化）
  const CONTRACT_TIMEOUT = useMemo(() => 15000, []); // 15秒

  // コントラクト情報取得（最適化版）
  const fetchContractInfo = useCallback(async () => {
    if (!currentAccount || fetchedRef.current || loading) return;
    
    // 前のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    setLoading(true);
    setError(null);
    fetchedRef.current = true;
    
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      const provider = new ethers.BrowserProvider(ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Web3Mint.abi,
        provider
      );
      
      // AbortController対応のタイムアウト
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Contract call timeout'));
        }, CONTRACT_TIMEOUT);
        
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Request aborted'));
        });
      });
      
      // Promise.allでコントラクト情報を並行取得（パフォーマンス改善）
      const contractCalls = Promise.all([
        contract.mintingEnabled(),
        contract.mintPrice(),
        contract.MAX_SUPPLY(),
        contract.totalSupply(),
        // 追加情報も並行取得
        contract.name().catch(() => 'Unknown NFT'),
        contract.symbol().catch(() => 'NFT')
      ]);
      
      const [
        mintingEnabled, 
        mintPrice, 
        maxSupply, 
        currentSupply,
        contractName,
        contractSymbol
      ] = await Promise.race([
        contractCalls,
        timeoutPromise
      ]);
      
      // キャンセルチェック
      if (signal.aborted) return;
      
      const contractData = {
        mintingEnabled,
        mintPrice: ethers.formatEther(mintPrice),
        maxSupply: maxSupply.toString(),
        currentSupply: currentSupply.toString(),
        isMaxReached: currentSupply >= maxSupply,
        contractAddress: CONTRACT_ADDRESS,
        contractName,
        contractSymbol,
        lastUpdated: new Date().toISOString()
      };
      
      // React 19: startTransition for non-urgent state updates
      startTransition(() => {
        setContractInfo(contractData);
      });
      
      console.log('✅ Contract info fetched:', contractData);
      
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Request aborted') {
        console.log('Contract info fetch was cancelled');
        return;
      }
      
      console.error('コントラクト情報取得エラー:', error.message);
      
      // React 19: startTransition for error updates
      startTransition(() => {
        setError(`コントラクト情報の取得に失敗しました: ${error.message}`);
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentAccount, loading, CONTRACT_ADDRESS, CONTRACT_TIMEOUT]);

  // 手動リフレッシュ（最適化版）
  const refetchContractInfo = useCallback(() => {
    fetchedRef.current = false;
    startTransition(() => {
      setError(null);
    });
    fetchContractInfo();
  }, [fetchContractInfo]);

  // アカウント変更時のクリーンアップ（React 19最適化版）
  useEffect(() => {
    fetchedRef.current = false;
    
    // 進行中のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    startTransition(() => {
      setContractInfo(null);
      setError(null);
    });
  }, [currentAccount]);

  // コントラクト情報の自動取得
  useEffect(() => {
    if (currentAccount && !fetchedRef.current) {
      fetchContractInfo();
    }
  }, [currentAccount, fetchContractInfo]);

  // クリーンアップ（コンポーネントアンマウント時）
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // コントラクト情報の統計（メモ化）
  const contractStats = useMemo(() => {
    if (!contractInfo) return null;
    
    const remainingSupply = parseInt(contractInfo.maxSupply) - parseInt(contractInfo.currentSupply);
    const supplyPercentage = (parseInt(contractInfo.currentSupply) / parseInt(contractInfo.maxSupply)) * 100;
    
    return {
      remainingSupply,
      supplyPercentage: Math.round(supplyPercentage * 100) / 100,
      canMint: contractInfo.mintingEnabled && !contractInfo.isMaxReached,
      mintPriceWei: contractInfo.mintPrice ? ethers.parseEther(contractInfo.mintPrice) : null
    };
  }, [contractInfo]);

  return {
    contractInfo,
    contractStats,
    loading: loading || isPending,
    error,
    refetchContractInfo,
    // React 19の追加情報
    isPending,
    // ユーティリティ関数
    isContractReady: !loading && !error && contractInfo !== null,
    hasError: !!error
  };
};

export default useContract;