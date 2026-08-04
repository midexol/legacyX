// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOtcSettlement {
    event Escrowed(address indexed seller, uint256 amount);
    event EscrowWithdrawn(address indexed seller, uint256 amount);
    event Settled(
        bytes32 indexed tradeId, address indexed seller, address indexed buyer, uint256 amount, uint256 payment
    );

    error NotMatcher();
    error InsufficientEscrow();
    error TradeAlreadySettled();
    error ZeroAmount();

    function escrow(uint256 amount) external;
    function withdrawEscrow(uint256 amount) external;
    function settle(bytes32 tradeId, address seller, address buyer, uint256 amount, uint256 payment) external;
}
