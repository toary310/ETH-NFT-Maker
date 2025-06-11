import { useState, useEffect, useRef, useCallback, useMemo, useTransition, startTransition } from 'react';

/**
 * ウォレット接続カスタムフック - React 19対応版
 * 新機能:
 * - useTransition: 非同期状態更新の最適化
 * - useMemo: ネットワーク設定のメモ化
 * - startTransition: UIブロッキングを防ぐ状態更新
 * - 改善されたエラーハンドリング
 */
const useWallet = () => {
  // React 19: useTransition for non-blocking state updates
  const [isPending, startTransition] = useTransition();
  
  const [currentAccount, setCurrentAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState('');
  
  // 重複実行を防ぐためのref
  const initialized = useRef(false);
  const isCheckingWallet = useRef(false);

  // React 19: useMemo for network configuration (performance optimization)
  const SEPOLIA_CHAIN_ID = useMemo(() => '0xaa36a7', []); // 11155111 in hex
  const SEPOLIA_NETWORK = useMemo(() => ({
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia test network',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  }), [SEPOLIA_CHAIN_ID]);
  
  // ネットワーク名のマッピング（メモ化）
  const networkNames = useMemo(() => ({
    1: 'Ethereum Mainnet',
    137: 'Polygon Mainnet', 
    80001: 'Polygon Mumbai',
    56: 'BSC Mainnet',
    97: 'BSC Testnet',
    43114: 'Avalanche',
    250: 'Fantom',
    42161: 'Arbitrum One',
    10: 'Optimism',
    11155111: 'Sepolia Testnet'
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