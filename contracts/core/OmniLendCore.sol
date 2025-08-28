// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OmniLendCore is Ownable, ReentrancyGuard {
    
    struct UserPosition {
        mapping(uint256 => uint256) collateralAmounts;
        uint256 totalCollateralUSD;
        uint256 totalBorrowedUSD;
        uint256 healthFactor;
        bool isActive;
    }
    
    struct LendingPool {
        address tokenAddress;
        uint256 totalSupply;
        bool isActive;
    }
    
    mapping(address => UserPosition) public userPositions;
    mapping(uint256 => LendingPool) public lendingPools;
    
    event CrossChainDeposit(address indexed user, uint256 chainId, address token, uint256 amount);
    
    function depositCollateral(
        uint256 chainId,
        address tokenAddress,
        uint256 amount
    ) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(lendingPools[chainId].isActive, "Chain not supported");
        
        if (tokenAddress == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        }
        
        UserPosition storage position = userPositions[msg.sender];
        position.collateralAmounts[chainId] += amount;
        position.totalCollateralUSD += amount * 2000; // $2000 per ETH for demo
        position.isActive = true;
        position.healthFactor = 999; // Safe for demo
        
        emit CrossChainDeposit(msg.sender, chainId, tokenAddress, amount);
    }
    
    function getUserPosition(address user) external view returns (
        uint256 totalCollateral,
        uint256 totalBorrowed,
        uint256 healthFactor,
        bool isActive
    ) {
        UserPosition storage position = userPositions[user];
        return (
            position.totalCollateralUSD,
            position.totalBorrowedUSD,
            position.healthFactor,
            position.isActive
        );
    }
    
    function addLendingPool(uint256 chainId, address tokenAddress) external onlyOwner {
        lendingPools[chainId].tokenAddress = tokenAddress;
        lendingPools[chainId].totalSupply = 1000 ether;
        lendingPools[chainId].isActive = true;
    }
    
    function getCollateralAmount(address user, uint256 chainId) external view returns (uint256) {
        return userPositions[user].collateralAmounts[chainId];
    }
}
