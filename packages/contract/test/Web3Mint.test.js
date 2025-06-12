// 🧪 Chaiテストライブラリをインポート（アサーション用）
const { expect } = require("chai");
// 📦 Hardhat環境のEthers.jsをインポート
const { ethers } = require("hardhat");

/**
 * 🧪 Web3Mint NFTコントラクト テストスイート
 *
 * 【このテストファイルの役割】
 * このファイルは「コントラクトの品質保証部門」のような役割を果たします。
 * スマートコントラクトの全ての機能が正しく動作することを自動的に検証し、
 * バグや予期しない動作を早期に発見します。
 *
 * 【テストの重要性】
 * - スマートコントラクトは一度デプロイすると修正が困難
 * - 金銭的な価値を扱うため、バグは重大な損失につながる
 * - 自動テストにより人的ミスを防ぐ
 * - リファクタリング時の安全性を保証
 *
 * 【テスト項目】
 * 1. デプロイメント - 初期設定の確認
 * 2. ミント機能 - NFT作成機能のテスト
 * 3. IPFS機能 - 分散ストレージ対応のテスト
 * 4. 所有者機能 - 管理者権限のテスト
 * 5. 供給制限 - 発行上限の管理テスト
 * 6. エラーハンドリング - 異常系のテスト
 *
 * 【初心者向け解説】
 * - describe = テストグループの定義
 * - it = 個別のテストケース
 * - expect = 期待値との比較
 * - beforeEach = 各テスト前に実行される準備処理
 */
describe("Web3Mint", function () {
  // 📝 テストで使用する変数を宣言
  let web3Mint;    // デプロイされたコントラクトインスタンス
  let owner;       // コントラクト所有者アカウント
  let user1;       // テストユーザー1
  let user2;       // テストユーザー2

  // 🔄 各テストケース実行前の準備処理
  beforeEach(async function () {
    // 👥 テスト用アカウントを取得
    [owner, user1, user2] = await ethers.getSigners();

    // 🚀 コントラクトをデプロイ
    const Web3Mint = await ethers.getContractFactory("Web3Mint");
    web3Mint = await Web3Mint.deploy();
    await web3Mint.waitForDeployment(); // Ethers.js v6の新しい構文
    // 【なぜ毎回デプロイ？】
    // - 各テストが独立して実行される
    // - テスト間での状態の影響を排除
    // - 一貫性のあるテスト環境を保証
  });

  // 🏗️ デプロイメントテスト（初期設定の確認）
  describe("Deployment", function () {
    // ✅ 所有者が正しく設定されているかテスト
    it("Should set the right owner", async function () {
      expect(await web3Mint.owner()).to.equal(owner.address);
    });

    // ✅ NFTコレクションの名前とシンボルが正しいかテスト
    it("Should have correct name and symbol", async function () {
      expect(await web3Mint.name()).to.equal("TanyaNFT");
      expect(await web3Mint.symbol()).to.equal("TANYA");
    });

    // ✅ 初期設定値が正しいかテスト
    it("Should have correct initial settings", async function () {
      expect(await web3Mint.mintPrice()).to.equal(ethers.parseEther("0.001"));  // ミント価格
      expect(await web3Mint.MAX_SUPPLY()).to.equal(10000);                      // 最大供給量
      expect(await web3Mint.mintingEnabled()).to.equal(true);                   // ミント有効状態
      expect(await web3Mint.getCurrentTokenId()).to.equal(1);                   // 次のトークンID
      expect(await web3Mint.totalSupply()).to.equal(0);                         // 現在の総供給量
    });
  });

  // 🎨 ミント機能テスト（NFT作成機能の検証）
  describe("Minting", function () {
    // 📝 テスト用のメタデータURIを定義
    const testURI = "https://example.com/metadata/1.json";

    // ✅ 正常なミント処理のテスト
    it("Should mint NFT with correct payment", async function () {
      const mintPrice = await web3Mint.mintPrice();

      // NFTミント実行とイベント発生の確認
      await expect(
        web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice })
      ).to.emit(web3Mint, "NFTMinted")
        .withArgs(1, user1.address, testURI, testURI); // トークンID、所有者、URI、メタデータURI

      // ミント後の状態確認
      expect(await web3Mint.ownerOf(1)).to.equal(user1.address);    // 所有者確認
      expect(await web3Mint.tokenURI(1)).to.equal(testURI);         // メタデータURI確認
      expect(await web3Mint.totalSupply()).to.equal(1);             // 総供給量確認
      // 【なぜこれらの確認が重要？】
      // - NFTが正しい人に発行されたか
      // - メタデータが正しく設定されたか
      // - 供給量カウンターが正しく更新されたか
    });

    // ❌ 支払い不足エラーのテスト
    it("Should fail with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.0005");  // 必要額の半分

      await expect(
        web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: insufficientPayment })
      ).to.be.revertedWithCustomError(web3Mint, "InsufficientPayment");
      // 【なぜこのテストが必要？】
      // - 不正な安価でのミントを防ぐ
      // - コントラクトの収益を保護
      // - セキュリティホールの確認
    });

    // ❌ 空のURIエラーのテスト
    it("Should fail with empty URI", async function () {
      const mintPrice = await web3Mint.mintPrice();

      await expect(
        web3Mint.connect(user1).makeAnEpicNFT("", { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "InvalidTokenURI");
      // 【なぜ空URIを拒否？】
      // - NFTにはメタデータが必須
      // - 無効なNFTの作成を防ぐ
      // - ユーザー体験の向上
    });

    // ❌ ミント無効化時のエラーテスト
    it("Should fail when minting is disabled", async function () {
      await web3Mint.toggleMinting(false);  // ミント機能を無効化
      const mintPrice = await web3Mint.mintPrice();

      await expect(
        web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "MintingDisabled");
      // 【ミント無効化の用途】
      // - 緊急時の停止機能
      // - メンテナンス時の制御
      // - 段階的なリリース管理
    });
  });

  describe("IPFS Minting", function () {
    const testName = "Test IPFS NFT";
    const testDescription = "This is a test IPFS NFT";
    const testIPFSHash = "QmYFNwqT8eZ6FybqwYS8e1X2Zl5TQaB3hMxRbC7PvKdUfG";

    it("Should mint IPFS NFT with correct payment", async function () {
      const mintPrice = await web3Mint.mintPrice();

      await expect(
        web3Mint.connect(user1).mintIpfsNFT(testName, testDescription, testIPFSHash, { value: mintPrice })
      ).to.emit(web3Mint, "IPFSNFTMinted")
        .withArgs(1, user1.address, testIPFSHash);

      expect(await web3Mint.ownerOf(1)).to.equal(user1.address);

      const nftInfo = await web3Mint.getNFTInfo(1);
      expect(nftInfo.name).to.equal(testName);
      expect(nftInfo.description).to.equal(testDescription);
      expect(nftInfo.imageURI).to.equal(`ipfs://${testIPFSHash}`);
      expect(nftInfo.minter).to.equal(user1.address);
    });

    it("Should fail with empty name", async function () {
      const mintPrice = await web3Mint.mintPrice();

      await expect(
        web3Mint.connect(user1).mintIpfsNFT("", testDescription, testIPFSHash, { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "EmptyName");
    });

    it("Should fail with empty description", async function () {
      const mintPrice = await web3Mint.mintPrice();

      await expect(
        web3Mint.connect(user1).mintIpfsNFT(testName, "", testIPFSHash, { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "EmptyDescription");
    });

    it("Should fail with empty IPFS hash", async function () {
      const mintPrice = await web3Mint.mintPrice();

      await expect(
        web3Mint.connect(user1).mintIpfsNFT(testName, testDescription, "", { value: mintPrice })
      ).to.be.revertedWithCustomError(web3Mint, "InvalidIPFSHash");
    });
  });

  describe("Owner functions", function () {
    const testURI = "https://example.com/metadata/owner.json";
    const testIPFSHash = "QmTestOwnerIPFSHash";

    it("Should allow owner to mint for free", async function () {
      await expect(
        web3Mint.ownerMint(user1.address, testURI)
      ).to.emit(web3Mint, "NFTMinted")
        .withArgs(1, user1.address, testURI, testURI); // 4個の引数に修正

      expect(await web3Mint.ownerOf(1)).to.equal(user1.address);
    });

    it("Should allow owner to mint IPFS for free", async function () {
      await expect(
        web3Mint.ownerMintIpfs(user1.address, "Owner IPFS NFT", "Special NFT", testIPFSHash)
      ).to.emit(web3Mint, "IPFSNFTMinted")
        .withArgs(1, user1.address, testIPFSHash);

      const nftInfo = await web3Mint.getNFTInfo(1);
      expect(nftInfo.name).to.equal("Owner IPFS NFT");
      expect(nftInfo.imageURI).to.equal(`ipfs://${testIPFSHash}`);
    });

    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.002");

      await expect(web3Mint.updateMintPrice(newPrice))
        .to.emit(web3Mint, "MintPriceUpdated")
        .withArgs(newPrice);

      expect(await web3Mint.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to toggle minting", async function () {
      await expect(web3Mint.toggleMinting(false))
        .to.emit(web3Mint, "MintingToggled")
        .withArgs(false);

      expect(await web3Mint.mintingEnabled()).to.equal(false);
    });

    it("Should allow owner to withdraw", async function () {
      // ユーザーがミントして残高を作る
      const mintPrice = await web3Mint.mintPrice();
      await web3Mint.connect(user1).makeAnEpicNFT(testURI, { value: mintPrice });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      await expect(web3Mint.withdraw())
        .to.changeEtherBalance(owner, mintPrice);
    });

    it("Should fail when non-owner tries to use owner functions", async function () {
      await expect(
        web3Mint.connect(user1).ownerMint(user2.address, testURI)
      ).to.be.revertedWithCustomError(web3Mint, "OwnableUnauthorizedAccount");

      await expect(
        web3Mint.connect(user1).updateMintPrice(ethers.parseEther("0.002"))
      ).to.be.revertedWithCustomError(web3Mint, "OwnableUnauthorizedAccount");
    });
  });

  describe("Supply limits", function () {
    it("Should track token IDs correctly", async function () {
      const testURI1 = "https://example.com/1.json";
      const testURI2 = "https://example.com/2.json";
      const mintPrice = await web3Mint.mintPrice();

      // 最初のミント
      await web3Mint.connect(user1).makeAnEpicNFT(testURI1, { value: mintPrice });
      expect(await web3Mint.getCurrentTokenId()).to.equal(2);
      expect(await web3Mint.totalSupply()).to.equal(1);

      // 2番目のミント
      await web3Mint.connect(user2).makeAnEpicNFT(testURI2, { value: mintPrice });
      expect(await web3Mint.getCurrentTokenId()).to.equal(3);
      expect(await web3Mint.totalSupply()).to.equal(2);
    });
  });
});
