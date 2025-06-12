// Reactライブラリをインポート
import React from 'react';
// Material-UIのコンポーネントをインポート（美しいUIを作るためのライブラリ）
import { Alert, Box, Button, Container, Typography } from '@mui/material';

/**
 * 🛡️ NFTアプリケーション専用エラーバウンダリーコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「アプリの安全網」のような役割を果たします。
 * アプリのどこかでエラーが発生した時に、アプリ全体がクラッシュするのを防ぎ、
 * ユーザーに分かりやすいエラーメッセージと復旧方法を表示します。
 *
 * 【エラーバウンダリーとは？】
 * - Reactアプリでエラーが発生した時の「最後の砦」
 * - エラーをキャッチして、アプリの完全停止を防ぐ
 * - ユーザーフレンドリーなエラー画面を表示
 * - 開発者にエラー情報を提供
 *
 * 【主な機能】
 * 1. エラーの種類を自動判別（ネットワーク、ウォレット、システム）
 * 2. 適切な解決方法をユーザーに提案
 * 3. 再試行機能とページリロード機能
 * 4. 開発環境でのデバッグ情報表示
 * 5. 本番環境でのエラー追跡サービス連携
 *
 * 【初心者向け解説】
 * - クラスコンポーネント = 古い書き方だが、エラーバウンダリーには必要
 * - state = コンポーネントの状態（エラー情報、再試行回数など）
 * - componentDidCatch = エラーが発生した時に自動で呼ばれる特別な関数
 */
class NFTErrorBoundary extends React.Component {

  // 🏗️ コンストラクタ：コンポーネントが作られる時に1回だけ実行
  constructor(props) {
    super(props);
    // 📊 初期状態を設定
    this.state = {
      hasError: false,    // エラーが発生しているかどうか
      error: null,        // エラーオブジェクト（詳細情報）
      errorInfo: null,    // エラーの追加情報（どのコンポーネントで発生したかなど）
      retryCount: 0       // 再試行回数（何回リトライしたか）
    };
  }

  // 🚨 静的メソッド：エラーが発生した時にReactが自動で呼び出す
  // この関数でstateを更新して、エラー画面を表示するかどうかを決める
  static getDerivedStateFromError(error) {
    // エラーが発生したときに状態を更新
    // hasError: true にすることで、エラー画面が表示される
    return { hasError: true };
  }

  // 🔍 エラーキャッチメソッド：エラーの詳細情報を処理
  // getDerivedStateFromErrorの後に呼ばれる
  componentDidCatch(error, errorInfo) {
    // 🖥️ エラーログをコンソールに記録（開発者が確認するため）
    console.error('NFT Error Boundary caught an error:', error, errorInfo);

    // 📊 エラー情報をstateに保存
    this.setState({
      error,          // エラーオブジェクト
      errorInfo,      // エラーの詳細情報
      hasError: true  // エラー状態フラグ
    });

    // 🏭 本番環境では外部のエラー追跡サービスにエラー情報を送信
    // 開発者がユーザーのエラーを把握して改善できるようにする
    if (process.env.NODE_ENV === 'production') {
      // 例: Sentry, LogRocket, Bugsnag等のサービス
      this.logErrorToService(error, errorInfo);
    }
  }

  // 📡 エラー追跡サービスへの送信関数
  // 本番環境でユーザーのエラーを開発者が把握できるようにする
  logErrorToService = (error, errorInfo) => {
    // 📦 エラー情報をまとめたデータパッケージを作成
    const errorData = {
      message: error.message,                           // エラーメッセージ
      stack: error.stack,                               // エラーのスタックトレース（どこで発生したか）
      componentStack: errorInfo.componentStack,         // Reactコンポーネントのスタック
      timestamp: new Date().toISOString(),              // エラー発生時刻
      userAgent: navigator.userAgent,                   // ユーザーのブラウザ情報
      url: window.location.href,                        // エラーが発生したページのURL
      retryCount: this.state.retryCount                 // 再試行回数
    };

    // 🖥️ 開発環境ではコンソールに表示
    console.log('Error data for tracking service:', errorData);

    // 🏭 実際の実装では、ここでSentryやLogRocket等のAPIを呼び出し
    // 例: Sentry.captureException(error, { extra: errorData });
  };

  // 🔄 再試行ボタンがクリックされた時の処理
  // エラー状態をリセットして、アプリを正常状態に戻す
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,        // エラー状態を解除
      error: null,            // エラー情報をクリア
      errorInfo: null,        // エラー詳細情報をクリア
      retryCount: prevState.retryCount + 1  // 再試行回数を増加
    }));
  };

  // 🔃 ページリロードボタンがクリックされた時の処理
  // ブラウザのページ全体を再読み込みして、完全にリセット
  handleReload = () => {
    window.location.reload();
  };

  // 🎨 画面を描画する関数（Reactの重要なメソッド）
  render() {
    // 🚨 エラーが発生している場合は、エラー画面を表示
    if (this.state.hasError) {
      const { error } = this.state;

      // 🔍 エラーの種類を自動判別
      // エラーメッセージの内容から、どんな種類のエラーかを推測
      const isNetworkError = error?.message?.includes('network') ||
                           error?.message?.includes('fetch') ||
                           error?.message?.includes('timeout');

      const isWalletError = error?.message?.includes('wallet') ||
                          error?.message?.includes('MetaMask') ||
                          error?.message?.includes('ethereum');

      return (
        <Container maxWidth="md" style={{ marginTop: '2rem' }}>
          <Box textAlign="center" p={3}>
            {/* 🚫 エラータイトル */}
            <Typography variant="h4" gutterBottom color="error">
              🚫 エラーが発生しました
            </Typography>

            {/* ⚠️ エラー詳細アラート */}
            <Alert
              severity="error"
              style={{
                margin: '1rem 0',
                textAlign: 'left',
                fontSize: '1rem'
              }}
            >
              {/* 📋 エラーの種類を表示 */}
              <Typography variant="h6" gutterBottom>
                {isNetworkError ? '🌐 ネットワークエラー' :
                 isWalletError ? '👛 ウォレットエラー' :
                 '⚠️ システムエラー'}
              </Typography>

              {/* 📝 エラーメッセージを表示 */}
              <Typography variant="body1" paragraph>
                <strong>エラー内容:</strong> {error?.message || '不明なエラー'}
              </Typography>

              {isNetworkError && (
                <Typography variant="body2" color="textSecondary">
                  ネットワーク接続を確認してください。Sepoliaテストネットに接続されているか確認し、
                  数分待ってから再試行してください。
                </Typography>
              )}

              {isWalletError && (
                <Typography variant="body2" color="textSecondary">
                  MetaMaskが正しくインストールされ、Sepoliaテストネットに接続されているか確認してください。
                  ウォレットをロック解除してから再試行してください。
                </Typography>
              )}

              {!isNetworkError && !isWalletError && (
                <Typography variant="body2" color="textSecondary">
                  予期しないエラーが発生しました。ページをリロードするか、
                  問題が継続する場合は開発者にお問い合わせください。
                </Typography>
              )}
            </Alert>

            <Box mt={3} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleRetry}
                size="large"
              >
                🔄 再試行 {this.state.retryCount > 0 && `(${this.state.retryCount + 1}回目)`}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleReload}
                size="large"
              >
                🔃 ページをリロード
              </Button>
            </Box>

            {/* 開発環境でのデバッグ情報 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Typography variant="h6" gutterBottom>
                  🛠️ デバッグ情報（開発環境のみ）
                </Typography>
                <pre style={{
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                  textAlign: 'left'
                }}>
                  {this.state.error.stack}
                </pre>
              </Box>
            )}

            <Typography variant="body2" color="textSecondary" mt={3}>
              問題が解決しない場合は、ブラウザのコンソールを確認するか、
              <br />
              問題を報告してください。
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default NFTErrorBoundary;
