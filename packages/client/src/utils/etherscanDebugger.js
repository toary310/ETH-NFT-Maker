/**
 * 🔍 Etherscan表示問題の詳細調査ツール
 *
 * 【このファイルの役割】
 * このファイルは「NFT表示の探偵」のような役割を果たします。
 * NFTがEtherscan（イーサリアムのブロックエクスプローラー）で正しく表示されない時に、
 * 問題の原因を詳細に調査し、解決方法を提案するデバッグツールです。
 *
 * 【主な機能】
 * 1. コントラクト基本情報の調査
 * 2. メタデータアクセシビリティの確認
 * 3. 画像ファイルの表示可能性チェック
 * 4. IPFS伝播状況の監視
 * 5. Etherscan互換性の評価
 * 6. 問題の自動診断と解決提案
 *
 * 【なぜ必要なのか】
 * - NFTが作成されてもEtherscanで表示されない場合がある
 * - IPFS（分散ストレージ）の伝播に時間がかかることがある
 * - メタデータの形式が正しくない場合がある
 * - CORS（Cross-Origin Resource Sharing）の問題がある場合がある
 *
 * 【初心者向け解説】
 * - Etherscan = イーサリアムブロックチェーンの情報を見るウェブサイト
 * - メタデータ = NFTの詳細情報（名前、説明、画像URLなど）
 * - IPFS = 分散型ファイル保存システム
 * - CORS = ブラウザのセキュリティ機能（異なるドメイン間の通信制限）
 */

// Ethereumブロックチェーンとの通信ライブラリをインポート
import { ethers } from 'ethers';
// スマートコントラクトの設計図（ABI）をインポート
import Web3MintABI from './Web3Mint.json';

/**
 * 🌐 CORS回避用のフェッチ関数
 *
 * 【この関数の役割】
 * ブラウザのCORS制限を回避して、IPFS上のファイルにアクセスするための関数です。
 * 複数のIPFSゲートウェイを順番に試行して、最も応答の良いものを使用します。
 *
 * 【CORSとは？】
 * Cross-Origin Resource Sharing = 異なるドメイン間でのリソース共有制限
 * ブラウザのセキュリティ機能で、悪意のあるサイトからの不正アクセスを防ぐ
 *
 * 【IPFSゲートウェイとは？】
 * IPFS上のファイルにHTTPS経由でアクセスできるサービス
 * 複数のプロバイダーが提供しており、速度や可用性が異なる
 *
 * @param {string} url - アクセス対象のURL
 * @param {object} options - フェッチオプション
 * @returns {Promise<Response>} フェッチレスポンス
 */
const corsAwareFetch = async (url, options = {}) => {
  // 🌐 複数のIPFSゲートウェイを定義（信頼性の高い順）
  const gateways = [
    'https://w3s.link/ipfs/',              // Web3.Storage（高速・信頼性高）
    'https://dweb.link/ipfs/',             // Protocol Labs公式
    'https://gateway.pinata.cloud/ipfs/',  // Pinata（商用サービス）
    'https://nftstorage.link/ipfs/',       // NFT.Storage（NFT特化）
    'https://ipfs.io/ipfs/'                // 公式ゲートウェイ（最後の手段）
  ];

  // 📂 URLからCID（Content Identifier）を抽出
  let cid = null;
  if (url.includes('/ipfs/')) {
    cid = url.split('/ipfs/')[1];
  } else {
    // 🔗 IPFS URLでない場合は直接アクセスを試行
    try {
      return await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
          ...options.headers
        }
      });
    } catch (error) {
      console.warn('Direct fetch failed:', error);
      throw error;
    }
  }

  // 🔄 各ゲートウェイを順次試行（フォールバック機能）
  for (const gateway of gateways) {
    const testUrl = `${gateway}${cid}`;
    console.log(`🧪 Trying gateway: ${testUrl}`);

    try {
      const response = await fetch(testUrl, {
        ...options,
        mode: 'cors',
        headers: {
          ...options.headers
        }
      });

      if (response.ok) {
        console.log(`✅ Success with gateway: ${gateway}`);
        return response;
      } else {
        console.log(`❌ Failed with gateway: ${gateway} (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Error with gateway: ${gateway}`, error.message);
      continue;
    }
  }

  // ❌ すべてのゲートウェイで失敗した場合
  throw new Error('All IPFS gateways failed');
};

/**
 * 画像の存在確認（img要素を使用）
 */
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;

    // 10秒でタイムアウト
    setTimeout(() => resolve(false), 10000);
  });
};

/**
 * 🔍 Etherscan表示問題の包括的調査
 * @param {string} contractAddress - NFTコントラクトアドレス
 * @param {string} tokenId - 調査対象のトークンID
 * @returns {Promise<Object>} 調査結果の詳細レポート
 */
export const investigateEtherscanDisplay = async (contractAddress, tokenId) => {
  console.log('🔍 Etherscan表示問題の詳細調査開始');
  console.log('==========================================');
  console.log('📋 Contract:', contractAddress);
  console.log('🏷️ Token ID:', tokenId);

  const results = {
    timestamp: new Date().toISOString(),
    contractAddress,
    tokenId,
    steps: [],
    issues: [],
    recommendations: [],
    analysis: null
  };

  try {
    // Step 1: コントラクト基本情報調査
    const contractInfo = await investigateContractBasics(contractAddress, tokenId);
    results.steps.push(contractInfo);

    // Step 2: メタデータ詳細調査
    const tokenURI = contractInfo.data?.tokenURI || contractInfo.tokenURI;
    console.log('🔍 Step 1からのtokenURI:', tokenURI);
    const metadataInfo = await investigateMetadata(tokenURI);
    results.steps.push(metadataInfo);

    // Step 3: 画像アクセシビリティ調査
    const imageInfo = await investigateImageAccess(metadataInfo.metadata?.image);
    results.steps.push(imageInfo);

    // Step 4: IPFS伝播状況調査
    const ipfsInfo = await investigateIPFSPropagation(metadataInfo.metadata?.image);
    results.steps.push(ipfsInfo);

    // Step 5: Etherscan互換性調査
    const compatibilityInfo = await investigateEtherscanCompatibility(metadataInfo.metadata);
    results.steps.push(compatibilityInfo);

    // 総合分析
    results.analysis = analyzeResults(results.steps);

  } catch (error) {
    console.error('❌ 調査中にエラーが発生:', error);
    results.issues.push({
      type: 'INVESTIGATION_ERROR',
      message: error.message,
      severity: 'HIGH'
    });
  }

  console.log('📊 調査完了');
  console.log('==========================================');

  return results;
};

/**
 * 🔍 Step 1: コントラクト基本情報調査
 */
const investigateContractBasics = async (contractAddress, tokenId) => {
  console.log('\n🔍 Step 1: コントラクト基本情報調査...');

  const step = {
    step: 1,
    title: 'コントラクト基本情報調査',
    status: 'PENDING',
    data: {},
    issues: []
  };

  try {
    // プロバイダー接続
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, Web3MintABI.abi, provider);

    // 基本情報取得
    const [name, symbol, tokenURI, owner, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId),
      contract.totalSupply()
    ]);

    step.data = {
      name,
      symbol,
      tokenURI,
      owner,
      totalSupply: totalSupply.toString()
    };

    // tokenURIを直接stepオブジェクトにも保存
    step.tokenURI = tokenURI;

    console.log('✅ コントラクト名:', name);
    console.log('✅ シンボル:', symbol);
    console.log('✅ Token URI:', tokenURI);
    console.log('✅ 所有者:', owner);
    console.log('✅ 総発行数:', totalSupply.toString());

    step.status = 'SUCCESS';

    // 基本的な問題チェック
    if (!tokenURI || tokenURI.trim() === '') {
      step.issues.push({
        type: 'EMPTY_TOKEN_URI',
        message: 'Token URIが空です',
        severity: 'HIGH'
      });
    }

  } catch (error) {
    console.error('❌ コントラクト情報取得エラー:', error);
    step.status = 'ERROR';
    step.error = error.message;
    step.issues.push({
      type: 'CONTRACT_ACCESS_ERROR',
      message: `コントラクトアクセスエラー: ${error.message}`,
      severity: 'HIGH'
    });
  }

  return step;
};

/**
 * 🔍 Step 2: メタデータ詳細調査
 */
const investigateMetadata = async (tokenURI) => {
  console.log('\n🔍 Step 2: メタデータ詳細調査...');
  console.log('📄 Token URI:', tokenURI);
  console.log('📄 Token URI type:', typeof tokenURI);
  console.log('📄 Token URI is undefined:', tokenURI === undefined);

  const step = {
    step: 2,
    title: 'メタデータ詳細調査',
    status: 'PENDING',
    data: { tokenURI },
    metadata: null,
    issues: []
  };

  // tokenURIの有効性チェック
  if (!tokenURI || tokenURI === undefined || tokenURI === null || tokenURI.trim() === '') {
    console.log('❌ Token URIが無効です');
    step.status = 'ERROR';
    step.issues.push({
      type: 'INVALID_TOKEN_URI',
      message: `Token URIが無効です: ${tokenURI}`,
      severity: 'HIGH'
    });
    return step;
  }

  try {
    let httpsUrl = tokenURI;

    // IPFS URIをHTTPS URLに変換
    if (tokenURI && tokenURI.startsWith('ipfs://')) {
      const cid = tokenURI.replace('ipfs://', '');
      httpsUrl = `https://ipfs.io/ipfs/${cid}`;
      console.log('🔄 IPFS URI detected, converting to HTTPS...');
    }

    console.log('🔗 HTTPS URL:', httpsUrl);
    step.data.httpsUrl = httpsUrl;

    // メタデータ取得（CORS回避フェッチ使用）
    console.log('🔍 Fetching metadata with CORS-aware fetch...');
    const response = await corsAwareFetch(httpsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const metadata = await response.json();
    step.metadata = metadata;

    console.log('✅ メタデータ取得成功');
    console.log('📄 メタデータ内容:', JSON.stringify(metadata, null, 2));

    step.status = 'SUCCESS';

    // メタデータ構造チェック
    if (!metadata.name) {
      step.issues.push({
        type: 'MISSING_NAME',
        message: 'メタデータに名前が含まれていません',
        severity: 'MEDIUM'
      });
    }

    if (!metadata.description) {
      step.issues.push({
        type: 'MISSING_DESCRIPTION',
        message: 'メタデータに説明が含まれていません',
        severity: 'MEDIUM'
      });
    }

    if (!metadata.image) {
      step.issues.push({
        type: 'MISSING_IMAGE',
        message: 'メタデータに画像URLが含まれていません',
        severity: 'HIGH'
      });
    }

  } catch (error) {
    console.error('❌ メタデータ取得エラー:', error);
    step.status = 'ERROR';
    step.error = error.message;
    step.issues.push({
      type: 'METADATA_FETCH_ERROR',
      message: `メタデータ取得エラー: ${error.message}`,
      severity: 'HIGH'
    });
  }

  return step;
};

/**
 * 🔍 Step 3: 画像アクセシビリティ調査
 */
const investigateImageAccess = async (imageUrl) => {
  console.log('\n🔍 Step 3: 画像アクセシビリティ調査...');
  console.log('🖼️ 画像URL:', imageUrl);

  const step = {
    step: 3,
    title: '画像アクセシビリティ調査',
    status: 'PENDING',
    data: { imageUrl },
    issues: []
  };

  if (!imageUrl || imageUrl === undefined || imageUrl === null) {
    console.log('⚠️ 画像URLが未定義またはnullです');
    step.status = 'SKIPPED';
    step.issues.push({
      type: 'NO_IMAGE_URL',
      message: '画像URLが提供されていません（undefined/null）',
      severity: 'HIGH'
    });
    return step;
  }

  try {
    const startTime = Date.now();

    console.log('🔍 Testing image access with CORS-aware fetch...');
    const response = await corsAwareFetch(imageUrl, {
      method: 'HEAD'
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    step.data.responseTime = responseTime;
    step.data.status = response.status;
    step.data.contentType = response.headers.get('content-type');
    step.data.contentLength = response.headers.get('content-length');

    if (response.ok) {
      console.log(`✅ 画像アクセス成功 (${responseTime}ms)`);
      console.log('📄 Content-Type:', response.headers.get('content-type'));
      console.log('📊 Size:', response.headers.get('content-length'), 'bytes');
      step.status = 'SUCCESS';

      // 画像形式チェック
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        step.issues.push({
          type: 'INVALID_IMAGE_TYPE',
          message: `画像ではないコンテンツタイプ: ${contentType}`,
          severity: 'HIGH'
        });
      }

    } else {
      console.log(`❌ 画像アクセス失敗: ${response.status} ${response.statusText}`);
      step.status = 'ERROR';
      step.issues.push({
        type: 'IMAGE_ACCESS_ERROR',
        message: `画像アクセスエラー: ${response.status} ${response.statusText}`,
        severity: 'HIGH'
      });
    }

  } catch (error) {
    console.error('❌ 画像アクセスエラー（フェッチ）:', error);

    // フォールバック: img要素を使用した画像チェック
    console.log('🔄 フォールバック: img要素を使用した画像チェック...');
    try {
      const imageExists = await checkImageExists(imageUrl);
      if (imageExists) {
        console.log('✅ 画像アクセス成功（img要素）');
        step.status = 'SUCCESS';
        step.passed = true;
        step.data.fallbackMethod = 'img-element';
      } else {
        console.log('❌ 画像アクセス失敗（img要素）');
        step.status = 'ERROR';
        step.issues.push({
          type: 'IMAGE_NOT_ACCESSIBLE',
          message: '画像にアクセスできません（フェッチ・img要素両方で失敗）',
          severity: 'HIGH'
        });
      }
    } catch (fallbackError) {
      console.error('❌ フォールバック画像チェックエラー:', fallbackError);
      step.status = 'ERROR';
      step.error = error.message;
      step.issues.push({
        type: 'IMAGE_FETCH_ERROR',
        message: `画像取得エラー: ${error.message}`,
        severity: 'HIGH'
      });
    }
  }

  return step;
};

/**
 * 🔍 Step 5: Etherscan互換性調査
 */
const investigateEtherscanCompatibility = async (metadata) => {
  console.log('\n🔍 Step 5: Etherscan互換性調査...');

  const step = {
    step: 5,
    title: 'Etherscan互換性調査',
    status: 'PENDING',
    data: {},
    issues: [],
    score: 0,
    maxScore: 8
  };

  if (!metadata) {
    step.status = 'SKIPPED';
    step.issues.push({
      type: 'NO_METADATA',
      message: 'メタデータが利用できません',
      severity: 'HIGH'
    });
    return step;
  }

  console.log('📋 Etherscan互換性チェック開始...');

  // 必須フィールドチェック
  const checks = [
    {
      name: '名前 (必須)',
      check: () => metadata.name && metadata.name.trim() !== '',
      weight: 2,
      severity: 'HIGH'
    },
    {
      name: '説明 (必須)',
      check: () => metadata.description && metadata.description.trim() !== '',
      weight: 2,
      severity: 'HIGH'
    },
    {
      name: '画像URL (必須)',
      check: () => metadata.image && metadata.image.trim() !== '',
      weight: 2,
      severity: 'HIGH'
    },
    {
      name: 'HTTPS画像 (推奨)',
      check: () => metadata.image && typeof metadata.image === 'string' && metadata.image.startsWith('https://'),
      weight: 1,
      severity: 'MEDIUM'
    },
    {
      name: '属性 (推奨)',
      check: () => metadata.attributes && Array.isArray(metadata.attributes) && metadata.attributes.length > 0,
      weight: 1,
      severity: 'LOW'
    }
  ];

  let score = 0;
  const results = [];

  for (const checkItem of checks) {
    const passed = checkItem.check();
    if (passed) {
      score += checkItem.weight;
      console.log(`✅ ${checkItem.name}`);
    } else {
      console.log(`❌ ${checkItem.name}`);
      step.issues.push({
        type: 'COMPATIBILITY_ISSUE',
        message: `${checkItem.name}が不足しています`,
        severity: checkItem.severity
      });
    }

    results.push({
      name: checkItem.name,
      passed,
      weight: checkItem.weight,
      severity: checkItem.severity
    });
  }

  step.data.checks = results;
  step.score = score;
  step.data.compatibilityScore = Math.round((score / step.maxScore) * 100);

  console.log(`📊 互換性スコア: ${step.data.compatibilityScore}% (${score}/${step.maxScore})`);

  if (step.data.compatibilityScore >= 80) {
    step.status = 'SUCCESS';
    console.log('✅ Etherscan互換性: 良好');
  } else if (step.data.compatibilityScore >= 60) {
    step.status = 'WARNING';
    console.log('⚠️ Etherscan互換性: 改善の余地あり');
  } else {
    step.status = 'ERROR';
    console.log('❌ Etherscan互換性: 問題あり');
  }

  return step;
};

/**
 * 📊 総合分析
 */
const analyzeResults = (steps) => {
  console.log('\n📊 総合分析...');

  const analysis = {
    overallStatus: 'UNKNOWN',
    summary: '',
    criticalIssues: [],
    recommendations: [],
    etherscanDisplayProbability: 0
  };

  // 各ステップの状況を分析
  const stepStatuses = steps.map(step => step.status);
  const errorCount = stepStatuses.filter(status => status === 'ERROR').length;
  const warningCount = stepStatuses.filter(status => status === 'WARNING').length;
  const successCount = stepStatuses.filter(status => status === 'SUCCESS').length;

  // 全体的なステータス判定
  if (errorCount === 0 && warningCount === 0) {
    analysis.overallStatus = 'EXCELLENT';
    analysis.summary = 'すべてのチェックが成功しました。Etherscanで正常に表示されるはずです。';
    analysis.etherscanDisplayProbability = 95;
  } else if (errorCount === 0) {
    analysis.overallStatus = 'GOOD';
    analysis.summary = '軽微な問題がありますが、Etherscanで表示される可能性が高いです。';
    analysis.etherscanDisplayProbability = 80;
  } else if (errorCount <= 2) {
    analysis.overallStatus = 'ISSUES';
    analysis.summary = 'いくつかの問題があります。修正が必要です。';
    analysis.etherscanDisplayProbability = 40;
  } else {
    analysis.overallStatus = 'CRITICAL';
    analysis.summary = '重大な問題があります。即座に修正が必要です。';
    analysis.etherscanDisplayProbability = 10;
  }

  // 重要な問題を抽出
  steps.forEach(step => {
    step.issues?.forEach(issue => {
      if (issue.severity === 'HIGH') {
        analysis.criticalIssues.push({
          step: step.title,
          issue: issue.message,
          type: issue.type
        });
      }
    });
  });

  // 推奨事項を生成
  if (analysis.criticalIssues.length > 0) {
    analysis.recommendations.push('🚨 重要: 重大な問題を最優先で修正してください');
  }

  // 互換性スコアベースの推奨事項
  const compatibilityStep = steps.find(step => step.step === 5);
  if (compatibilityStep && compatibilityStep.data.compatibilityScore < 100) {
    analysis.recommendations.push('📋 メタデータ構造を改善してEtherscan互換性を向上させてください');
  }

  // IPFS伝播の推奨事項
  const ipfsStep = steps.find(step => step.step === 4);
  if (ipfsStep && ipfsStep.data.propagationRate < 80) {
    analysis.recommendations.push('🌐 IPFS伝播を改善するため、時間を置いて再度確認してください');
  }

  console.log('📊 総合分析結果:');
  console.log(`   ステータス: ${analysis.overallStatus}`);
  console.log(`   表示確率: ${analysis.etherscanDisplayProbability}%`);
  console.log(`   重要な問題: ${analysis.criticalIssues.length}件`);

  return analysis;
};

/**
 * 🎯 簡易診断（特定のNFTを対象）
 */
export const quickDiagnosis = async (contractAddress, tokenId) => {
  console.log('🎯 簡易診断開始...');

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

    const response = await corsAwareFetch(httpsUrl);
    const metadata = await response.json();

    console.log('📋 簡易診断結果:');
    console.log('✅ 名前:', metadata.name || '❌ なし');
    console.log('✅ 説明:', metadata.description || '❌ なし');
    console.log('✅ 画像:', metadata.image || '❌ なし');
    console.log('✅ HTTPS画像:', metadata.image?.startsWith('https://') ? 'はい' : '❌ いいえ');

    return {
      tokenURI,
      metadata,
      hasName: !!metadata.name,
      hasDescription: !!metadata.description,
      hasImage: !!metadata.image,
      isHttpsImage: metadata.image?.startsWith('https://') || false
    };

  } catch (error) {
    console.error('❌ 簡易診断エラー:', error);
    throw error;
  }
};

/**
 * 🔧 自動修復提案
 */
export const generateFixSuggestions = (investigationResults) => {
  const suggestions = [];

  investigationResults.steps.forEach(step => {
    step.issues?.forEach(issue => {
      switch (issue.type) {
        case 'MISSING_IMAGE':
          suggestions.push({
            priority: 'HIGH',
            action: 'メタデータに画像URLを追加してください',
            code: `metadata.image = "https://ipfs.io/ipfs/YOUR_IMAGE_CID"`
          });
          break;

        case 'INVALID_IMAGE_TYPE':
          suggestions.push({
            priority: 'HIGH',
            action: 'HTTPS形式の画像URLを使用してください',
            code: `metadata.image = "https://ipfs.io/ipfs/YOUR_IMAGE_CID"`
          });
          break;

        case 'POOR_IPFS_PROPAGATION':
          suggestions.push({
            priority: 'MEDIUM',
            action: '時間を置いてIPFS伝播の完了を待ってください',
            note: '通常30分〜2時間で改善されます'
          });
          break;
      }
    });
  });

  return suggestions;
};

/**
 * 🔍 Step 4: IPFS伝播状況調査
 */
const investigateIPFSPropagation = async (imageUrl) => {
  console.log('\n🔍 Step 4: IPFS伝播状況調査...');

  const step = {
    step: 4,
    title: 'IPFS伝播状況調査',
    status: 'PENDING',
    data: {},
    issues: []
  };

  // IPFS CIDを抽出
  let cid = null;
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('/ipfs/')) {
    cid = imageUrl.split('/ipfs/')[1];
    console.log('🏷️ IPFS CID:', cid);
    step.data.cid = cid;
  } else {
    console.log('❌ IPFS伝播調査エラー: IPFS CIDが見つかりません');
    console.log('   画像URL:', imageUrl);
    console.log('   画像URLの型:', typeof imageUrl);
    step.status = 'SKIPPED';
    step.issues.push({
      type: 'NO_IPFS_CID',
      message: `IPFS CIDが見つかりません（画像URL: ${imageUrl || 'undefined'}）`,
      severity: 'MEDIUM'
    });
    return step;
  }

  // 複数のIPFSゲートウェイでテスト
  const gateways = [
    { name: 'ipfs.io', url: `https://ipfs.io/ipfs/${cid}` },
    { name: 'w3s.link', url: `https://w3s.link/ipfs/${cid}` },
    { name: 'dweb.link', url: `https://dweb.link/ipfs/${cid}` },
    { name: 'gateway.pinata.cloud', url: `https://gateway.pinata.cloud/ipfs/${cid}` },
    { name: 'cf-ipfs.com', url: `https://cf-ipfs.com/ipfs/${cid}` },
    { name: 'cloudflare-ipfs.com', url: `https://cloudflare-ipfs.com/ipfs/${cid}` }
  ];

  const results = [];
  let successCount = 0;

  for (const gateway of gateways) {
    console.log(`🧪 Testing ${gateway.name}...`);

    try {
      const startTime = Date.now();
      const response = await corsAwareFetch(gateway.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10秒タイムアウト
      });
      const endTime = Date.now();

      const result = {
        gateway: gateway.name,
        url: gateway.url,
        status: response.status,
        responseTime: endTime - startTime,
        success: response.ok
      };

      if (response.ok) {
        console.log(`✅ ${gateway.name}: OK (${result.responseTime}ms)`);
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

  step.data.gatewayResults = results;
  step.data.successCount = successCount;
  step.data.totalGateways = gateways.length;
  step.data.propagationRate = (successCount / gateways.length * 100).toFixed(1);

  console.log(`📊 伝播状況: ${successCount}/${gateways.length} (${step.data.propagationRate}%)`);

  if (successCount === 0) {
    step.status = 'ERROR';
    step.issues.push({
      type: 'NO_IPFS_ACCESS',
      message: 'すべてのIPFSゲートウェイでアクセスできません',
      severity: 'HIGH'
    });
  } else if (successCount < gateways.length / 2) {
    step.status = 'WARNING';
    step.issues.push({
      type: 'POOR_IPFS_PROPAGATION',
      message: `IPFS伝播率が低いです (${step.data.propagationRate}%)`,
      severity: 'MEDIUM'
    });
  } else {
    step.status = 'SUCCESS';
  }

  return step;
};
