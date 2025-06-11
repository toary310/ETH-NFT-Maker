import { useState, useCallback } from 'react';

/**
 * ファイルアップロード用カスタムフック
 * 責務：
 * - ファイル選択の管理
 * - ファイルバリデーション
 * - ドラッグ&ドロップ処理
 */
const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  // ファイルサイズ制限（10MB）
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // サポートされるファイル形式
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];

  // ファイルバリデーション
  const validateFile = useCallback((file) => {
    if (!file) {
      return 'ファイルが選択されていません';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズが10MBを超えています';
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return 'サポートされていないファイル形式です（JPG、PNG、GIF、SVGのみ）';
    }

    return null;
  }, [MAX_FILE_SIZE, SUPPORTED_FORMATS]);

  // ファイル選択処理
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setError('');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    console.log('📁 ファイル選択:', file.name, `(${Math.round(file.size / 1024)} KB)`);
  }, [validateFile]);

  // ドラッグオーバー処理
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // ドロップ処理
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    console.log('📁 ファイルドロップ:', file.name, `(${Math.round(file.size / 1024)} KB)`);
  }, [validateFile]);

  // ファイルクリア
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError('');
  }, []);

  // ファイル情報の取得
  const getFileInfo = useCallback(() => {
    if (!selectedFile) return null;

    return {
      name: selectedFile.name,
      size: selectedFile.size,
      sizeKB: Math.round(selectedFile.size / 1024),
      type: selectedFile.type,
      lastModified: selectedFile.lastModified
    };
  }, [selectedFile]);

  return {
    selectedFile,
    error,
    handleFileSelect,
    handleDragOver,
    handleDrop,
    clearFile,
    getFileInfo,
    isFileSelected: !!selectedFile,
    hasError: !!error
  };
};

export default useFileUpload;
