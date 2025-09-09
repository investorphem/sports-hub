// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IBadge {
    function setEligibility(address user, uint256 badgeId, bool ok) external;
}

interface INFT {
    function setEligibility(address user, bool ok) external;
}

contract BettingMarket is Ownable {
    IERC20 public stableToken;

    struct Market {
        uint256 matchId;
        bool exists;
        bool resolved;
        uint8 winningOutcome; // 1=home,2=draw,3=away
        uint256 totalPool;
        mapping(uint8 => uint256) poolPerOutcome;
        mapping(address => mapping(uint8 => uint256)) bets;
    }

    mapping(uint256 => Market) private markets;
    mapping(address => uint256) public wins;

    address public badgeContract;
    address public nftContract;

    event MarketCreated(uint256 indexed matchId);
    event BetPlaced(uint256 indexed matchId, address indexed bettor, uint8 outcome, uint256 amount);
    event MarketResolved(uint256 indexed matchId, uint8 winningOutcome);
    event Payout(address indexed to, uint256 amount);
    event WinRegistered(address indexed user, uint256 newWins);
    event BadgeContractSet(address indexed addr);
    event NFTContractSet(address indexed addr);

    constructor(address _token) {
        stableToken = IERC20(_token);
    }

    function setBadgeContract(address _badge) external onlyOwner {
        badgeContract = _badge;
        emit BadgeContractSet(_badge);
    }
    function setNFTContract(address _nft) external onlyOwner {
        nftContract = _nft;
        emit NFTContractSet(_nft);
    }

    function createMarket(uint256 matchId) external onlyOwner {
        Market storage m = markets[matchId];
        require(!m.exists, "already exists");
        m.matchId = matchId;
        m.exists = true;
        emit MarketCreated(matchId);
    }

    function placeBet(uint256 matchId, uint8 outcome, uint256 amount) external {
        Market storage m = markets[matchId];
        require(m.exists && !m.resolved, "market not open");
        require(outcome >=1 && outcome <=3, "invalid outcome");
        require(amount > 0, "amount 0");

        require(stableToken.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        m.bets[msg.sender][outcome] += amount;
        m.poolPerOutcome[outcome] += amount;
        m.totalPool += amount;
        emit BetPlaced(matchId, msg.sender, outcome, amount);
    }

    function resolveMarket(uint256 matchId, uint8 winningOutcome) external onlyOwner {
        Market storage m = markets[matchId];
        require(m.exists && !m.resolved, "cannot resolve");
        require(winningOutcome >=1 && winningOutcome <=3, "invalid winner");
        m.resolved = true;
        m.winningOutcome = winningOutcome;
        emit MarketResolved(matchId, winningOutcome);
    }

    function claim(uint256 matchId) external {
        Market storage m = markets[matchId];
        require(m.exists && m.resolved, "not resolved");
        uint8 w = m.winningOutcome;
        uint256 userBet = m.bets[msg.sender][w];
        require(userBet > 0, "no winnings");

        uint256 poolW = m.poolPerOutcome[w];
        uint256 payout = (userBet * m.totalPool) / poolW;
        m.bets[msg.sender][w] = 0;
        require(stableToken.transfer(msg.sender, payout), "transfer failed");
        emit Payout(msg.sender, payout);
    }

    function registerWin(address user) external onlyOwner {
        wins[user] += 1;
        emit WinRegistered(user, wins[user]);
    }

    function withdrawERC20(address to, uint256 amount) external onlyOwner {
        require(stableToken.transfer(to, amount), "transfer failed");
    }
}
