// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

/**
 * @title Web3Mint
 * @author UNCHAIN ETH-NFT-Maker Team
 * @notice NFTを作成・ミントするためのスマートコントラクト
 * @dev OpenZeppelin v5.3.0に対応したERC721実装（Solidity 0.8.28対応）
 * 
 * 主な機能:
 * - NFTの安全なミント
 * - トークンURIの設定
 * - 所有者限定機能
 * - リエントランシー攻撃の防止
 * - Solidity 0.8.28の最新機能を活用
 */
contract Web3Mint is ERC721URIStorage, Ownable, ReentrancyGuard {
    /// @notice 次にミントされるトークンのID
    uint256 private _tokenIdCounter;
    
    /// @notice 最大ミント可能数
    uint256 public constant MAX_SUPPLY = 10000;
    
    /// @notice ミント料金（wei単位）
    uint256 public mintPrice = 0.001 ether;
    
    /// @notice ミント可能状態
    bool public mintingEnabled = true;

    /// @dev イベント定義
    event NFTMinted(uint256 indexed tokenId, address indexed minter, string tokenURI);
    event MintingToggled(bool enabled);
    event MintPriceUpdated(uint256 newPrice);

    /// @dev カスタムエラー定義（ガス効率の向上）
    error MaxSupplyExceeded();
    error MintingDisabled();
    error InsufficientPayment();
    error InvalidTokenURI();

    /**
     * @notice コンストラクタ
     * @dev ERC721とOwnableを初期化
     */
    constructor() ERC721("TanyaNFT", "TANYA") Ownable(msg.sender) {
        console.log("Web3Mint NFT contract deployed by:", msg.sender);
        console.log("Solidity version: 0.8.28");
        _tokenIdCounter = 1; // トークンIDを1から開始
    }

    /**
     * @notice NFTをミントする
     * @param tokenURI NFTのメタデータURI
     * @dev リエントランシー攻撃を防ぐためにnonReentrantを使用
     */
    function makeAnEpicNFT(string memory tokenURI) public payable nonReentrant {
        if (!mintingEnabled) revert MintingDisabled();
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (bytes(tokenURI).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _tokenIdCounter;
        
        // NFTをミント
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // トークンIDを増加
        _tokenIdCounter++;
        
        console.log(
            "NFT minted! ID: %s, Minter: %s, URI: %s",
            tokenId,
            msg.sender,
            tokenURI
        );
        
        emit NFTMinted(tokenId, msg.sender, tokenURI);
    }

    /**
     * @notice 所有者専用：無料でNFTをミント（テスト用）
     * @param to ミント先アドレス
     * @param tokenURI NFTのメタデータURI
     */
    function ownerMint(address to, string memory tokenURI) public onlyOwner nonReentrant {
        if (_tokenIdCounter > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (bytes(tokenURI).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        _tokenIdCounter++;
        
        emit NFTMinted(tokenId, to, tokenURI);
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
