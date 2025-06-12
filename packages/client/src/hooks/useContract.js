// Reactの機能をインポート
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
// Ethereumブロックチェーンとの通信ライブラリをインポート
import { ethers } from 'ethers';
// スマートコントラクトの設計図（ABI）をインポート
import Web3Mint from '../utils/Web3Mint.json';

/**
 * 📄 スマートコントラクト情報管理用カスタムフック
 *
 * 【このフックの役割】
 * このフックは「コントラクトの情報収集係」のような役割を果たします。
 * ブロックチェーン上のスマートコントラクトから最新の情報を取得し、
 * NFTの価格、発行状況、利用可能性などをリアルタイムで監視します。
 *
 * 【主な責務（やること）】
 * 1. コントラクト情報の取得 - 価格、発行数、制限などの基本情報
 * 2. リアルタイム監視 - 状況の変化を自動で検知
 * 3. エラーハンドリング - 接続問題やタイムアウトの適切な処理
 * 4. パフォーマンス最適化 - 不要な通信を避けて効率化
 * 5. 統計情報の計算 - 残り発行数、進捗率などの便利な情報
 *
 * 【React 19の新機能を活用】
 * - useTransition: 重い処理でもUIが固まらないようにする
 * - useMemo: 計算結果を記憶して処理を高速化
 * - startTransition: 緊急でない更新を後回しにしてUIを滑らかに
 * - AbortController: 不要になったリクエストを適切にキャンセル
 *
 * 【初心者向け解説】
 * - スマートコントラクト = ブロックチェーン上で動くプログラム
 * - ABI = Application Binary Interface（コントラクトとの通信方法）
 * - Wei = Ethereumの最小単位（1 ETH = 10^18 Wei）
 * - Provider = ブロックチェーンネットワークへの接続
 *
 * @param {string} currentAccount - 現在接続中のウォレットアドレス
 */
const useContract = (currentAccount) => {

  // 🔄 React 19の新機能：useTransition
  // 重い処理を行う時に、UIの応答性を保つための機能
  const [isPending, startTransition] = useTransition();

  // 📊 状態管理：コントラクトの情報と状況を記録
  const [contractInfo, setContractInfo] = useState(null);    // コントラクトの詳細情報
  const [loading, setLoading] = useState(false);             // 情報取得中かどうか
  const [error, setError] = useState(null);                  // エラー情報

  // 🔒 重複実行防止とリクエスト管理用のref
  const fetchedRef = useRef(false);           // 既に取得済みかどうかのフラグ
  const abortControllerRef = useRef(null);    // リクエストキャンセル用のコントローラー

  // 🏠 コントラクトアドレス（useMemoで最適化）
  // 環境変数から取得、設定されていない場合はデフォルト値を使用
  const CONTRACT_ADDRESS = useMemo(() =>
    process.env.REACT_APP_CONTRACT_ADDRESS ||
    '0x590D13672DDB149A4602989A7B3B7D35a082B433'  // Sepoliaテストネットのデフォルトアドレス
  , []);

  // ⏱️ タイムアウト設定（useMemoで最適化）
  // ネットワークが遅い場合でも適切にタイムアウトする
  const CONTRACT_TIMEOUT = useMemo(() => 15000, []); // 15秒でタイムアウト

  // 📡 コントラクト情報取得関数（最適化版）
  // ブロックチェーンからコントラクトの最新情報を取得する重要な関数
  const fetchContractInfo = useCallback(async () => {
    // 📋 事前チェック：取得条件を満たしているか確認
    if (!currentAccount || fetchedRef.current || loading) return;

    // 🚫 前のリクエストをキャンセル（重複実行防止）
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 🎛️ 新しいAbortControllerを作成（リクエスト管理用）
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // 🏁 取得開始：状態を更新
    setLoading(true);           // ローディング状態をON
    setError(null);             // 前回のエラーをクリア
    fetchedRef.current = true;  // 取得済みフラグをON

    try {
      // 🔗 Ethereumプロバイダー（ブロックチェーンへの接続）を取得
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }

      // 📡 ブロックチェーンネットワークへの接続を確立
      const provider = new ethers.BrowserProvider(ethereum);

      // 📄 スマートコントラクトのインスタンスを作成
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,    // コントラクトのアドレス
        Web3Mint.abi,       // コントラクトとの通信方法（ABI）
        provider            // ネットワーク接続
      );

      // ⏱️ タイムアウト機能付きPromise（AbortController対応）
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Contract call timeout'));
        }, CONTRACT_TIMEOUT);

        // キャンセル時にタイムアウトもクリア
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Request aborted'));
        });
      });

      // 🚀 複数のコントラクト情報を並行取得（パフォーマンス改善）
      // Promise.allを使って同時に複数の情報を取得することで高速化
      const contractCalls = Promise.all([
        contract.mintingEnabled(),                      // ミント機能が有効かどうか
        contract.mintPrice(),                           // ミント価格（Wei単位）
        contract.MAX_SUPPLY(),                          // 最大発行可能数
        contract.totalSupply(),                         // 現在の発行済み数
        // 追加情報も並行取得（エラーが発生してもデフォルト値を使用）
        contract.name().catch(() => 'Unknown NFT'),     // NFTコレクション名
        contract.symbol().catch(() => 'NFT')            // NFTシンボル
      ]);

      // 🏁 Promise.raceでタイムアウトと競争させる
      // どちらか早く完了した方の結果を使用
      const [
        mintingEnabled,    // ミント機能の有効性
        mintPrice,         // ミント価格
        maxSupply,         // 最大供給量
        currentSupply,     // 現在の供給量
        contractName,      // コントラクト名
        contractSymbol     // コントラクトシンボル
      ] = await Promise.race([
        contractCalls,     // 実際のコントラクト呼び出し
        timeoutPromise     // タイムアウト監視
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
