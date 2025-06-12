// Reactの機能をインポート
import { useCallback, useState } from 'react';

/**
 * 📁 ファイルアップロード管理用カスタムフック
 *
 * 【このフックの役割】
 * このフックは「ファイルの品質管理係」のような役割を果たします。
 * ユーザーが選択した画像ファイルが適切かどうかをチェックし、
 * ドラッグ&ドロップやファイル選択の操作を管理します。
 *
 * 【主な責務（やること）】
 * 1. ファイル選択の管理 - どのファイルが選ばれているかを記録
 * 2. ファイルバリデーション - ファイルが条件を満たしているかチェック
 * 3. ドラッグ&ドロップ処理 - 直感的なファイル操作をサポート
 * 4. エラーハンドリング - 問題があるファイルの場合に適切な通知
 *
 * 【バリデーション項目】
 * - ファイル形式：JPG、PNG、GIF、SVGのみ許可
 * - ファイルサイズ：10MB以下に制限
 * - ファイル存在：実際にファイルが選択されているか
 *
 * 【初心者向け解説】
 * - useState = 状態（データ）を管理するReactの機能
 * - useCallback = 関数を最適化して、不要な再作成を防ぐ
 * - バリデーション = 入力データが正しいかどうかのチェック
 * - MIME type = ファイルの種類を表す標準的な形式
 */
const useFileUpload = () => {

  // 📊 状態管理：現在の状況を記録する変数たち
  const [selectedFile, setSelectedFile] = useState(null);  // 選択されたファイル
  const [error, setError] = useState('');                  // エラーメッセージ

  // 📏 ファイルサイズ制限（10MB = 10 × 1024 × 1024 バイト）
  // NFTの画像は適度なサイズに抑えることで、アップロード時間を短縮
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // 🎨 サポートされるファイル形式（MIME type形式）
  // MIME type = ファイルの種類を表す標準的な識別子
  const SUPPORTED_FORMATS = [
    'image/jpeg',    // JPEG形式（.jpg, .jpeg）
    'image/jpg',     // JPG形式（一部ブラウザ用）
    'image/png',     // PNG形式（透明度サポート）
    'image/gif',     // GIF形式（アニメーション可能）
    'image/svg+xml'  // SVG形式（ベクター画像）
  ];

  // 🔍 ファイルバリデーション関数
  // 選択されたファイルが条件を満たしているかチェック
  const validateFile = useCallback((file) => {
    // 📋 ファイル存在チェック
    if (!file) {
      return 'ファイルが選択されていません';
    }

    // 📏 ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズが10MBを超えています';
    }

    // 🎨 ファイル形式チェック
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return 'サポートされていないファイル形式です（JPG、PNG、GIF、SVGのみ）';
    }

    // ✅ 全てのチェックをパス
    return null;
  }, [MAX_FILE_SIZE, SUPPORTED_FORMATS]);

  // 📁 ファイル選択処理関数（ボタンクリックやファイル選択ダイアログ用）
  const handleFileSelect = useCallback((event) => {
    // 📂 選択されたファイルを取得（最初の1つのみ）
    const file = event.target.files[0];

    // 📋 ファイルが選択されていない場合の処理
    if (!file) {
      setSelectedFile(null);  // 選択ファイルをクリア
      setError('');           // エラーメッセージをクリア
      return;
    }

    // 🔍 ファイルのバリデーション（品質チェック）を実行
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);  // エラーメッセージを設定
      setSelectedFile(null);      // 不正なファイルは選択状態にしない
      return;
    }

    // ✅ バリデーション成功：ファイルを正式に選択状態にする
    setError('');           // エラーメッセージをクリア
    setSelectedFile(file);  // ファイルを選択状態に設定
    console.log('📁 ファイル選択:', file.name, `(${Math.round(file.size / 1024)} KB)`);
  }, [validateFile]);

  // 🖱️ ドラッグオーバー処理関数（ファイルをドラッグしている時）
  // ブラウザのデフォルト動作を無効化して、カスタムドロップ処理を有効にする
  const handleDragOver = useCallback((event) => {
    event.preventDefault();    // ブラウザのデフォルト動作を防ぐ
    event.stopPropagation();   // イベントの伝播を停止
  }, []);

  // 📦 ドロップ処理関数（ファイルがドロップされた時）
  const handleDrop = useCallback((event) => {
    event.preventDefault();    // ブラウザのデフォルト動作を防ぐ
    event.stopPropagation();   // イベントの伝播を停止

    // 📂 ドロップされたファイルリストを取得
    const files = event.dataTransfer.files;
    if (files.length === 0) return;  // ファイルがない場合は何もしない

    // 📁 最初のファイルのみを処理（複数ファイルは対応しない）
    const file = files[0];

    // 🔍 ファイルのバリデーション（品質チェック）を実行
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);  // エラーメッセージを設定
      setSelectedFile(null);      // 不正なファイルは選択状態にしない
      return;
    }

    // ✅ バリデーション成功：ファイルを正式に選択状態にする
    setError('');           // エラーメッセージをクリア
    setSelectedFile(file);  // ファイルを選択状態に設定
    console.log('📁 ファイルドロップ:', file.name, `(${Math.round(file.size / 1024)} KB)`);
  }, [validateFile]);

  // 🧹 ファイルクリア関数（選択状態をリセット）
  // NFT作成完了後や、新しいファイルを選択し直したい時に使用
  const clearFile = useCallback(() => {
    setSelectedFile(null);  // 選択ファイルをクリア
    setError('');           // エラーメッセージもクリア
  }, []);

  // 📊 ファイル情報取得関数（選択されたファイルの詳細情報を整理）
  // 他のコンポーネントがファイル情報を必要とする時に使用
  const getFileInfo = useCallback(() => {
    // 📋 ファイルが選択されていない場合はnullを返す
    if (!selectedFile) return null;

    // 📦 ファイル情報をオブジェクト形式で整理して返す
    return {
      name: selectedFile.name,                              // ファイル名
      size: selectedFile.size,                              // ファイルサイズ（バイト）
      sizeKB: Math.round(selectedFile.size / 1024),        // ファイルサイズ（KB、四捨五入）
      type: selectedFile.type,                              // ファイルタイプ（MIME type）
      lastModified: selectedFile.lastModified               // 最終更新日時
    };
  }, [selectedFile]);

  // 🎁 このフックが提供する機能一覧を返す
  // 他のコンポーネントがこのフックを使用する時に受け取れる値と関数
  return {
    // 📊 状態値
    selectedFile,                    // 現在選択されているファイル
    error,                          // 現在のエラーメッセージ

    // 🔧 操作関数
    handleFileSelect,               // ファイル選択処理関数
    handleDragOver,                 // ドラッグオーバー処理関数
    handleDrop,                     // ドロップ処理関数
    clearFile,                      // ファイルクリア関数
    getFileInfo,                    // ファイル情報取得関数

    // 🔍 便利な判定値（boolean）
    isFileSelected: !!selectedFile, // ファイルが選択されているかどうか
    hasError: !!error               // エラーが発生しているかどうか
  };
};

export default useFileUpload;
