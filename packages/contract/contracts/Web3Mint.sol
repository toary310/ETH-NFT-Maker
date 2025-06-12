// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// 🏗️ OpenZeppelinの標準ライブラリをインポート
// 【OpenZeppelinとは？】
// - Ethereumスマートコントラクトの標準ライブラリ
// - セキュリティが検証済みの安全なコード
// - NFT、アクセス制御、セキュリティ機能を提供
// - 世界中の開発者が使用している信頼性の高いライブラリ

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // NFTの標準規格とメタデータ保存機能
import "@openzeppelin/contracts/access/Ownable.sol"; // コントラクト所有者管理機能
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // リエントランシー攻撃防止機能
import "./libraries/Base64.sol"; // Base64エンコーディング用ライブラリ
import "hardhat/console.sol"; // デバッグ用ログ出力機能

/**
 * 🎨 Web3Mint NFTコントラクト - 初学者向け詳細解説版
 *
 * 【このコントラクトの役割】
 * このコントラクトは「デジタル証明書発行機」のような役割を果たします。
 * ユーザーが画像をアップロードすると、その画像に対する唯一無二の
 * デジタル証明書（NFT）を発行し、ブロックチェーン上に永続保存します。
 *
 * 【NFTとは？】
 * Non-Fungible Token = 非代替トークン
 * - 「代替不可能」= 他のものと交換できない唯一のもの
 * - デジタルアート、音楽、動画などの所有権を証明
 * - ブロックチェーン上に記録されるため改ざん不可能
 * - 売買・転送が可能
 *
 * 【IPFSとは？】
 * InterPlanetary File System = 惑星間ファイルシステム
 * - 分散型のファイル保存システム
 * - ファイルは世界中の複数のサーバーに分散保存
 * - 検閲に強く、永続的にファイルが保存される
 * - ファイルはハッシュ値（指紋）で識別される
 *
 * 【主な機能】
 * ✅ NFTの安全なミント（作成・発行）
 * ✅ IPFSハッシュからメタデータ自動生成
 * ✅ 動的なトークンURI生成
 * ✅ 所有者限定の管理機能
 * ✅ セキュリティ対策（リエントランシー攻撃防止）
 * ✅ Etherscan互換性の確保
 * ✅ OpenSea等のマーケットプレイス対応
 *
 * 【初心者向け用語解説】
 * - ミント = NFTを新しく作成すること（「鋳造」の意味）
 * - トークンURI = NFTの詳細情報が保存されている場所のURL
 * - メタデータ = NFTの名前、説明、画像などの詳細情報
 * - ガス = ブロックチェーン上での処理手数料
 * - Wei = Ethereumの最小通貨単位（1 ETH = 10^18 wei）
 */
contract Web3Mint is ERC721URIStorage, Ownable, ReentrancyGuard {
    // 🔧 ライブラリを使用するための宣言
    // 【usingディレクティブとは？】
    // - 特定の型に対してライブラリの関数を使えるようにする
    // - Base64ライブラリをbytes型とstring型で使用可能にする
    using Base64 for bytes;
    using Base64 for string;

    // 📊 状態変数の定義（コントラクトの「記憶装置」）
    // 【状態変数とは？】
    // - ブロックチェーン上に永続的に保存されるデータ
    // - コントラクトの「記憶」として機能
    // - 変更するたびにガス（手数料）が必要
    // - 全世界からアクセス可能

    /// @notice 次にミントされるトークンのID番号
    /// @dev 1から始まり、NFTが作成されるたびに1ずつ増加
    /// 【なぜprivate？】セキュリティのため外部から直接変更できないようにする
    uint256 private _tokenIdCounter;

    /// @notice 最大ミント可能数（変更不可の定数）
    /// @dev このコントラクトで作成できるNFTの最大数（10,000個）
    /// 【constantとは？】一度設定すると変更できない定数（ガス効率が良い）
    uint256 public constant MAX_SUPPLY = 10000;

    /// @notice ミント料金（wei単位）
    /// @dev 1 ETH = 10^18 wei なので、0.001 ETH = 10^15 wei
    /// 【etherキーワード】Solidityの便利機能で自動的にweiに変換
    uint256 public mintPrice = 0.001 ether;

    /// @notice ミント可能状態フラグ
    /// @dev true = ミント可能、false = ミント停止
    /// 【用途】緊急時の停止、メンテナンス、販売期間の制御
    bool public mintingEnabled = true;

    // 📝 NFTの詳細情報を格納する構造体
    /// @notice NFT基本情報構造体
    /// @dev 各NFTに関連する基本データをまとめた構造体
    /// 【構造体とは？】関連するデータをひとまとめにしたカスタムデータ型
    struct NFTInfo {
        string name; // NFTの名前（例："My Awesome Art"）
        string description; // NFTの説明（例："This is my first NFT"）
        string imageURI; // 画像のIPFS URI（例："https://ipfs.io/ipfs/QmXXX..."）
        uint256 timestamp; // 作成日時（Unixタイムスタンプ）
        address minter; // 作成者のウォレットアドレス
    }

    /// @notice トークンIDからNFT情報へのマッピング
    /// @dev mapping = 辞書のようなもの。トークンID → NFT情報の対応表
    /// 【mappingとは？】キーと値のペアを効率的に保存するデータ構造
    mapping(uint256 => NFTInfo) public nftInfo;

    // 📡 イベントの定義（ブロックチェーン上に記録されるログ）
    /// @dev イベント = 何かが起こったときに外部に通知するための仕組み

    /// @notice NFTがミントされたときに発行されるイベント
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string imageURI,
        string metadataURI
    );

    /// @notice IPFSを使ったNFTがミントされたときのイベント
    event IPFSNFTMinted(
        uint256 indexed tokenId,
        address indexed minter,
        string ipfsHash
    );

    /// @notice ミント状態が変更されたときのイベント
    event MintingToggled(bool enabled);

    /// @notice ミント料金が変更されたときのイベント
    event MintPriceUpdated(uint256 newPrice);

    // ⚠️ カスタムエラーの定義（ガス効率向上のため）
    // 【カスタムエラーとは？】
    // - Solidity 0.8.4以降の新機能
    // - 従来のrequire文より大幅にガス効率が良い
    // - エラーの原因を明確に示すことができる
    // - デバッグ時に問題の特定が容易

    /// @notice 最大発行数を超えた場合のエラー
    error MaxSupplyExceeded();

    /// @notice ミントが無効になっている場合のエラー
    error MintingDisabled();

    /// @notice 支払い金額が不足している場合のエラー
    error InsufficientPayment();

    /// @notice 無効なトークンURIが指定された場合のエラー
    error InvalidTokenURI();

    /// @notice 無効なIPFSハッシュが指定された場合のエラー
    error InvalidIPFSHash();

    /// @notice NFT名が空の場合のエラー
    error EmptyName();

    /// @notice NFT説明が空の場合のエラー
    error EmptyDescription();

    /**
     * 🏗️ コンストラクタ（コントラクトが作成される時に1回だけ実行される）
     *
     * 【コンストラクタとは？】
     * - コントラクトがブロックチェーンにデプロイされる時に1回だけ実行される特別な関数
     * - 初期設定を行うために使用される
     * - 一度実行されると二度と呼び出すことはできない
     * - コントラクトの「誕生の瞬間」に実行される
     *
     * 【この関数で行う初期設定】
     * 1. NFTコレクションの名前とシンボルを設定
     * 2. コントラクトの所有者を設定（デプロイした人が所有者になる）
     * 3. トークンIDカウンターの初期化
     * 4. デバッグ用ログの出力
     *
     * 【継承元の初期化】
     * - ERC721("TanyaNFT", "TANYA"): NFTコレクションの基本情報を設定
     * - Ownable(msg.sender): デプロイした人を所有者として設定
     *
     * 【初心者向け解説】
     * - msg.sender = この関数を呼び出した人（デプロイした人）のアドレス
     * - "TanyaNFT" = NFTコレクションの正式名称
     * - "TANYA" = NFTコレクションの略称（シンボル）
     */
    constructor() ERC721("TanyaNFT", "TANYA") Ownable(msg.sender) {
        // 🖥️ デバッグ用のログ出力（開発時にコンソールに表示される）
        // 【console.logとは？】
        // - 開発時にデバッグ情報を出力するための機能
        // - 本番環境では自動的に削除される
        // - ガス使用量に影響しない
        console.log("Web3Mint NFT contract deployed by:", msg.sender);
        console.log("Solidity version: 0.8.28 with IPFS support");

        // 📊 トークンIDを1から開始（0は使わない）
        // 【なぜ1から始める？】
        // - 0は「存在しない」を表すために予約されている
        // - NFT規格では1以上の数値を使用するのが一般的
        // - エラーチェックが容易になる
        _tokenIdCounter = 1;
    }

    /**
     * 🎨 基本的なNFTをミントする関数
     *
     * 【この関数の動作】
     * 1. ミント条件をチェック（有効化、上限、支払い等）
     * 2. 新しいNFTを作成
     * 3. メタデータURIを設定
     * 4. トークンIDをインクリメント
     * 5. イベントを発行
     *
     * @param metadataURI NFTのメタデータが保存されているURI
     * @dev payable = この関数はETHの支払いを受け取れる
     * @dev nonReentrant = リエントランシー攻撃を防ぐ
     */
    function makeAnEpicNFT(
        string memory metadataURI
    ) public payable nonReentrant {
        // 🔒 事前条件のチェック（revert = 条件を満たさない場合処理を中止）
        if (!mintingEnabled) revert MintingDisabled(); // ミントが有効か？
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded(); // 上限を超えていないか？
        if (msg.value < mintPrice) revert InsufficientPayment(); // 支払い金額は十分か？
        if (bytes(metadataURI).length == 0) revert InvalidTokenURI(); // URIは空でないか？

        // 📝 現在のトークンIDを取得
        uint256 tokenId = _tokenIdCounter;

        // 🎨 NFTをミント（作成）
        // _safeMint = 安全にNFTを作成する関数（受け取り手が対応しているかチェック）
        _safeMint(msg.sender, tokenId); // msg.sender = 関数を呼び出した人のアドレス
        _setTokenURI(tokenId, metadataURI); // メタデータURIを設定

        // 📊 次のトークンIDのために番号を増やす
        _tokenIdCounter++;

        // 🖥️ デバッグ用ログ
        console.log(
            "NFT minted! ID: %s, Minter: %s, URI: %s",
            tokenId,
            msg.sender,
            metadataURI
        );

        // 📡 イベントを発行（外部アプリケーションに通知）
        emit NFTMinted(tokenId, msg.sender, metadataURI, metadataURI);
    }

    /**
     * 🌐 IPFSハッシュを使用してNFTをミントする関数
     *
     * 【この関数の特徴】
     * - IPFS（分散ファイルストレージ）の画像からNFTを作成
     * - メタデータを動的に生成
     * - 作成者情報や作成日時も記録
     *
     * 【IPFSとは？】
     * IPFS = InterPlanetary File System
     * - 分散型のファイル保存システム
     * - ファイルはハッシュ値で識別される
     * - 検閲に強く、永続的に保存される
     *
     * @param name NFTの名前
     * @param description NFTの説明
     * @param ipfsHash IPFSファイルのハッシュ値（例：QmXXXXX...）
     */
    function mintIpfsNFT(
        string memory name,
        string memory description,
        string memory ipfsHash
    ) public payable nonReentrant {
        // 🔒 事前条件チェック
        if (!mintingEnabled) revert MintingDisabled();
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (bytes(ipfsHash).length == 0) revert InvalidIPFSHash();

        uint256 tokenId = _tokenIdCounter;

        // 🌐 IPFSハッシュからEtherscan対応HTTPS URIを生成
        // 例："QmXXXX..." → "https://ipfs.io/ipfs/QmXXXX..."
        string memory imageURI = string(
            abi.encodePacked("https://ipfs.io/ipfs/", ipfsHash)
        );

        // 📝 NFT情報をブロックチェーンに保存
        nftInfo[tokenId] = NFTInfo({
            name: name,
            description: description,
            imageURI: imageURI,
            timestamp: block.timestamp, // 現在のブロック時刻
            minter: msg.sender
        });

        // 🔧 動的メタデータURIを生成
        string memory metadataURI = _generateMetadataURI(tokenId);

        // 🎨 NFTをミント
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // 📊 カウンターを増加
        _tokenIdCounter++;

        // 🖥️ ログ出力
        console.log(
            "IPFS NFT minted! ID: %s, Minter: %s, IPFS: %s",
            tokenId,
            msg.sender,
            ipfsHash
        );

        // 📡 イベント発行
        emit IPFSNFTMinted(tokenId, msg.sender, ipfsHash);
        emit NFTMinted(tokenId, msg.sender, imageURI, metadataURI);
    }

    /**
     * 👑 所有者専用：無料でNFTをミント（テスト・プロモーション用）
     *
     * @param to ミント先のウォレットアドレス
     * @param metadataURI NFTのメタデータURI
     * @dev onlyOwner = コントラクト所有者のみ実行可能
     */
    function ownerMint(
        address to,
        string memory metadataURI
    ) public onlyOwner nonReentrant {
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (bytes(metadataURI).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _tokenIdCounter++;

        emit NFTMinted(tokenId, to, metadataURI, metadataURI);
    }

    /**
     * 🌐 IPFSメタデータURIを使用してNFTをミントする関数（Etherscan対応）
     *
     * 【この関数の特徴】
     * - フロントエンドで生成されたIPFSメタデータURIを直接使用
     * - オンチェーンメタデータ生成をスキップ
     * - Etherscan互換性を保証
     *
     * @param name NFTの名前
     * @param description NFTの説明
     * @param ipfsHash 画像のIPFSハッシュ値
     * @param metadataURI メタデータのIPFS URI
     */
    function mintIpfsNFTWithMetadata(
        string memory name,
        string memory description,
        string memory ipfsHash,
        string memory metadataURI
    ) public payable nonReentrant {
        // 🔒 事前条件チェック
        if (!mintingEnabled) revert MintingDisabled();
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (bytes(ipfsHash).length == 0) revert InvalidIPFSHash();
        if (bytes(metadataURI).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _tokenIdCounter;

        // 🌐 IPFSハッシュからHTTPS URIを生成（記録用）
        string memory imageURI = string(
            abi.encodePacked("https://ipfs.io/ipfs/", ipfsHash)
        );

        // 📝 NFT情報をブロックチェーンに保存
        nftInfo[tokenId] = NFTInfo({
            name: name,
            description: description,
            imageURI: imageURI,
            timestamp: block.timestamp,
            minter: msg.sender
        });

        // 🎨 NFTをミント（フロントエンドで生成されたメタデータURIを使用）
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // 📊 カウンターを増加
        _tokenIdCounter++;

        // 🖥️ ログ出力
        console.log("Etherscan-compatible IPFS NFT minted! ID:", tokenId);
        console.log("Minter:", msg.sender);
        console.log("IPFS Hash:", ipfsHash);

        // 📡 イベント発行
        emit IPFSNFTMinted(tokenId, msg.sender, ipfsHash);
        emit NFTMinted(tokenId, msg.sender, imageURI, metadataURI);
    }

    /**
     * 👑 所有者専用：IPFSハッシュで無料ミント
     */
    function ownerMintIpfs(
        address to,
        string memory name,
        string memory description,
        string memory ipfsHash
    ) public onlyOwner nonReentrant {
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(ipfsHash).length == 0) revert InvalidIPFSHash();

        uint256 tokenId = _tokenIdCounter;

        string memory imageURI = string(
            abi.encodePacked("https://ipfs.io/ipfs/", ipfsHash)
        );

        nftInfo[tokenId] = NFTInfo({
            name: name,
            description: description,
            imageURI: imageURI,
            timestamp: block.timestamp,
            minter: to
        });

        string memory metadataURI = _generateMetadataURI(tokenId);

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _tokenIdCounter++;

        emit IPFSNFTMinted(tokenId, to, ipfsHash);
    }

    /**
     * 🔧 動的メタデータURIを生成する内部関数
     *
     * 【この関数の役割】
     * - NFTの詳細情報をJSON形式で作成
     * - Base64エンコードしてデータURIとして返す
     * - OpenSeaなどのNFTマーケットプレイスで表示される情報を作成
     *
     * 【メタデータとは？】
     * NFTの「説明書」のようなもの
     * - 名前、説明、画像、属性などが含まれる
     * - JSON形式で記述される
     * - NFTマーケットプレイスで表示される
     *
     * @param tokenId 対象のトークンID
     * @return Base64エンコードされたJSON metadata URI
     * @dev internal = このコントラクト内でのみ使用可能
     */
    function _generateMetadataURI(
        uint256 tokenId
    ) internal view returns (string memory) {
        NFTInfo memory info = nftInfo[tokenId];

        // 📝 JSON形式のメタデータを構築
        // abi.encodePacked = 複数の文字列を結合する
        string memory json = string(
            abi.encodePacked(
                '{"name": "',
                info.name,
                '",', // NFTの名前
                '"description": "',
                info.description,
                '",', // NFTの説明
                '"image": "',
                info.imageURI,
                '",', // 画像のURI
                '"attributes": [', // 属性情報の開始
                '{"trait_type": "Minter", "value": "',
                _addressToString(info.minter),
                '"},', // 作成者
                '{"trait_type": "Mint Timestamp", "value": ',
                _uint256ToString(info.timestamp),
                "},", // 作成日時
                '{"trait_type": "Token ID", "value": ',
                _uint256ToString(tokenId),
                "}", // トークンID
                "]}" // JSON終了
            )
        );

        // 🔐 JSONをBase64エンコードしてdata URIとして返す
        // data URI = データを直接URLに埋め込む形式
        return Base64.encodeJSON(json);
    }

    /**
     * 🔧 アドレスを文字列に変換するユーティリティ関数
     *
     * 【アドレスとは？】
     * - Ethereumの口座番号のようなもの
     * - 42文字の16進数文字列（0xから始まる）
     * - 例：0x1234567890abcdef...
     *
     * @param addr 変換するウォレットアドレス
     * @return 文字列形式のアドレス
     */
    function _addressToString(
        address addr
    ) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef"; // 16進数の文字
        bytes memory str = new bytes(42); // 42文字の配列を作成
        str[0] = "0";
        str[1] = "x";

        // 👆 各バイトを16進数文字列に変換
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)]; // 上位4ビット
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)]; // 下位4ビット
        }
        return string(str);
    }

    /**
     * 🔧 数値を文字列に変換するユーティリティ関数
     *
     * 【なぜ必要？】
     * Solidityでは数値を直接文字列として使えないため
     * JSONに数値を含める際に文字列変換が必要
     *
     * @param value 変換する数値
     * @return 文字列形式の数値
     */
    function _uint256ToString(
        uint256 value
    ) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        // 📏 桁数を計算
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        // 📝 文字列バッファを作成
        bytes memory buffer = new bytes(digits);

        // 🔄 各桁を文字に変換（右から左へ）
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); // 48 = '0'のASCIIコード
            value /= 10;
        }
        return string(buffer);
    }

    // 📊 情報取得用の関数群（view = 読み取り専用、ガス不要）

    /**
     * 📖 NFT情報を取得
     * @param tokenId 対象のトークンID
     * @return NFTInfo構造体
     */
    function getNFTInfo(uint256 tokenId) public view returns (NFTInfo memory) {
        return nftInfo[tokenId];
    }

    /**
     * 📖 現在のトークンID（次にミントされるID）を取得
     * @return 次のトークンID
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * 📖 総発行数を取得
     * @return 発行済みNFTの総数
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1; // -1する理由：カウンターは次のIDを指しているため
    }

    // 👑 所有者専用の管理機能

    /**
     * 👑 所有者専用：ミント状態の切り替え
     *
     * 【用途】
     * - 緊急時のミント停止
     * - メンテナンス時の一時停止
     * - 販売期間の管理
     *
     * @param enabled true = ミント有効、false = ミント無効
     */
    function toggleMinting(bool enabled) public onlyOwner {
        mintingEnabled = enabled;
        emit MintingToggled(enabled);
    }

    /**
     * 👑 所有者専用：ミント料金の更新
     *
     * 【用途】
     * - 市場価格に応じた料金調整
     * - セール価格の設定
     * - 需要に応じた価格変更
     *
     * @param newPrice 新しいミント料金（wei単位）
     */
    function updateMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * 👑 所有者専用：コントラクトの残高を引き出し
     *
     * 【セキュリティ対策】
     * - nonReentrant でリエントランシー攻撃を防止
     * - call を使用して安全に送金
     * - 残高チェックを実施
     */
    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // 💸 安全な方法でETHを送金
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * 📖 コントラクトの残高を取得
     * @return コントラクトのETH残高（wei単位）
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * 📖 トークンURIを取得（OpenZeppelinの関数をオーバーライド）
     * @param tokenId 対象のトークンID
     * @return トークンのメタデータURI
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * 📖 インターフェースサポート確認（NFT規格の互換性チェック）
     * @param interfaceId チェックするインターフェースID
     * @return サポートしているかどうか
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

/*
🎓 【初心者向け包括的用語解説】

📚 基本概念：
- NFT: Non-Fungible Token = 代替不可能トークン
  → デジタル証明書のようなもの。世界に1つだけの唯一無二のデジタル資産
- IPFS: InterPlanetary File System = 惑星間ファイルシステム
  → 分散型ファイル保存システム。世界中のコンピューターでファイルを共有
- Wei: Ethereumの最小通貨単位（1 ETH = 10^18 wei）
  → 日本円の「銭」のような概念。非常に小さな単位
- ミント: 新しいNFTを作成すること
  → 「鋳造」の意味。コインを作るように新しいNFTを生み出す

🔧 Solidityの概念：
- Contract: スマートコントラクト
  → ブロックチェーン上で自動実行されるプログラム。「デジタル契約書」
- Function: 関数
  → 特定の処理を行うコードブロック。「機能」や「命令」
- Mapping: 辞書型データ構造
  → キー → 値の対応表。電話帳のような仕組み
- Event: イベント
  → ブロックチェーンに記録されるログ情報。「お知らせ」や「通知」
- Modifier: 修飾子
  → 関数の実行条件を定義。「入場券」のような役割

🛡️ セキュリティ概念：
- リエントランシー攻撃: 関数の実行中に再度同じ関数が呼ばれる攻撃
  → 銀行のATMで引き出し中にもう一度引き出しボタンを押すような攻撃
- オーバーフロー: 数値の最大値を超えた際の異常
  → 計算機の桁数を超えて計算がおかしくなる現象
- アクセス制御: 特定の人だけが実行できる機能の制限
  → 「管理者のみ」「会員のみ」のような権限管理

🎨 NFT関連：
- Token ID: 各NFTを識別する一意の番号
  → NFTの「背番号」や「シリアルナンバー」
- Metadata: NFTの詳細情報（名前、説明、画像等）
  → NFTの「説明書」や「仕様書」
- Token URI: メタデータが保存されている場所
  → NFTの詳細情報が書かれた「住所」
- Base64: データをテキスト形式で表現するエンコード方式
  → バイナリデータを文字列として表現する方法

🌐 Web3・ブロックチェーン関連：
- Gas: ブロックチェーン上での処理手数料
  → 車のガソリンのように、処理に必要な「燃料」
- Address: ウォレットアドレス
  → ブロックチェーン上の「住所」や「口座番号」
- Transaction: トランザクション
  → ブロックチェーン上での「取引記録」
- Block: ブロック
  → 複数のトランザクションをまとめた「帳簿のページ」
*/
