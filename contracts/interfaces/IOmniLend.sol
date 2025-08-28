// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IOmniLend {
    function depositCollateral(uint256 chainId, address tokenAddress, uint256 amount) external payable;
    function getUserPosition(address user) external view returns (uint256, uint256, uint256, bool);
}
