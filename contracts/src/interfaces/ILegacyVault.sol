// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VaultTypes} from "../libraries/VaultTypes.sol";

interface ILegacyVault {
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event HeartbeatPinged(uint256 timestamp);
    event HeartbeatSynced(uint256 timestamp, uint32 srcEid);
    event BeneficiaryAdded(uint256 indexed index, address account, uint32 homeEid, uint16 allocationBps);
    event ConditionAdded(uint256 indexed conditionId, VaultTypes.ConditionType conditionType);
    event ConditionApproved(uint256 indexed conditionId, address approver, uint8 approvalCount);
    event ConditionSatisfied(uint256 indexed conditionId);
    event VaultUnlocked(uint256 unlockedBalance, uint256 timestamp);
    event Claimed(uint256 indexed beneficiaryIndex, address indexed account, uint256 amountLocal, uint32 dstEid);

    error NotOwner();
    error NotVerifier();
    error NotRelay();
    error VaultAlreadyUnlocked();
    error VaultNotUnlocked();
    error VaultNotPendingOrActive();
    error AllocationExceeds100Percent();
    error InsufficientBalance();
    error ConditionNotFound();
    error ConditionAlreadySatisfied();
    error WrongConditionType();
    error InactivityWindowNotElapsed();
    error NotAnApprover();
    error AlreadyApproved();
    error InvalidSignature();
    error NothingToClaim();
    error NotABeneficiary();

    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function pingHeartbeat() external;
    function claim(uint256 beneficiaryIndex, bytes calldata bridgeOptions) external payable;
}
