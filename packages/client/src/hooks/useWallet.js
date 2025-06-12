// Reactの機能をインポート
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';

/**
 * 🔐 ウォレット接続管理用カスタムフック
 *
 * 【このフックの役割】
 * このフックは「デジタル財布の管理人」のような役割を果たします。
 * MetaMask（デジタル財布）との接続や、正しいネットワーク（Sepolia）への
 * 接続を管理し、ユーザーがスムーズにNFTアプリを使えるようにサポートします。
 *
 * 【主な責務（やること）】
 * 1. MetaMaskとの接続・切断管理
 * 2. ネットワーク（Sepolia）の確認と切り替え
 * 3. ウォレットアドレスの取得と監視
 * 4. エラーハンドリングとユーザーへの分かりやすい通知
 *
 * 【初心者向け解説】
 * - ウォレット = デジタル財布（MetaMask）。暗号通貨やNFTを保管
 * - ネットワーク = ブロックチェーンの種類（Ethereum、Sepolia等）
 * - アドレス = ウォレットの住所（0xから始まる42文字の文字列）
 * - フック = Reactで状態や処理を管理する仕組み
 *
 * 【React 19の新機能を活用】
 * - useTransition: 重い処理でもUIが固まらないようにする
 * - useMemo: 計算結果を記憶して処理を高速化
 * - startTransition: 緊急でない更新を後回しにしてUIを滑らかに
 */
const useWallet = () => {

  // 🔄 React 19の新機能：useTransition
  // 重い処理を行う時に、UIの応答性を保つための機能
  // isPending = 処理中かどうか、startTransition = 処理を開始する関数
  const [isPending, startTransition] = useTransition();

  // 📊 状態管理：アプリの「今の状況」を記録する変数たち
  const [currentAccount, setCurrentAccount] = useState('');     // 現在接続中のウォレットアドレス
  const [isConnecting, setIsConnecting] = useState(false);      // ウォレット接続処理中かどうか
  const [error, setError] = useState('');                       // 一般的なエラーメッセージ
  const [networkError, setNetworkError] = useState('');         // ネットワーク関連のエラーメッセージ

  // 🔒 重複実行を防ぐためのref（useRefは値を記憶するReactの機能）
  const initialized = useRef(false);        // 初期化済みかどうかのフラグ
  const isCheckingWallet = useRef(false);   // ウォレットチェック中かどうかのフラグ

  // 🌐 Sepoliaテストネットワークの設定（useMemoで最適化）
  // useMemoは計算結果を記憶して、不要な再計算を防ぐReactの機能
  const SEPOLIA_CHAIN_ID = useMemo(() => '0xaa36a7', []); // SepoliaのチェーンID（16進数）

  // Sepoliaネットワークの詳細設定
  const SEPOLIA_NETWORK = useMemo(() => ({
    chainId: SEPOLIA_CHAIN_ID,                              // ネットワークID
    chainName: 'Sepolia test network',                      // ネットワーク名
    nativeCurrency: {                                       // 基軸通貨の設定
      name: 'ETH',                                          // 通貨名
      symbol: 'ETH',                                        // 通貨シンボル
      decimals: 18,                                         // 小数点以下の桁数
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],            // RPC接続URL
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],  // ブロックエクスプローラーURL
  }), [SEPOLIA_CHAIN_ID]);

  // 🗺️ ネットワーク名のマッピング（チェーンIDから名前を取得）
  const networkNames = useMemo(() => ({
    1: 'Ethereum Mainnet',        // イーサリアムメインネット
    137: 'Polygon Mainnet',       // Polygonメインネット
    80001: 'Polygon Mumbai',      // Polygonテストネット
    56: 'BSC Mainnet',           // Binance Smart Chainメインネット
    97: 'BSC Testnet',           // Binance Smart Chainテストネット
    43114: 'Avalanche',          // Avalancheネットワーク
    250: 'Fantom',               // Fantomネットワーク
    42161: 'Arbitrum One',       // Arbitrumネットワーク
    10: 'Optimism',              // Optimismネットワーク
    11155111: 'Sepolia Testnet'  // Sepoliaテストネット（今回使用）
  }), []);

  // ネットワークチェック関数（最適化版）
  const checkNetwork = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return false;

      const chainId = await ethereum.request({ method: 'eth_chainId' });

      if (chainId !== SEPOLIA_CHAIN_ID) {
        const chainIdDecimal = parseInt(chainId, 16);
        const currentNetwork = networkNames[chainIdDecimal] || `Unknown Network (Chain ID: ${chainIdDecimal})`;

        const errorMessage = `
          🚫 間違ったネットワークに接続されています

          現在のネットワーク: ${currentNetwork}
          必要なネットワーク: Sepolia Testnet

          MetaMaskでSepoliaテストネットに切り替えてください。
        `.trim();

        // React 19: startTransition for non-urgent error updates
        startTransition(() => {
          setNetworkError(errorMessage);
        });

        return false;
      } else {
        // React 19: startTransition for clearing errors
        startTransition(() => {
          setNetworkError('');
        });
        return true;
      }
    } catch (error) {
      console.error('Network check error:', error);
      return false;
    }
  }, [SEPOLIA_CHAIN_ID, networkNames]);

  // Sepoliaネットワークに切り替える関数（最適化版）
  const switchToSepolia = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('MetaMaskが見つかりません');
      }

      try {
        // まずSepoliaに切り替えを試行
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        // ネットワークが追加されていない場合は追加
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK],
          });
        } else {
          throw switchError;
        }
      }

      // ネットワーク切り替え後に再チェック（遅延実行）
      setTimeout(() => {
        checkNetwork();
      }, 1000);

    } catch (error) {
      console.error('Network switch error:', error);
      const errorMessage = error.code === 4001
        ? 'ユーザーによってネットワーク切り替えが拒否されました'
        : `ネットワーク切り替えエラー: ${error.message}`;

      // React 19: startTransition for error updates
      startTransition(() => {
        setError(errorMessage);
      });
    }
  }, [SEPOLIA_CHAIN_ID, SEPOLIA_NETWORK, checkNetwork]);

  // ウォレット接続状態確認（最適化版）
  const checkIfWalletIsConnected = useCallback(async () => {
    if (isCheckingWallet.current) return;
    isCheckingWallet.current = true;

    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('MetaMask not found');
        return;
      }

      // Promise.allでネットワークとアカウントを並行チェック
      const [isCorrectNetwork, accounts] = await Promise.all([
        checkNetwork(),
        ethereum.request({ method: 'eth_accounts' }).catch((error) => {
          console.log('Error checking wallet connection:', error.message);
          return [];
        })
      ]);

      if (!isCorrectNetwork) {
        return; // ネットワークが間違っている場合はアカウントチェックをスキップ
      }

      if (accounts && accounts.length > 0) {
        console.log('Found authorized account:', accounts[0]);
        // React 19: startTransition for account updates
        startTransition(() => {
          setCurrentAccount(accounts[0]);
        });
      }
    } catch (error) {
      console.log('Wallet check error:', error.message);
      startTransition(() => {
        setError('ウォレットの確認中にエラーが発生しました');
      });
    } finally {
      isCheckingWallet.current = false;
    }
  }, [checkNetwork]);

  // ウォレット接続（最適化版）
  const connectWallet = useCallback(async () => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setError('');

      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('MetaMaskをインストールしてください');
      }

      // ネットワークをチェック
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        throw new Error('Sepoliaテストネットに切り替えてから再度お試しください');
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }).catch((error) => {
        // エラーコードによる詳細な分類
        const errorMessages = {
          4001: 'ユーザーによってリクエストが拒否されました',
          '-32002': 'リクエストが既に処理中です',
          '-32603': 'MetaMaskの内部エラーが発生しました'
        };

        const message = errorMessages[error.code] || error.message;
        throw new Error(message);
      });

      if (accounts && accounts.length > 0) {
        // React 19: startTransition for successful connection
        startTransition(() => {
          setCurrentAccount(accounts[0]);
        });
        console.log('Connected to wallet:', accounts[0]);
      }
    } catch (error) {
      console.log('Connect wallet error:', error.message);
      startTransition(() => {
        setError(`ウォレット接続エラー: ${error.message}`);
      });
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, checkNetwork]);

  // アカウント変更の監視（React 19最適化版）
  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum?.on) return;

    const handleAccountsChanged = (accounts) => {
      startTransition(() => {
        if (accounts.length === 0) {
          setCurrentAccount('');
        } else {
          setCurrentAccount(accounts[0]);
        }
      });
      // アカウント変更時にネットワークもチェック
      checkNetwork();
    };

    const handleChainChanged = (chainId) => {
      console.log('Network changed to:', chainId);
      // ネットワーク変更時にチェック
      checkNetwork();
    };

    // より安全なイベントリスナー登録
    const cleanup = () => {
      try {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      } catch (error) {
        console.warn('Error removing listeners:', error);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return cleanup;
  }, [checkNetwork]);

  // 初期化（一度だけ実行）
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      checkIfWalletIsConnected();
    }
  }, [checkIfWalletIsConnected]);

  // カスタムsetError（React 19対応版）
  const setErrorOptimized = useCallback((errorMessage) => {
    startTransition(() => {
      setError(errorMessage);
    });
  }, []);

  return {
    currentAccount,
    isConnecting: isConnecting || isPending,
    error,
    networkError,
    connectWallet,
    switchToSepolia,
    setError: setErrorOptimized,
    // React 19の追加情報
    isPending
  };
};

export default useWallet;
