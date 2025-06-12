// Reactライブラリをインポート（UIを作るためのメインライブラリ）
import React from 'react';
// ReactDOMをインポート（ReactをブラウザのDOMに描画するためのライブラリ）
import ReactDOM from 'react-dom/client';
// メインのアプリケーションコンポーネントをインポート
import App from './App';
// 全体のスタイルシートをインポート
import './index.css';

/**
 * ? アプリケーションのエントリーポイント
 *
 * 【このファイルの役割】
 * このファイルは「アプリケーションの起動装置」です。
 * ブラウザがページを読み込んだ時に最初に実行され、
 * ReactアプリケーションをHTMLのDOM要素に描画（レンダリング）します。
 *
 * 【処理の流れ】
 * 1. HTML内の'root'というIDを持つ要素を見つける
 * 2. そこにReactアプリケーションを描画する場所を作る
 * 3. Appコンポーネントを描画する
 * 4. React.StrictModeで開発時の問題を検出
 *
 * 【React.StrictModeとは？】
 * - 開発時にのみ動作する特別なモード
 * - 潜在的な問題を早期発見するためのツール
 * - 非推奨のAPIや副作用の問題を警告
 * - 本番環境では影響なし
 *
 * 【初心者向け解説】
 * - DOM = Document Object Model（HTMLの構造を表現する仕組み）
 * - root = HTMLファイル内の<div id="root"></div>要素
 * - render = 画面に描画すること
 * - StrictMode = より厳密なチェックを行う開発モード
 */

// ? HTML内の'root'要素を見つけて、Reactアプリの描画場所を作成
const root = ReactDOM.createRoot(document.getElementById('root'));

// ? 実際にアプリケーションを画面に描画
root.render(
  <React.StrictMode>
    {/* メインのアプリケーションコンポーネントを描画 */}
    <App />
  </React.StrictMode>
);
