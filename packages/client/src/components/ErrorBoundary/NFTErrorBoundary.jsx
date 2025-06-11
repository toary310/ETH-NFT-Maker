import React from 'react';
import { Alert, Button, Container, Typography, Box } from '@mui/material';

/**
 * React 19対応 Error Boundary コンポーネント
 * NFTアップローダー専用のエラーハンドリング
 */
class NFTErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // エラーが発生したときに状態を更新
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // エラーログを記録
    console.error('NFT Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // 本番環境では外部サービスにエラーを送信
    if (process.env.NODE_ENV === 'production') {
      // 例: Sentry, LogRocket等
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // エラー追跡サービスへの送信
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };
    
    console.log('Error data for tracking service:', errorData);
    // 実際の実装では適切なサービスAPIを呼び出し
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isNetworkError = error?.message?.includes('network') || 
                           error?.message?.includes('fetch') ||
                           error?.message?.includes('timeout');
      
      const isWalletError = error?.message?.includes('wallet') || 
                          error?.message?.includes('MetaMask') ||
                          error?.message?.includes('ethereum');

      return (
        <Container maxWidth="md" style={{ marginTop: '2rem' }}>
          <Box textAlign="center" p={3}>
            <Typography variant="h4" gutterBottom color="error">
              🚫 エラーが発生しました
            </Typography>
            
            <Alert 
              severity="error" 
              style={{ 
                margin: '1rem 0', 
                textAlign: 'left',
                fontSize: '1rem'
              }}
            >
              <Typography variant="h6" gutterBottom>
                {isNetworkError ? '🌐 ネットワークエラー' : 
                 isWalletError ? '👛 ウォレットエラー' : 
                 '⚠️ システムエラー'}
              </Typography>
              
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