// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/Base64.sol";
import "hardhat/console.sol";

/**
 * @title Web3Mint
 * @author UNCHAIN ETH-NFT-Maker Team
 * @notice NFTを作成・ミントするためのスマートコントラクト（IPFS対応）
 * @dev OpenZeppelin v5.3.0に対応したERC721実装（Solidity 0.8.28対応）
 * 
 * 主な機能:
 * - NFTの安全なミント（IPFS対応）
 * - 動的メタデータ生成（Base64エンコード）
 * - トークンURIの設定
 * - 所有者限定機能
 * - リエントランシー攻撃の防止
 */
contract Web3Mint is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Base64 for bytes;
    using Base64 for string;

    /// @notice 次にミントされるトークンのID
    uint256 private _tokenIdCounter;
    
    /// @notice 最大ミント可能数
    uint256 public constant MAX_SUPPLY = 10000;
    
    /// @notice ミント料金（wei単位）
    uint256 public mintPrice = 0.001 ether;
    
    /// @notice ミント可能状態
    bool public mintingEnabled = true;

    /// @notice ベースNFT情報
    struct NFTInfo {
        string name;
        string description;
        string imageURI;
        uint256 timestamp;
        address minter;
    }

    /// @notice トークンIDからNFT情報へのマッピング
    mapping(uint256 => NFTInfo) public nftInfo;

    /// @dev イベント定義
    event NFTMinted(uint256 indexed tokenId, address indexed minter, string imageURI, string metadataURI);
    event IPFSNFTMinted(uint256 indexed tokenId, address indexed minter, string ipfsHash);
    event MintingToggled(bool enabled);
    event MintPriceUpdated(uint256 newPrice);

    /// @dev カスタムエラー定義（ガス効率の向上）
    error MaxSupplyExceeded();
    error MintingDisabled();
    error InsufficientPayment();
    error InvalidTokenURI();
    error InvalidIPFSHash();
    error EmptyName();
    error EmptyDescription();

    /**
     * @notice コンストラクタ
     * @dev ERC721とOwnableを初期化
     */
    constructor() ERC721("TanyaNFT", "TANYA") Ownable(msg.sender) {
        console.log("Web3Mint NFT contract deployed by:", msg.sender);
        console.log("Solidity version: 0.8.28 with IPFS support");
        _tokenIdCounter = 1; // トークンIDを1から開始
    }

    /**
     * @notice 基本的なNFTをミントする
     * @param metadataURI NFTのメタデータURI
     * @dev リエントランシー攻撃を防ぐためにnonReentrantを使用
     */
    function makeAnEpicNFT(string memory metadataURI) public payable nonReentrant {
        if (!mintingEnabled) revert MintingDisabled();
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (bytes(metadataURI).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _tokenIdCounter;
        
        // NFTをミント
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // トークンIDを増加
        _tokenIdCounter++;
        
        console.log(
            "NFT minted! ID: %s, Minter: %s, URI: %s",
            tokenId,
            msg.sender,
            metadataURI
        );
        
        emit NFTMinted(tokenId, msg.sender, metadataURI, metadataURI);
    }

    /**
     * @notice IPFSハッシュを使用してNFTをミント
     * @param name NFTの名前
     * @param description NFTの説明
     * @param ipfsHash IPFSハッシュ（QmXXXXX...形式）
     * @dev IPFSハッシュから完全なURIとメタデータを動的生成
     */
    function mintIpfsNFT(
        string memory name,
        string memory description,
        string memory ipfsHash
    ) public payable nonReentrant {
        if (!mintingEnabled) revert MintingDisabled();
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (bytes(ipfsHash).length == 0) revert InvalidIPFSHash();

        uint256 tokenId = _tokenIdCounter;
        
        // IPFSイメージURIを生成
        string memory imageURI = string(abi.encodePacked("ipfs://", ipfsHash));
        
        // NFT情報を保存
        nftInfo[tokenId] = NFTInfo({
            name: name,
            description: description,
            imageURI: imageURI,
            timestamp: block.timestamp,
            minter: msg.sender
        });
        
        // 動的メタデータURIを生成
        string memory metadataURI = _generateMetadataURI(tokenId);
        
        // NFTをミント
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // トークンIDを増加
        _tokenIdCounter++;
        
        console.log(
            "IPFS NFT minted! ID: %s, Minter: %s, IPFS: %s",
            tokenId,
            msg.sender,
            ipfsHash
        );
        
        emit IPFSNFTMinted(tokenId, msg.sender, ipfsHash);
        emit NFTMinted(tokenId, msg.sender, imageURI, metadataURI);
    }

    /**
     * @notice 所有者専用：無料でNFTをミント（テスト用）
     * @param to ミント先アドレス
     * @param metadataURI NFTのメタデータURI
     */
    function ownerMint(address to, string memory metadataURI) public onlyOwner nonReentrant {
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (bytes(metadataURI).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        _tokenIdCounter++;
        
        emit NFTMinted(tokenId, to, metadataURI, metadataURI);
    }

    /**
     * @notice 所有者専用：IPFSハッシュで無料ミント
     * @param to ミント先アドレス
     * @param name NFTの名前
     * @param description NFTの説明
     * @param ipfsHash IPFSハッシュ
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
        
        // IPFSイメージURIを生成
        string memory imageURI = string(abi.encodePacked("ipfs://", ipfsHash));
        
        // NFT情報を保存
        nftInfo[tokenId] = NFTInfo({
            name: name,
            description: description,
            imageURI: imageURI,
            timestamp: block.timestamp,
            minter: to
        });
        
        // 動的メタデータURIを生成
        string memory metadataURI = _generateMetadataURI(tokenId);
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        _tokenIdCounter++;
        
        emit IPFSNFTMinted(tokenId, to, ipfsHash);
    }

    /**
     * @notice 動的メタデータURIを生成
     * @param tokenId トークンID
     * @return Base64エンコードされたJSON metadata URI
     */
    function _generateMetadataURI(uint256 tokenId) internal view returns (string memory) {
        NFTInfo memory info = nftInfo[tokenId];
        
        // JSONメタデータを構築
        string memory json = string(abi.encodePacked(
            '{"name": "', info.name, '",',
            '"description": "', info.description, '",',
            '"image": "', info.imageURI, '",',
            '"attributes": [',
                '{"trait_type": "Minter", "value": "', _addressToString(info.minter), '"},',
                '{"trait_type": "Mint Timestamp", "value": ', _uint256ToString(info.timestamp), '},',
                '{"trait_type": "Token ID", "value": ', _uint256ToString(tokenId), '}',
            ']}'
        ));
        
        // Base64エンコードしてdata URIを返す
        return Base64.encodeJSON(json);
    }

    /**
     * @notice アドレスを文字列に変換
     * @param addr 変換するアドレス
     * @return 文字列形式のアドレス
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @notice uint256を文字列に変換
     * @param value 変換する数値
     * @return 文字列形式の数値
     */
    function _uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice NFT情報を取得
     * @param tokenId トークンID
     * @return NFTInfo構造体
     */
    function getNFTInfo(uint256 tokenId) public view returns (NFTInfo memory) {
        return nftInfo[tokenId];
    }

    /**
     * @notice 現在のトークンID（次にミントされるID）を取得
     * @return 次のトークンID
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice 総発行数を取得
     * @return 発行済みNFTの総数
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /**
     * @notice 所有者専用：ミント状態の切り替え
     * @param enabled ミント可能状態
     */
    function toggleMinting(bool enabled) public onlyOwner {
        mintingEnabled = enabled;
        emit MintingToggled(enabled);
    }

    /**
     * @notice 所有者専用：ミント料金の更新
     * @param newPrice 新しいミント料金（wei単位）
     */
    function updateMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * @notice 所有者専用：コントラクトの残高を引き出し
     */
    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice コントラクトの残高を取得
     * @return コントラクトのETH残高
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice トークンURIを取得（オーバーライド）
     * @param tokenId トークンID
     * @return トークンのURI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice supportsInterfaceのオーバーライド
     * @param interfaceId インターフェースID
     * @return サポート状況
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
