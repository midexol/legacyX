// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IOtcSettlement} from "./interfaces/IOtcSettlement.sol";

/// @title OtcSettlement
/// @notice On-chain settlement for LegacyX's private OTC desk. Matching itself
/// stays entirely off-chain (backend/src/services/matching.service.ts runs a
/// price-time-priority crossing engine over a DB order book, so counterparties,
/// amounts, and prices are never public pre-trade) — this contract is only
/// the "only the final settlement is recorded on-chain" step from the README.
///
/// Single-chain by design: a beneficiary sells inherited assets and gets paid
/// on the same chain their vault claim landed on. Sellers escrow ahead of a
/// match (their inherited asset is already in their wallet post-claim, so
/// this is just a transferIn); buyers pre-approve the quote token so the
/// trusted `matcher` (the backend's matching engine) can execute both legs
/// atomically once it has crossed a buy against a sell off-chain.
contract OtcSettlement is IOtcSettlement, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable assetToken;
    IERC20 public immutable quoteToken;

    address public matcher;
    mapping(address => uint256) public escrowOf;
    mapping(bytes32 => bool) public settledTrades;

    modifier onlyMatcher() {
        if (msg.sender != matcher) revert NotMatcher();
        _;
    }

    constructor(IERC20 _assetToken, IERC20 _quoteToken, address _matcher, address _owner) Ownable(_owner) {
        assetToken = _assetToken;
        quoteToken = _quoteToken;
        matcher = _matcher;
    }

    /// @notice Seller locks up the amount they've listed for sale.
    function escrow(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        assetToken.safeTransferFrom(msg.sender, address(this), amount);
        escrowOf[msg.sender] += amount;
        emit Escrowed(msg.sender, amount);
    }

    /// @notice Reclaim any unmatched (or partially matched) escrowed amount —
    /// the on-chain equivalent of cancelling an OPEN sell order.
    function withdrawEscrow(uint256 amount) external {
        if (amount > escrowOf[msg.sender]) revert InsufficientEscrow();
        escrowOf[msg.sender] -= amount;
        assetToken.safeTransfer(msg.sender, amount);
        emit EscrowWithdrawn(msg.sender, amount);
    }

    /// @notice Executes one crossed trade: pulls `payment` in quote token from
    /// the buyer (who must have approved this contract beforehand) straight
    /// to the seller, and releases `amount` of the escrowed asset to the
    /// buyer. `tradeId` mirrors the backend's OtcTrade.id and is replay-guarded
    /// so the same off-chain match can't be settled twice.
    function settle(bytes32 tradeId, address seller, address buyer, uint256 amount, uint256 payment)
        external
        onlyMatcher
        nonReentrant
    {
        if (settledTrades[tradeId]) revert TradeAlreadySettled();
        if (amount > escrowOf[seller]) revert InsufficientEscrow();

        settledTrades[tradeId] = true;
        escrowOf[seller] -= amount;

        quoteToken.safeTransferFrom(buyer, seller, payment);
        assetToken.safeTransfer(buyer, amount);

        emit Settled(tradeId, seller, buyer, amount, payment);
    }

    function setMatcher(address newMatcher) external onlyOwner {
        matcher = newMatcher;
    }
}
