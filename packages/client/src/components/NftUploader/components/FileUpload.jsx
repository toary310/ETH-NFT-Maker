// Reactライブラリをインポート
// Material-UIのコンポーネントをインポート
import { Alert, Button } from '@mui/material';
// 画像アイコンをインポート
import ImageLogo from '../image.svg';

/**
 * 📁 ファイルアップロードコンポーネント
 *
 * 【このコンポーネントの役割】
 * このコンポーネントは「ファイルの受付係」のような役割を果たします。
 * ユーザーが画像ファイルを選択・アップロードできるインターフェースを提供し、
 * ドラッグ&ドロップやファイル選択ボタンなど、複数の方法でファイルを受け取ります。
 *
 * 【主な機能】
 * 1. ドラッグ&ドロップエリア - ファイルを直感的にドロップ
 * 2. ファイル選択ボタン - 従来の方法でファイル選択
 * 3. ファイル情報表示 - 選択されたファイルの詳細表示
 * 4. バリデーション - ファイル形式・サイズのチェック
 * 5. エラー表示 - 問題がある場合の分かりやすい通知
 * 6. NFT作成ボタン - 選択後の次のステップへの導線
 *
 * 【ユーザビリティの配慮】
 * - 複数の操作方法を提供（ドラッグ&ドロップ + ボタン）
 * - 視覚的フィードバック（ホバー効果、状態変化）
 * - 分かりやすいエラーメッセージ
 * - 処理中の状態表示
 *
 * 【初心者向け解説】
 * - props = 親コンポーネントから受け取る設定値や関数
 * - onDragOver/onDrop = ドラッグ&ドロップ時のイベント処理
 * - disabled = ボタンやフィールドを無効化する属性
 *
 * @param {File} selectedFile - 選択されたファイル
 * @param {string} error - エラーメッセージ
 * @param {boolean} uploading - アップロード中かどうか
 * @param {boolean} isPending - 処理中かどうか
 * @param {function} onFileSelect - ファイル選択時の処理関数
 * @param {function} onDragOver - ドラッグオーバー時の処理関数
 * @param {function} onDrop - ファイルドロップ時の処理関数
 * @param {function} onMintClick - NFT作成ボタンクリック時の処理関数
 * @param {string} currentAccount - 現在接続中のウォレットアドレス
 * @param {string} networkError - ネットワーク関連のエラーメッセージ
 */
const FileUpload = ({
  selectedFile,
  error,
  uploading,
  isPending,
  onFileSelect,
  onDragOver,
  onDrop,
  onMintClick,
  currentAccount,
  networkError
}) => {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* ❌ ファイル選択エラーの表示 */}
      {error && (
        <Alert severity="error" style={{ margin: "10px 0" }}>
          {error}
        </Alert>
      )}

      {/* 📦 ドラッグ&ドロップエリア */}
      <div
        className="nftUplodeBox"
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          border: '2px dashed #2d6395',
          padding: '35px 60px',
          position: 'relative',
          borderRadius: '8px',
          backgroundColor: uploading || isPending ? '#f5f5f5' : 'transparent',
          cursor: uploading || isPending ? 'not-allowed' : 'pointer'
        }}
      >
        <div className="imageLogoAndText">
          {/* 🖼️ 画像アイコン */}
          <img
            src={ImageLogo}
            alt="imagelogo"
            style={{
              opacity: uploading || isPending ? 0.5 : 1,
              width: '64px',
              height: '64px'
            }}
          />
          {/* 📝 案内テキスト */}
          <p style={{
            marginBottom: '0px',
            color: uploading || isPending ? '#999' : '#666'
          }}>
            {uploading || isPending ? 'アップロード中...' : 'ここにドラッグ＆ドロップしてね'}
          </p>
        </div>

        {/* 👻 非表示のファイル入力フィールド（ドラッグ&ドロップエリア全体をクリック可能にする） */}
        <input
          className="nftUploadInput"
          name="imageURL"
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.svg"
          onChange={onFileSelect}
          disabled={uploading || isPending}
          style={{
            opacity: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: uploading || isPending ? 'not-allowed' : 'pointer'
          }}
        />
      </div>

      {/* 🔗 区切り線テキスト */}
      <p style={{ margin: '20px 0 10px 0', color: '#666' }}>または</p>

      {/* 🔘 ファイル選択ボタン（従来の方法） */}
      <Button
        variant="contained"
        component="label"
        disabled={uploading || isPending}
        style={{
          marginBottom: '20px',
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0'
          }
        }}
      >
        ファイルを選択
        {/* 👻 非表示のファイル入力フィールド（ボタン内に埋め込み） */}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.svg"
          onChange={onFileSelect}
          hidden
          disabled={uploading || isPending}
        />
      </Button>

      {/* 📋 選択されたファイル情報表示エリア */}
      {selectedFile && (
        <div style={{
          margin: "20px 0",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          {/* 📁 ファイル情報ヘッダー */}
          <div style={{ marginBottom: '10px' }}>
            <strong>📁 選択されたファイル:</strong>
          </div>

          {/* 📝 ファイル名表示 */}
          <div style={{ marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>{selectedFile.name}</span>
          </div>

          {/* 📊 ファイルサイズ表示 */}
          <div style={{
            fontSize: '0.9em',
            color: '#666',
            marginBottom: '15px'
          }}>
            サイズ: {Math.round(selectedFile.size / 1024)} KB
          </div>

          {/* 🎨 NFT作成ボタン（メインアクション） */}
          <Button
            variant="contained"
            color="primary"
            onClick={onMintClick}
            disabled={uploading || !currentAccount || !!networkError || isPending}
            size="large"
            style={{
              padding: '10px 20px',
              fontSize: '1.1em',
              fontWeight: 'bold'
            }}
          >
            {(uploading || isPending) ? (
              "NFT作成中..."
            ) : (
              "🎨 NFTを作成"
            )}
          </Button>

          {/* ⚠️ 前提条件エラーメッセージ */}
          {(!currentAccount || networkError) && (
            <div style={{
              marginTop: '10px',
              fontSize: '0.8em',
              color: '#ff6b6b'
            }}>
              {!currentAccount && '⚠️ ウォレットを接続してください'}
              {networkError && '⚠️ 正しいネットワークに接続してください'}
            </div>
          )}
        </div>
      )}

      {/* 📖 ファイル形式の説明・制限事項 */}
      <div style={{
        marginTop: '20px',
        fontSize: '0.8em',
        color: '#999',
        lineHeight: '1.4'
      }}>
        対応ファイル形式: JPG, PNG, GIF, SVG<br />
        最大ファイルサイズ: 10MB
      </div>
    </div>
  );
};

export default FileUpload;
