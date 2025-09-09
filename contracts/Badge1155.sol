// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Badge1155 is ERC1155, Ownable {
    mapping(address => mapping(uint256 => bool)) public eligible;
    mapping(address => mapping(uint256 => bool)) public claimed;
    mapping(address => bool) public approvedSetters;

    event EligibilitySet(address indexed user, uint256 badgeId, bool ok);
    event BadgeClaimed(address indexed user, uint256 badgeId);
    event SetterToggled(address indexed setter, bool enabled);

    constructor(string memory uri_) ERC1155(uri_) {}

    modifier onlySetterOrOwner() {
        require(owner() == msg.sender || approvedSetters[msg.sender], "not setter");
        _;
    }

    function setApprovedSetter(address setter, bool enabled) external onlyOwner {
        approvedSetters[setter] = enabled;
        emit SetterToggled(setter, enabled);
    }

    function setEligibility(address user, uint256 badgeId, bool ok) external onlySetterOrOwner {
        eligible[user][badgeId] = ok;
        emit EligibilitySet(user, badgeId, ok);
    }

    function claimBadge(uint256 badgeId) external {
        require(eligible[msg.sender][badgeId], "not eligible");
        require(!claimed[msg.sender][badgeId], "already claimed");
        claimed[msg.sender][badgeId] = true;
        _mint(msg.sender, badgeId, 1, "");
        emit BadgeClaimed(msg.sender, badgeId);
    }

    function adminMint(address to, uint256 badgeId, uint256 amount) external onlyOwner {
        _mint(to, badgeId, amount, "");
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }
}
