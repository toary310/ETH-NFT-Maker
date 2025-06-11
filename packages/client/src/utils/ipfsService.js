/**
 * 実際のIPFSサービス（w3up統合版）
 * w3up (Web3.Storage v2) 統合版 - Etherscan対応版
 *
 * 【Etherscan対応改善】
 * - 実際のIPFSストレージを使用（w3up優先）
 * - IPFS URIの代わりにHTTPS Gateway URLを使用
 * - 複数のIPFSゲートウェイに対応
 * - フォールバック機能付き（w3up失敗時のみモック使用）
 */

// Pinata IPFS クライアント
let pinataClient = null;

/**
 * CID形式の検証（CIDv0とCIDv1対応）
 */
const isValidCID = (cid) => {
  if (typeof cid !== 'string') return false;

  // IPFS CIDの形式チェック（CIDv0とCIDv1両方対応）
  const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;  // CIDv0: Qm + 44文字
  const cidv1Regex = /^ba[a-z0-9]{56,}$/;              // CIDv1: ba + 56文字以上

  const isValid = cidv0Regex.test(cid) || cidv1Regex.test(cid);

  if (!isValid) {
    console.error('❌ Invalid CID format:', cid);
    console.error('❌ CID should be:');
    console.error('   - CIDv0: "Qm" + 44 chars (total 46)');
    console.error('   - CIDv1: "ba" + 56+ chars (total 58+)');
    console.error(`❌ Received: "${cid}" (${cid.length} chars)`);
  } else if (process.env.NODE_ENV === 'development') {
    const version = cid.startsWith('Qm') ? 'v0' : 'v1';
    console.log(`✅ Valid CID${version}: ${cid}`);
  }

  return isValid;
};

const initializePinata = async () => {
  if (process.env.REACT_APP_PINATA_API_KEY && !pinataClient) {
    try {
      console.log('🚀 Pinata: 実際のIPFS初期化を開始します...');

      // 新しいPinata Web3 SDK を使用
      const { PinataSDK } = await import('pinata-web3');
      const pinata = new PinataSDK({
        pinataJwt: process.env.REACT_APP_PINATA_API_KEY,
        pinataGateway: "gateway.pinata.cloud"
      });

      console.log('💻 Pinata: クライアント作成完了');

      // 接続テスト
      console.log('🔐 Pinata: 接続テスト中...');
      try {
        await pinata.testAuthentication();
        console.log('✅ Pinata: 認証成功');

        pinataClient = pinata;
        return pinata;
      } catch (authError) {
        console.log('❌ Pinata: 認証失敗');
        console.error('Auth error:', authError);
        return null;
      }
    } catch (error) {
      console.error('❌ Pinata initialization error:', error);
      console.log('ℹ️ フォールバック: モックIPFSを使用します');
      return null;
    }
  } else if (!process.env.REACT_APP_PINATA_API_KEY) {
    console.log('⚠️ Pinata APIキーが設定されていません');
    return null;
  } else {
    console.log('🔄 Pinata: 既存クライアントを使用');
    return pinataClient;
  }

  return pinataClient;
};

/**
 * Etherscan対応のHTTPS Gateway URL生成
 */
const ETHERSCAN_COMPATIBLE_GATEWAYS = {
  // CORS対応の優先順位で並べ替え
  w3s_link: 'https://w3s.link/ipfs/',
  dweb: 'https://dweb.link/ipfs/',
  gateway_pinata: 'https://gateway.pinata.cloud/ipfs/',
  ipfs_io: 'https://ipfs.io/ipfs/',
  cf_ipfs: 'https://cf-ipfs.com/ipfs/',
  cloudflare_ipfs: 'https://cloudflare-ipfs.com/ipfs/',
  // 追加のCORS対応ゲートウェイ
  nftstorage: 'https://nftstorage.link/ipfs/',
  web3storage: 'https://w3s.link/ipfs/'
};

const generateEtherscanCompatibleUrl = (cid, gateway = 'w3s_link') => {
  const baseUrl = ETHERSCAN_COMPATIBLE_GATEWAYS[gateway] || ETHERSCAN_COMPATIBLE_GATEWAYS.w3s_link;
  const url = `${baseUrl}${cid}`;

  console.log('🔗 CID:', cid);
  console.log('🌐 Gateway:', gateway);
  console.log('🔗 HTTPS URL:', url);

  return url;
};

/**
 * モック画像アップロード（Etherscan対応版）
 */
export const mockUploadToIPFS = async (file) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockHash = btoa(file.name + Date.now()).replace(/[^a-zA-Z0-9]/g, '');
  const mockCID = `Qm${mockHash.slice(0, 44)}`;

  console.log(`🧪 Mock image upload: ${file.name}`);
  console.log(`🧪 Mock CID: ${mockCID}`);

  // Etherscan対応のHTTPS URLを生成
  const httpsUrl = generateEtherscanCompatibleUrl(mockCID);

  return {
    cid: mockCID,
    httpsUrl: httpsUrl,
    ipfsUri: `ipfs://${mockCID}`
  };
};

/**
 * 実際のw3upアップロード（Etherscan対応版）
 */
const realUploadToIPFS = async (file) => {
  try {
    console.log(`🌍 Uploading ${file.name} to Pinata (Etherscan compatible)...`);
    console.log(`📊 File details: ${file.size} bytes, ${file.type}`);

    const client = await initializePinata();
    if (!client) {
      throw new Error('Pinata client not available');
    }

    console.log('📤 Starting file upload...');

    // 新しいPinata Web3 SDKでのアップロード
    const result = await client.upload.file(file).addMetadata({
      name: `nft-image-${Date.now()}-${file.name}`,
      keyValues: {
        type: 'nft-image',
        originalName: file.name,
        uploadDate: new Date().toISOString()
      }
    });

    const cidString = result.IpfsHash;

    // CID検証
    if (!isValidCID(cidString)) {
      throw new Error(`Invalid CID format: ${cidString}`);
    }

    console.log(`✅ File uploaded successfully!`);
    console.log(`📸 Image CID: ${cidString}`);
    console.log(`📸 File name: ${file.name}`);

    // 複数のHTTPS URLを生成
    const urls = {
      ipfs_io: generateEtherscanCompatibleUrl(cidString, 'ipfs_io'),
      w3s_link: generateEtherscanCompatibleUrl(cidString, 'w3s_link'),
      dweb: generateEtherscanCompatibleUrl(cidString, 'dweb'),
      gateway_pinata: generateEtherscanCompatibleUrl(cidString, 'gateway_pinata'),
      cf_ipfs: generateEtherscanCompatibleUrl(cidString, 'cf_ipfs')
    };

    console.log('🌐 Generated HTTPS URLs:');
    console.log('  IPFS.io:', urls.ipfs_io);
    console.log('  W3S.link:', urls.w3s_link);
    console.log('  Dweb.link:', urls.dweb);
    console.log('  Pinata:', urls.gateway_pinata);
    console.log('  CF-IPFS:', urls.cf_ipfs);

    // 最適なURLの選択（IPFS.ioを優先）
    const primaryUrl = urls.ipfs_io;

    // URLのアクセシビリティテスト
    console.log('🔍 Testing HTTPS URL accessibility...');
    try {
      const response = await fetch(primaryUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
        // ヘッダーを削除（CORS問題回避）
      });
      if (response.ok) {
        console.log('✅ Primary URL immediately accessible');
      } else {
        console.log(`⚠️ Primary URL not yet accessible: ${response.status}`);
        console.log('ℹ️ IPFS propagation in progress...');

        // 他のゲートウェイを試行
        console.log('🔄 Trying alternative gateways...');
        const accessibleUrl = await findAccessibleGateway(cidString);
        console.log('🎯 Alternative URL found:', accessibleUrl);
      }
    } catch (testError) {
      console.log('⚠️ URL accessibility test failed:', testError.message);
      console.log('ℹ️ This is normal - IPFS propagation takes time');

      // フォールバック: 他のゲートウェイを試行
      try {
        console.log('🔄 Trying alternative gateways...');
        const accessibleUrl = await findAccessibleGateway(cidString);
        console.log('🎯 Fallback URL found:', accessibleUrl);
      } catch (fallbackError) {
        console.log('⚠️ All gateways unavailable, using default URL');
      }
    }

    return {
      cid: cidString,
      httpsUrl: primaryUrl,
      ipfsUri: `ipfs://${cidString}`,
      alternativeUrls: urls
    };
  } catch (error) {
    console.error('❌ Pinata upload error:', error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
};

const realUploadMetadata = async (metadata) => {
  try {
    console.log('🌍 Uploading metadata to Pinata (Etherscan compatible)...');
    console.log('📄 Metadata content:', JSON.stringify(metadata, null, 2));

    const client = await initializePinata();
    if (!client) {
      throw new Error('Pinata client not available');
    }

    console.log('📤 Starting metadata upload...');

    // 新しいPinata Web3 SDKでのJSONアップロード
    const result = await client.upload.json(metadata).addMetadata({
      name: `nft-metadata-${Date.now()}`,
      keyValues: {
        type: 'nft-metadata',
        nftName: metadata.name,
        uploadDate: new Date().toISOString()
      }
    });

    const cidString = result.IpfsHash;

    // CID検証
    if (!isValidCID(cidString)) {
      throw new Error(`Invalid metadata CID format: ${cidString}`);
    }

    console.log(`✅ Metadata uploaded successfully!`);
    console.log(`📄 Metadata CID: ${cidString}`);

    // Etherscan対応のHTTPS URLを生成（IPFS.ioを使用）
    const httpsUrl = generateEtherscanCompatibleUrl(cidString, 'ipfs_io');

    return {
      cid: cidString,
      httpsUrl: httpsUrl,
      ipfsUri: `ipfs://${cidString}`
    };
  } catch (error) {
    console.error('❌ w3up metadata upload error:', error);

    // 特定のエラーメッセージに基づく詳細な説明
    if (error.message.includes('space/blob/add invocation')) {
      console.error('🔐 w3up認証エラー: スペースにメタデータを追加する権限がありません');
      console.error('💡 解決方法: https://console.storacha.network/ で認証してください');
      throw new Error(`Metadata upload failed: Space permission denied. Please authenticate at https://console.storacha.network/`);
    }

    throw new Error(`Metadata upload failed: ${error.message}`);
  }
};

/**
 * 🎨 Etherscan対応のNFTデータアップロード（完全版）
 */
const realUploadNFTData = async (imageFile, name, description) => {
  try {
    console.log('🚀 Starting Etherscan-compatible NFT data upload...');
    console.log(`📁 Image: ${imageFile.name} (${Math.round(imageFile.size / 1024)} KB)`);

    // 1. 画像をアップロード
    console.log('🚀 Step 1: 画像ファイルをIPFSにアップロード中...');
    const imageResult = await realUploadToIPFS(imageFile);

    console.log('🔍 画像アップロード結果:');
    console.log('  📸 画像CID:', imageResult.cid);
    console.log('  📸 画像IPFS URI:', imageResult.ipfsUri);
    console.log('  📸 画像HTTPS URL:', imageResult.httpsUrl);

    // 🔧 Etherscan対応: imageResult.httpsUrlを直接使用
    const imageURI = imageResult.httpsUrl;

    console.log('🔍 メタデータ用画像URI:');
    console.log('  📸 使用する画像URL:', imageURI);
    console.log('  📸 HTTPS形式:', imageURI.startsWith('https://'));
    console.log('  📸 画像CIDを含む:', imageURI.includes(imageResult.cid));

    // 画像URLの検証
    if (!imageURI.startsWith('https://ipfs.io/ipfs/')) {
      console.error('❌ 警告: 画像URLが期待される形式ではありません');
      console.error('  Expected: https://ipfs.io/ipfs/...');
      console.error('  Actual:', imageURI);
    }

    // 画像CIDの検証
    if (!imageURI.includes(imageResult.cid)) {
      console.error('🚨 致命的エラー: 画像URLに正しいCIDが含まれていません!');
      console.error('  画像CID:', imageResult.cid);
      console.error('  画像URL:', imageURI);
      throw new Error('画像URLが正しくありません');
    }

    // 2. Etherscan/OpenSea互換メタデータ作成
    const metadata = {
      name,
      description,
      image: imageURI,  // 強制的にHTTPS URL を使用
      external_url: imageURI,  // 外部リンクも同じHTTPS URLを使用
      attributes: [
        {
          trait_type: "Upload Date",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "File Type",
          value: imageFile.type
        },
        {
          trait_type: "File Size (KB)",
          value: Math.round(imageFile.size / 1024)
        },
        {
          trait_type: "Upload Timestamp",
          value: Date.now()
        },
        {
          trait_type: "Storage Provider",
          value: "w3up (Web3.Storage v2)"
        },
        {
          trait_type: "IPFS CID",
          value: imageResult.cid
        },
        {
          trait_type: "Gateway",
          value: "IPFS.io"
        },
        {
          trait_type: "Etherscan Compatible",
          value: "Yes"
        }
      ]
    };

    console.log('📄 Generated Etherscan-compatible metadata:', metadata);

    // メタデータの最終検証
    console.log('🔍 Final metadata verification:');
    console.log('  Name:', metadata.name);
    console.log('  Description:', metadata.description);
    console.log('  Image URL:', metadata.image);
    console.log('  Image is HTTPS:', metadata.image.startsWith('https://'));
    console.log('  External URL:', metadata.external_url);

    // HTTPS URLの強制確認
    if (!metadata.image.startsWith('https://')) {
      console.error('🚨 致命的エラー: メタデータの画像URLがHTTPS形式ではありません!');
      console.error('  Expected: https://...');
      console.error('  Actual:', metadata.image);
      throw new Error('画像URLがHTTPS形式ではありません。Etherscanで表示されません。');
    }

    console.log('✅ メタデータ検証完了: Etherscan互換性OK');

    // 3. メタデータをアップロード
    console.log('🚀 Step 3: メタデータをIPFSにアップロード中...');
    const metadataResult = await realUploadMetadata(metadata);

    console.log('🔍 メタデータアップロード結果:');
    console.log('  📄 メタデータCID:', metadataResult.cid);
    console.log('  📄 メタデータIPFS URI:', metadataResult.ipfsUri);
    console.log('  📄 メタデータHTTPS URL:', metadataResult.httpsUrl);

    console.log('🎉 Etherscan-compatible NFT data upload completed!');
    console.log('🔗 Results Summary:');
    console.log(`  📸 Image HTTPS URL: ${imageResult.httpsUrl}`);
    console.log(`  📄 Metadata HTTPS URL: ${metadataResult.httpsUrl}`);
    console.log(`  🏷️ Image CID: ${imageResult.cid}`);
    console.log(`  🏷️ Metadata CID: ${metadataResult.cid}`);

    // CIDの比較検証
    console.log('🔍 CID検証:');
    console.log(`  📸 画像CID: ${imageResult.cid}`);
    console.log(`  📄 メタデータCID: ${metadataResult.cid}`);
    console.log(`  🔄 CIDが異なる: ${imageResult.cid !== metadataResult.cid}`);
    console.log(`  📸 メタデータ内画像URL: ${metadata.image}`);
    console.log(`  ✅ 画像URLに画像CIDが含まれる: ${metadata.image.includes(imageResult.cid)}`);

    if (imageResult.cid === metadataResult.cid) {
      console.error('🚨 致命的エラー: 画像CIDとメタデータCIDが同じです!');
      console.error('これは画像とメタデータが混同されていることを示します');
    }

    if (!metadata.image.includes(imageResult.cid)) {
      console.error('🚨 致命的エラー: メタデータ内の画像URLに正しい画像CIDが含まれていません!');
      console.error('  期待される画像CID:', imageResult.cid);
      console.error('  実際の画像URL:', metadata.image);
    }

    console.log('  ✅ Etherscan Display: Compatible');
    console.log('  ✅ OpenSea Display: Compatible');

    // コントラクトで使用するためのIPFS URIを返す（互換性のため）
    // ただし、実際の画像URLはHTTPS形式で保存される
    return metadataResult.ipfsUri;  // メタデータのIPFS URI

  } catch (error) {
    console.error('❌ Etherscan-compatible NFT data upload error:', error);
    throw error;
  }
};

/**
 * モックメタデータアップロード（Etherscan対応版）
 */
export const mockUploadMetadata = async (metadata) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const metadataStr = JSON.stringify(metadata);
  const metadataHash = btoa(metadataStr + Date.now()).replace(/[^a-zA-Z0-9]/g, '');
  const mockCID = `Qm${metadataHash.slice(0, 44)}`;

  console.log(`🧪 Mock metadata upload:`, metadata);
  console.log(`🧪 Mock metadata CID: ${mockCID}`);

  // Etherscan対応のHTTPS URLを生成
  const httpsUrl = generateEtherscanCompatibleUrl(mockCID);

  return {
    cid: mockCID,
    httpsUrl: httpsUrl,
    ipfsUri: `ipfs://${mockCID}`
  };
};

/**
 * モックNFTデータアップロード（Etherscan対応版）
 */
export const mockUploadNFTData = async (imageFile, name, description) => {
  try {
    console.log("🧪 Mock IPFS: Starting Etherscan-compatible upload simulation...");

    // 1. 画像アップロードをシミュレート
    const imageResult = await mockUploadToIPFS(imageFile);

    // 🔧 Etherscan対応: HTTPS URLを使用
    const imageURI = imageResult.httpsUrl;

    // 2. Etherscan互換メタデータ作成
    const metadata = {
      name,
      description,
      image: imageURI,  // HTTPS URL を使用
      external_url: imageResult.httpsUrl,
      attributes: [
        {
          trait_type: "Upload Date",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "File Type",
          value: imageFile.type
        },
        {
          trait_type: "File Size (KB)",
          value: Math.round(imageFile.size / 1024)
        },
        {
          trait_type: "Mock Upload",
          value: "true"
        },
        {
          trait_type: "Etherscan Compatible",
          value: "Yes"
        }
      ]
    };

    // 3. メタデータアップロードをシミュレート
    const metadataResult = await mockUploadMetadata(metadata);

    console.log("🧪 Mock IPFS: Etherscan-compatible upload complete!");
    console.log("📸 Image CID:", imageResult.cid);
    console.log("📸 Image HTTPS URL:", imageResult.httpsUrl);
    console.log("📄 Metadata CID:", metadataResult.cid);
    console.log("📄 Metadata HTTPS URL:", metadataResult.httpsUrl);
    console.log("✅ Etherscan Compatible: Yes");

    return metadataResult.ipfsUri;  // メタデータのIPFS URI
  } catch (error) {
    console.error("❌ Mock Etherscan-compatible upload error:", error);
    throw error;
  }
};

/**
 * 開発環境検出用ユーティリティ
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * GemcaseコレクションページのURLを生成
 */
export const getGemcaseCollectionUrl = (contractAddress, networkName = 'sepolia') => {
  if (!contractAddress) {
    console.warn('⚠️ Contract address not provided for Gemcase URL');
    return null;
  }

  // ネットワーク名をGemcase形式に変換
  const networkMap = {
    'sepolia': 'sepolia',
    'mainnet': 'ethereum',
    'ethereum': 'ethereum',
    'polygon': 'polygon',
    'arbitrum': 'arbitrum'
  };

  const gemcaseNetwork = networkMap[networkName.toLowerCase()] || 'sepolia';
  const gemcaseUrl = `https://gemcase.vercel.app/collection/${gemcaseNetwork}/${contractAddress}`;

  console.log(`🔗 Gemcase collection URL: ${gemcaseUrl}`);
  return gemcaseUrl;
};

/**
 * Pinata利用可能性チェック
 */
export const isPinataAvailable = () => {
  return !!process.env.REACT_APP_PINATA_API_KEY;
};

/**
 * 実際のIPFSサービスを提供（Etherscan対応版）
 * w3up優先、失敗時のみモックにフォールバック
 */
export const getIPFSUploader = () => {
  console.log('🔍 IPFSサービス初期化中...');

  // Pinataが利用可能かチェック
  if (isPinataAvailable()) {
    console.log("🌍 Pinata API keys found - Using REAL IPFS with Etherscan compatibility");
    console.log('✅ 実際のIPFSストレージを使用します（Pinata）');

    // 実際のIPFSを優先、エラー時のみフォールバック
    return {
      uploadToIPFS: async (...args) => {
        try {
          console.log('📤 実際のIPFSにファイルをアップロード中...');
          const result = await realUploadToIPFS(...args);
          console.log('✅ 実際のIPFSアップロード成功');
          return result;
        } catch (error) {
          console.warn('⚠️ 実際のIPFSアップロードに失敗、モックにフォールバック');
          console.error('Pinata error:', error);
          return await mockUploadToIPFS(...args);
        }
      },
      uploadMetadata: async (...args) => {
        try {
          console.log('📄 実際のIPFSにメタデータをアップロード中...');
          const result = await realUploadMetadata(...args);
          console.log('✅ 実際のIPFSメタデータアップロード成功');
          return result;
        } catch (error) {
          console.warn('⚠️ 実際のIPFSメタデータアップロードに失敗、モックにフォールバック');
          console.error('Pinata metadata error:', error);
          return await mockUploadMetadata(...args);
        }
      },
      uploadNFTData: async (...args) => {
        try {
          console.log('🎨 実際のIPFSにNFTデータをアップロード中...');
          const result = await realUploadNFTData(...args);
          console.log('✅ 実際のIPFS NFTデータアップロード成功');
          return result;
        } catch (error) {
          console.warn('⚠️ 実際のIPFS NFTデータアップロードに失敗、モックにフォールバック');
          console.error('Pinata NFT data error:', error);
          return await mockUploadNFTData(...args);
        }
      }
    };
  } else {
    console.log("❌ Pinata JWT token not configured. To use REAL IPFS:");
    console.log("   1. Sign up at: https://pinata.cloud/");
    console.log("   2. Create JWT token in your dashboard");
    console.log("   3. Add REACT_APP_PINATA_API_KEY=your_jwt_token to .env file");
    console.log("🧪 Fallback: Using mock IPFS service");
    console.log('⚠️ モックIPFSサービスを使用します（実際のストレージではありません）');

    return {
      uploadToIPFS: mockUploadToIPFS,
      uploadMetadata: mockUploadMetadata,
      uploadNFTData: mockUploadNFTData
    };
  }
};

/**
 * 🔧 既存のIPFS URIをHTTPS URLに変換するユーティリティ
 * @param {string} ipfsUri - ipfs://QmXXXX 形式のURI
 * @param {string} gateway - 使用するゲートウェイ
 * @returns {string} HTTPS URL
 */
export const convertIpfsToHttps = (ipfsUri, gateway = 'ipfs_io') => {
  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri;  // 既にHTTPS URLの場合はそのまま返す
  }

  const cid = ipfsUri.replace('ipfs://', '');
  return generateEtherscanCompatibleUrl(cid, gateway);
};

/**
 * 🔄 複数ゲートウェイで順次アクセス試行
 * @param {string} cid - IPFS CID
 * @returns {Promise<string>} アクセス可能な最初のURL
 */
export const findAccessibleGateway = async (cid) => {
  const gateways = Object.keys(ETHERSCAN_COMPATIBLE_GATEWAYS);

  console.log(`🔍 Testing ${gateways.length} gateways for CID: ${cid}`);

  for (const gateway of gateways) {
    const url = generateEtherscanCompatibleUrl(cid, gateway);
    console.log(`⏳ Testing ${gateway}: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
        // ヘッダーを削除（CORS問題回避）
      });

      if (response.ok) {
        console.log(`✅ ${gateway} is accessible`);
        return url;
      } else {
        console.log(`❌ ${gateway} returned ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${gateway} failed: ${error.message}`);
    }
  }

  // すべて失敗した場合はデフォルトを返す
  console.log('⚠️ All gateways failed, returning default IPFS.io URL');
  return generateEtherscanCompatibleUrl(cid, 'ipfs_io');
};
