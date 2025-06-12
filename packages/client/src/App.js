// アプリケーション全体のスタイルシートをインポート
import './App.css';

// メインのNFTアップローダーコンポーネントをインポート
import NftUploader from './components/NftUploader/NftUploader';

// 🛠️ 開発環境でのみデバッグツールを読み込み
// 本番環境では読み込まれないため、パフォーマンスに影響しません
if (process.env.NODE_ENV === 'development') {
  // Etherscanとの連携をテストするためのユーティリティ
  import('./utils/etherscanTestUtils');
  // Etherscanでの表示をデバッグするためのツール
  import('./utils/etherscanDebugger');
}

/**
 * 🎨 メインアプリケーションコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「アプリケーションの入り口」です。
 * ユーザーがブラウザでアプリにアクセスした時に最初に表示される部分で、
 * 全体の構造を定義し、メインのNFTアップローダー機能を表示します。
 *
 * 【構造】
 * - シンプルな構造でNftUploaderコンポーネントを表示
 * - App.cssでスタイリング
 * - 開発環境では追加のデバッグツールも読み込み
 *
 * 【初心者向け解説】
 * - コンポーネント = 画面の部品（この場合はアプリ全体）
 * - JSX = JavaScriptの中でHTMLのような記述ができる構文
 * - className = HTMLのclass属性（CSSでスタイリングするため）
 * - export default = このコンポーネントを他のファイルから使えるようにする
 */
function App() {
  return (
    <div className='App'>
      {/* メインのNFTアップローダーコンポーネントを表示 */}
      <NftUploader />
    </div>
  );
}

// このコンポーネントを他のファイル（index.js）から使用できるようにエクスポート
export default App;
