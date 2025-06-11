import React from 'react';
import { Button, Alert } from '@mui/material';
import ImageLogo from '../image.svg';

/**
 * ファイルアップロードコンポーネント
 * 責務：
 * - ファイル選択UI
 * - ドラッグ&ドロップエリア
 * - ファイル情報表示
 * - バリデーションエラー表示
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
      {/* ファイル選択エラー */}
      {error && (
        <Alert severity="error" style={{ margin: "10px 0" }}>
          {error}
        </Alert>
      )}

      {/* ドラッグ&ドロップエリア */}
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
          <img 
            src={ImageLogo} 
            alt="imagelogo" 
            style={{ 
              opacity: uploading || isPending ? 0.5 : 1,
              width: '64px',
              height: '64px'
            }} 
          />
          <p style={{ 
            marginBottom: '0px',
            color: uploading || isPending ? '#999' : '#666'
          }}>
            {uploading || isPending ? 'アップロード中...' : 'ここにドラッグ＆ドロップしてね'}
          </p>
        </div>
        
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
      
      <p style={{ margin: '20px 0 10px 0', color: '#666' }}>または</p>
      
      {/* ファイル選択ボタン */}
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
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.svg"
          onChange={onFileSelect}
          hidden
          disabled={uploading || isPending}
        />
      </Button>

      {/* 選択されたファイル情報 */}
      {selectedFile && (
        <div style={{ 
          margin: "20px 0", 
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>📁 選択されたファイル:</strong>
          </div>
          
          <div style={{ marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>{selectedFile.name}</span>
          </div>
          
          <div style={{ 
            fontSize: '0.9em', 
            color: '#666',
            marginBottom: '15px'
          }}>
            サイズ: {Math.round(selectedFile.size / 1024)} KB
          </div>
          
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

      {/* ファイル形式の説明 */}
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
