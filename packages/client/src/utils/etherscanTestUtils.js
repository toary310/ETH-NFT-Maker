/**
 * Etherscan表示テスト用ユーティリティ
 * NFTがEtherscanで正しく表示されるかテストするためのツール群
 */

import { ethers } from 'ethers';
import Web3MintABI from './Web3Mint.json';

/**
 * 🧪 Etherscan表示テスト実行
 * @param {string} contractAddress - NFTコントラクトアドレス
 * @param {string} tokenId - テスト対象のトークンID
 * @returns {Promise<Object>} テスト結果
 */
export const runEtherscanDisplayTest = async (contractAddress, tokenId) => {
  console.log('🧪 Etherscan表示テスト開始');
  console.log('==========================================');
  console.log('📋 Contract:', contractAddress);
  console.log('🏷️ Token ID:', tokenId);

  const testResults = {
    timestamp: new Date().toISOString(),
    contractAddress,
    tokenId,
    tests: [],
    overallStatus: 'PENDING',
    etherscanCompatibility: false,
    recommendations: []
  };

  try {
    // Test 1: コントラクト接続テスト
    const contractTest = await testContractConnection(contractAddress, tokenId);
    testResults.tests.push(contractTest);

    // Test 2: メタデータ取得テスト
    const tokenURI = contractTest.data?.tokenURI || contractTest.tokenURI;
    console.log('🔍 Test 1からのtokenURI:', tokenURI);
    const metadataTest = await testMetadataRetrieval(tokenURI);
    testResults.tests.push(metadataTest);

    // Test 3: 画像アクセステスト
    const imageTest = await testImageAccess(metadataTest.metadata?.image);
    testResults.tests.push(imageTest);

    // Test 4: Etherscan互換性テスト
    const compatibilityTest = await testEtherscanCompatibility(metadataTest.metadata);
    testResults.tests.push(compatibilityTest);

    // Test 5: IPFS伝播テスト
    const ipfsTest = await testIPFSPropagation(metadataTest.metadata?.image);
    testResults.tests.push(ipfsTest);

    // 総合評価
    testResults.overallStatus = evaluateOverallStatus(testResults.tests);
    testResults.etherscanCompatibility = compatibilityTest.passed;
    testResults.recommendations = generateRecommendations(testResults.tests);

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
    testResults.overallStatus = 'ERROR';
    testResults.error = error.message;
  }

  console.log('📊 テスト完了');
  console.log('==========================================');

  return testResults;
};

/**
 * 🧪 Test 1: コントラクト接続テスト
 */
const testContractConnection = async (contractAddress, tokenId) => {
  console.log('\n🧪 Test 1: コントラクト接続テスト...');

  const test = {
    name: 'コントラクト接続テスト',
    status: 'PENDING',
    passed: false,
    data: {},
    issues: []
  };

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, Web3MintABI.abi, provider);

    // 基本情報取得
    const [name, symbol, tokenURI, owner] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId)
    ]);

    test.data = { name, symbol, tokenURI, owner };
    // tokenURIを直接testオブジェクトにも保存
    test.tokenURI = tokenURI;
    test.passed = true;
    test.status = 'SUCCESS';

    console.log('✅ コントラクト接続成功');
    console.log('📄 Token URI:', tokenURI);

  } catch (error) {
    console.error('❌ コントラクト接続失敗:', error);
    test.status = 'ERROR';
    test.error = error.message;
    test.issues.push({
      type: 'CONTRACT_CONNECTION_FAILED',
      message: `コントラクト接続エラー: ${error.message}`
    });
  }

  return test;
};

/**
 * 🧪 Test 2: メタデータ取得テスト
 */
const testMetadataRetrieval = async (tokenURI) => {
  console.log('\n🧪 Test 2: メタデータ取得テスト...');
  console.log('📄 Token URI:', tokenURI);
  console.log('📄 Token URI type:', typeof tokenURI);

  const test = {
    name: 'メタデータ取得テスト',
    status: 'PENDING',
    passed: false,
    data: { tokenURI },
    metadata: null,
    issues: []
  };

  if (!tokenURI || tokenURI === undefined || tokenURI === null || tokenURI.trim() === '') {
    console.log('❌ Token URIが無効です');
    test.status = 'SKIPPED';
    test.issues.push({
      type: 'NO_TOKEN_URI',
      message: `Token URIが無効です: ${tokenURI}`
    });
    return test;
  }

  try {
    let httpsUrl = tokenURI;

    // IPFS URIをHTTPS URLに変換
    if (tokenURI.startsWith('ipfs://')) {
      const cid = tokenURI.replace('ipfs://', '');
      httpsUrl = `https://ipfs.io/ipfs/${cid}`;
      console.log('🔄 IPFS URI → HTTPS URL変換');
    }

    console.log('🔗 取得URL:', httpsUrl);
    test.data.httpsUrl = httpsUrl;

    const response = await fetch(httpsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
        // Cache-Controlヘッダーを削除（CORS問題回避）
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const metadata = await response.json();
    test.metadata = metadata;
    test.passed = true;
    test.status = 'SUCCESS';

    console.log('✅ メタデータ取得成功');
    console.log('📄 メタデータ:', JSON.stringify(metadata, null, 2));

  } catch (error) {
    console.error('❌ メタデータ取得失敗:', error);
    test.status = 'ERROR';
    test.error = error.message;
    test.issues.push({
      type: 'METADATA_FETCH_FAILED',
      message: `メタデータ取得エラー: ${error.message}`
    });
  }

  return test;
};

/**
 * 🧪 Test 3: 画像アクセステスト
 */
const testImageAccess = async (imageUrl) => {
  console.log('\n🧪 Test 3: 画像アクセステスト...');

  const test = {
    name: '画像アクセステスト',
    status: 'PENDING',
    passed: false,
    data: { imageUrl },
    issues: []
  };

  if (!imageUrl || imageUrl === undefined || imageUrl === null) {
    console.log('⚠️ 画像URLが未定義またはnullです');
    test.status = 'SKIPPED';
    test.issues.push({
      type: 'NO_IMAGE_URL',
      message: '画像URLが提供されていません（undefined/null）'
    });
    return test;
  }

  try {
    console.log('🖼️ 画像URL:', imageUrl);

    const startTime = Date.now();
    const response = await fetch(imageUrl, {
      method: 'HEAD'
      // ヘッダーを削除（CORS問題回避）
    });
    const endTime = Date.now();

    test.data.responseTime = endTime - startTime;
    test.data.status = response.status;
    test.data.contentType = response.headers.get('content-type');

    if (response.ok) {
      test.passed = true;
      test.status = 'SUCCESS';
      console.log(`✅ 画像アクセス成功 (${test.data.responseTime}ms)`);
      console.log('📄 Content-Type:', test.data.contentType);

      // 画像形式チェック
      if (!test.data.contentType?.startsWith('image/')) {
        test.issues.push({
          type: 'INVALID_CONTENT_TYPE',
          message: `画像ではないコンテンツタイプ: ${test.data.contentType}`
        });
      }

    } else {
      test.status = 'ERROR';
      test.issues.push({
        type: 'IMAGE_ACCESS_FAILED',
        message: `画像アクセスエラー: ${response.status} ${response.statusText}`
      });
    }

  } catch (error) {
    console.error('❌ 画像アクセス失敗:', error);
    test.status = 'ERROR';
    test.error = error.message;
    test.issues.push({
      type: 'IMAGE_FETCH_ERROR',
      message: `画像取得エラー: ${error.message}`
    });
  }

  return test;
};

/**
 * 🧪 Test 4: Etherscan互換性テスト
 */
const testEtherscanCompatibility = async (metadata) => {
  console.log('\n🧪 Test 4: Etherscan互換性テスト...');

  const test = {
    name: 'Etherscan互換性テスト',
    status: 'PENDING',
    passed: false,
    data: {},
    score: 0,
    maxScore: 5,
    issues: []
  };

  if (!metadata) {
    test.status = 'SKIPPED';
    test.issues.push({
      type: 'NO_METADATA',
      message: 'メタデータが利用できません'
    });
    return test;
  }

  console.log('📋 Etherscan互換性チェック...');

  // 互換性チェック項目
  const checks = [
    {
      name: '名前',
      check: () => metadata.name && metadata.name.trim() !== '',
      required: true
    },
    {
      name: '説明',
      check: () => metadata.description && metadata.description.trim() !== '',
      required: true
    },
    {
      name: '画像URL',
      check: () => metadata.image && metadata.image.trim() !== '',
      required: true
    },
    {
      name: 'HTTPS画像',
      check: () => metadata.image && typeof metadata.image === 'string' && metadata.image.startsWith('https://'),
      required: false
    },
    {
      name: '属性',
      check: () => metadata.attributes && Array.isArray(metadata.attributes),
      required: false
    }
  ];

  let score = 0;
  const results = [];

  for (const checkItem of checks) {
    const passed = checkItem.check();
    if (passed) {
      score++;
      console.log(`✅ ${checkItem.name}`);
    } else {
      console.log(`❌ ${checkItem.name}`);
      if (checkItem.required) {
        test.issues.push({
          type: 'MISSING_REQUIRED_FIELD',
          message: `必須フィールド「${checkItem.name}」が不足しています`
        });
      }
    }

    results.push({
      name: checkItem.name,
      passed,
      required: checkItem.required
    });
  }

  test.data.checks = results;
  test.score = score;
  test.data.compatibilityScore = Math.round((score / test.maxScore) * 100);

  console.log(`📊 互換性スコア: ${test.data.compatibilityScore}% (${score}/${test.maxScore})`);

  // 合格判定（必須項目がすべて揃っている場合）
  const requiredPassed = results.filter(r => r.required).every(r => r.passed);
  test.passed = requiredPassed;
  test.status = requiredPassed ? 'SUCCESS' : 'ERROR';

  if (test.passed) {
    console.log('✅ Etherscan互換性: 合格');
  } else {
    console.log('❌ Etherscan互換性: 不合格');
  }

  return test;
};

/**
 * 🧪 Test 5: IPFS伝播テスト
 */
const testIPFSPropagation = async (imageUrl) => {
  console.log('\n🧪 Test 5: IPFS伝播テスト...');

  const test = {
    name: 'IPFS伝播テスト',
    status: 'PENDING',
    passed: false,
    data: {},
    issues: []
  };

  // IPFS CIDを抽出
  let cid = null;
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('/ipfs/')) {
    cid = imageUrl.split('/ipfs/')[1];
    console.log('🏷️ IPFS CID:', cid);
    test.data.cid = cid;
  } else {
    console.log('❌ IPFS CIDが見つかりません');
    console.log('   画像URL:', imageUrl);
    console.log('   画像URLの型:', typeof imageUrl);
    test.status = 'SKIPPED';
    test.issues.push({
      type: 'NO_IPFS_CID',
      message: `IPFS CIDが見つかりません（画像URL: ${imageUrl || 'undefined'}）`
    });
    return test;
  }

  // 主要なIPFSゲートウェイでテスト
  const gateways = [
    { name: 'ipfs.io', url: `https://ipfs.io/ipfs/${cid}` },
    { name: 'w3s.link', url: `https://w3s.link/ipfs/${cid}` },
    { name: 'dweb.link', url: `https://dweb.link/ipfs/${cid}` }
  ];

  const results = [];
  let successCount = 0;

  for (const gateway of gateways) {
    console.log(`🧪 Testing ${gateway.name}...`);

    try {
      const response = await fetch(gateway.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
        // ヘッダーを削除（CORS問題回避）
      });

      const result = {
        gateway: gateway.name,
        url: gateway.url,
        status: response.status,
        success: response.ok
      };

      if (response.ok) {
        console.log(`✅ ${gateway.name}: OK`);
        successCount++;
      } else {
        console.log(`❌ ${gateway.name}: ${response.status}`);
      }

      results.push(result);

    } catch (error) {
      console.log(`❌ ${gateway.name}: ${error.message}`);
      results.push({
        gateway: gateway.name,
        url: gateway.url,
        success: false,
        error: error.message
      });
    }
  }

  test.data.gatewayResults = results;
  test.data.successCount = successCount;
  test.data.totalGateways = gateways.length;
  test.data.propagationRate = (successCount / gateways.length * 100).toFixed(1);

  console.log(`📊 伝播率: ${test.data.propagationRate}% (${successCount}/${gateways.length})`);

  // 合格判定（50%以上のゲートウェイでアクセス可能）
  test.passed = successCount >= Math.ceil(gateways.length / 2);
  test.status = test.passed ? 'SUCCESS' : 'WARNING';

  if (!test.passed) {
    test.issues.push({
      type: 'POOR_IPFS_PROPAGATION',
      message: `IPFS伝播率が低いです (${test.data.propagationRate}%)`
    });
  }

  return test;
};

/**
 * 📊 総合評価
 */
const evaluateOverallStatus = (tests) => {
  const statuses = tests.map(test => test.status);
  const errorCount = statuses.filter(status => status === 'ERROR').length;
  const warningCount = statuses.filter(status => status === 'WARNING').length;

  if (errorCount === 0 && warningCount === 0) {
    return 'EXCELLENT';
  } else if (errorCount === 0) {
    return 'GOOD';
  } else if (errorCount <= 2) {
    return 'ISSUES';
  } else {
    return 'CRITICAL';
  }
};

/**
 * 💡 推奨事項生成
 */
const generateRecommendations = (tests) => {
  const recommendations = [];

  tests.forEach(test => {
    test.issues?.forEach(issue => {
      switch (issue.type) {
        case 'MISSING_REQUIRED_FIELD':
          recommendations.push({
            priority: 'HIGH',
            action: 'メタデータの必須フィールドを追加してください',
            details: issue.message
          });
          break;

        case 'IMAGE_ACCESS_FAILED':
          recommendations.push({
            priority: 'HIGH',
            action: '画像URLを修正してください',
            details: '画像にアクセスできません'
          });
          break;

        case 'POOR_IPFS_PROPAGATION':
          recommendations.push({
            priority: 'MEDIUM',
            action: 'IPFS伝播の完了を待ってください',
            details: '時間を置いて再度確認してください'
          });
          break;

        case 'INVALID_CONTENT_TYPE':
          recommendations.push({
            priority: 'MEDIUM',
            action: '正しい画像ファイルを使用してください',
            details: 'コンテンツタイプが画像ではありません'
          });
          break;
      }
    });
  });

  return recommendations;
};

/**
 * 🎯 簡易テスト（特定のNFTを対象）
 */
export const quickTest = async (contractAddress, tokenId) => {
  console.log('🎯 簡易テスト開始...');

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, Web3MintABI.abi, provider);

    const tokenURI = await contract.tokenURI(tokenId);
    console.log('📄 Token URI:', tokenURI);

    // メタデータ取得
    let httpsUrl = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      httpsUrl = `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`;
    }

    const response = await fetch(httpsUrl);
    const metadata = await response.json();

    console.log('📋 簡易テスト結果:');
    console.log('✅ 名前:', metadata.name || '❌ なし');
    console.log('✅ 説明:', metadata.description || '❌ なし');
    console.log('✅ 画像:', metadata.image || '❌ なし');
    console.log('✅ HTTPS画像:', (metadata.image && typeof metadata.image === 'string' && metadata.image.startsWith('https://')) ? 'はい' : '❌ いいえ');

    const isEtherscanCompatible = !!(
      metadata.name &&
      metadata.description &&
      metadata.image &&
      metadata.image.startsWith('https://')
    );

    console.log('🎯 Etherscan互換性:', isEtherscanCompatible ? '✅ 互換' : '❌ 非互換');

    return {
      tokenURI,
      metadata,
      isEtherscanCompatible,
      hasName: !!metadata.name,
      hasDescription: !!metadata.description,
      hasImage: !!metadata.image,
      isHttpsImage: (metadata.image && typeof metadata.image === 'string' && metadata.image.startsWith('https://')) || false
    };

  } catch (error) {
    console.error('❌ 簡易テストエラー:', error);
    throw error;
  }
};
