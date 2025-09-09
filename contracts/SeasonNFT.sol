// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SeasonNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(address => bool) public eligible;
    mapping(address => bool) public claimed;
    mapping(address => bool) public approvedSetters;

    event EligibilitySet(address indexed user, bool ok);
    event SeasonClaimed(address indexed user, uint256 tokenId);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    modifier onlySetterOrOwner() {
        require(owner() == msg.sender || approvedSetters[msg.sender], "not setter");
        _;
    }

    function setApprovedSetter(address setter, bool enabled) external onlyOwner {
        approvedSetters[setter] = enabled;
    }

    function setEligibility(address user, bool ok) external onlySetterOrOwner {
        eligible[user] = ok;
        emit EligibilitySet(user, ok);
    }

    function claimSeasonNFT() external {
        require(eligible[msg.sender], "not eligible");
        require(!claimed[msg.sender], "already claimed");
        claimed[msg.sender] = true;
        _tokenIdCounter.increment();
        _safeMint(msg.sender, _tokenIdCounter.current());
        emit SeasonClaimed(msg.sender, _tokenIdCounter.current());
    }

    function adminMint(address to) external onlyOwner {
        _tokenIdCounter.increment();
        _safeMint(to, _tokenIdCounter.current());
    }
}
