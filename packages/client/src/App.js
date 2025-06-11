import './App.css';
import NftUploader from './components/NftUploader/NftUploader';

// 開発環境でEtherscanテストユーティリティを読み込み
if (process.env.NODE_ENV === 'development') {
  import('./utils/etherscanTestUtils');
  import('./utils/etherscanDebugger');
}

function App() {
  return (
    <div className='App'>
      <NftUploader />
    </div>
  );
}

export default App;
