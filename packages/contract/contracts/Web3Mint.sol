// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Web3Mint {
    using Counters for Counters.Counter;
    // new ver ëΩï™îjâÛìIïœçX
    uint256 private _tokenIdCounter;

    constructor() ERC721("TanyaNFT", "TANYA") {
        console.log("This is my NFT contract.:");
    }

    function makeAnEpicNFT() public {
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, "Please paste the link to the JSON file");
        console.log(
            "An NFT w/ ID %s has been minted to %s",
            newItemId,
            msg.sender
        );

        _tokenIds.increment();
    }
}
