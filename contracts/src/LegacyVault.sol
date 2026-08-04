// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {IOFT, SendParam, MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/interfaces/IOFT.sol";

import {ILegacyVault} from "./interfaces/ILegacyVault.sol";
import {VaultTypes} from "./libraries/VaultTypes.sol";

interface ILegacyVaultRelay {
    function registerVault(address vaultOwner) external;
}

/// @title LegacyVault
/// @notice A single owner's digital-will vault for one deposited asset, deployed
/// identically on every supported chain. Mirrors backend/prisma/schema.prisma
/// (Vault, Beneficiary, InheritanceCondition, ConditionApproval, Claim) so the
/// on-chain and off-chain state machines match exactly.
///
/// Cross-chain behavior:
///  - `LegacyVaultRelay` (a LayerZero OApp, one per chain) is the only address
///    allowed to call `syncHeartbeat`/`syncConditionSatisfied` — it rebroadcasts
///    an owner's heartbeat or a verified condition to every other vault the
///    owner registered on other chains, so a single action (ping once, get
///    verified once) keeps the whole multichain estate in sync instead of
///    requiring N separate transactions on N chains.
///  - A beneficiary's payout can land on a different chain than the vault
///    itself: `claim` transfers locally when `homeEid` matches this vault's
///    endpoint, or bridges via the deposited asset's OFT `send()` otherwise.
///    This requires `asset` to be an OFT (or wrapped by an OFT adapter).
contract LegacyVault is ILegacyVault, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct Condition {
        VaultTypes.ConditionType conditionType;
        VaultTypes.ConditionStatus status;
        uint64 satisfiedAt;
    }

    // --- Immutable vault identity -------------------------------------------------

    address public immutable owner;
    IERC20 public immutable asset;
    uint32 public immutable localEid;

    // --- Mutable configuration ------------------------------------------------------

    address public relay;
    address public trustedVerifier;

    string public name;
    uint32 public inactivityDays;
    uint64 public lastHeartbeatAt;

    VaultTypes.VaultStatus public status;
    uint64 public unlockedAt;
    uint256 public unlockedBalance;
    uint256 public totalClaimed;

    VaultTypes.Beneficiary[] public beneficiaries;
    uint16 public totalAllocationBps;
    mapping(uint256 => uint256) public claimedOf; // beneficiaryIndex => amount already claimed

    Condition[] public conditions;
    mapping(uint256 => VaultTypes.MultiPartyConfig) internal multiPartyConfigOf;
    mapping(uint256 => string) public legalDocumentRefOf;
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    mapping(uint256 => uint8) public approvalCountOf;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyVerifier() {
        if (msg.sender != trustedVerifier) revert NotVerifier();
        _;
    }

    modifier onlyRelay() {
        if (msg.sender != relay) revert NotRelay();
        _;
    }

    modifier notUnlocked() {
        if (status == VaultTypes.VaultStatus.UNLOCKED) revert VaultAlreadyUnlocked();
        _;
    }

    constructor(
        address _owner,
        IERC20 _asset,
        uint32 _localEid,
        string memory _name,
        uint32 _inactivityDays,
        address _trustedVerifier,
        address _relay
    ) {
        owner = _owner;
        asset = _asset;
        localEid = _localEid;
        name = _name;
        inactivityDays = _inactivityDays;
        trustedVerifier = _trustedVerifier;
        relay = _relay;
        lastHeartbeatAt = uint64(block.timestamp);
        status = VaultTypes.VaultStatus.ACTIVE;

        if (_relay != address(0)) {
            ILegacyVaultRelay(_relay).registerVault(_owner);
        }
    }

    // --- Balance / deposits -----------------------------------------------------

    /// @notice The vault's own token balance is the ledger — no separate
    /// internal accounting is kept, unlike the backend's off-chain float.
    function balance() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function deposit(uint256 amount) external notUnlocked {
        asset.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external onlyOwner notUnlocked {
        if (amount > balance()) revert InsufficientBalance();
        asset.safeTransfer(owner, amount);
        emit Withdrawn(owner, amount);
    }

    // --- Heartbeat ----------------------------------------------------------------

    function pingHeartbeat() external onlyOwner notUnlocked {
        _setHeartbeat(uint64(block.timestamp));
        emit HeartbeatPinged(block.timestamp);
    }

    /// @notice Called by this chain's LegacyVaultRelay when the owner pinged
    /// their heartbeat on a *different* chain's vault.
    function syncHeartbeat(uint64 timestamp, uint32 srcEid) external onlyRelay notUnlocked {
        if (timestamp <= lastHeartbeatAt) return;
        _setHeartbeat(timestamp);
        emit HeartbeatSynced(timestamp, srcEid);
    }

    function _setHeartbeat(uint64 timestamp) internal {
        lastHeartbeatAt = timestamp;
        if (status == VaultTypes.VaultStatus.PENDING_VERIFICATION) {
            status = VaultTypes.VaultStatus.ACTIVE;
        }
    }

    // --- Beneficiaries --------------------------------------------------------------

    function addBeneficiary(address account, uint32 homeEid, uint16 allocationBps) external onlyOwner notUnlocked {
        if (uint256(totalAllocationBps) + allocationBps > 10_000) revert AllocationExceeds100Percent();
        totalAllocationBps += allocationBps;
        beneficiaries.push(VaultTypes.Beneficiary({account: account, homeEid: homeEid, allocationBps: allocationBps}));
        emit BeneficiaryAdded(beneficiaries.length - 1, account, homeEid, allocationBps);
    }

    function beneficiariesLength() external view returns (uint256) {
        return beneficiaries.length;
    }

    // --- Conditions -------------------------------------------------------------

    function addInactivityCondition() external onlyOwner notUnlocked returns (uint256 id) {
        return _pushCondition(VaultTypes.ConditionType.INACTIVITY);
    }

    function addManualApprovalCondition() external onlyOwner notUnlocked returns (uint256 id) {
        return _pushCondition(VaultTypes.ConditionType.MANUAL_APPROVAL);
    }

    function addLegalDocumentCondition(string calldata documentRef)
        external
        onlyOwner
        notUnlocked
        returns (uint256 id)
    {
        id = _pushCondition(VaultTypes.ConditionType.LEGAL_DOCUMENT);
        legalDocumentRefOf[id] = documentRef;
    }

    function addMultiPartyApprovalCondition(address[] calldata approvers, uint8 requiredApprovals)
        external
        onlyOwner
        notUnlocked
        returns (uint256 id)
    {
        require(approvers.length >= 2, "min 2 approvers");
        require(requiredApprovals >= 1 && requiredApprovals <= approvers.length, "bad quorum");

        id = _pushCondition(VaultTypes.ConditionType.MULTI_PARTY_APPROVAL);
        VaultTypes.MultiPartyConfig storage cfg = multiPartyConfigOf[id];
        cfg.requiredApprovals = requiredApprovals;
        for (uint256 i = 0; i < approvers.length; i++) {
            cfg.approvers.push(approvers[i]);
        }
    }

    function _pushCondition(VaultTypes.ConditionType conditionType) internal returns (uint256 id) {
        id = conditions.length;
        conditions.push(
            Condition({conditionType: conditionType, status: VaultTypes.ConditionStatus.PENDING, satisfiedAt: 0})
        );
        emit ConditionAdded(id, conditionType);
    }

    function conditionsLength() external view returns (uint256) {
        return conditions.length;
    }

    function multiPartyApprovers(uint256 conditionId) external view returns (address[] memory) {
        return multiPartyConfigOf[conditionId].approvers;
    }

    // --- Condition verification ---------------------------------------------------

    /// @notice Anyone can call this to sweep an INACTIVITY condition once the
    /// heartbeat window has elapsed — mirrors the backend's periodic
    /// verification sweep (backend/src/services/verification.service.ts),
    /// just triggered on demand instead of on a cron.
    function checkInactivity(uint256 conditionId) external notUnlocked {
        Condition storage c = _conditionOrRevert(conditionId);
        if (c.conditionType != VaultTypes.ConditionType.INACTIVITY) revert WrongConditionType();
        if (c.status == VaultTypes.ConditionStatus.SATISFIED) revert ConditionAlreadySatisfied();

        uint256 elapsed = block.timestamp - lastHeartbeatAt;
        if (elapsed >= uint256(inactivityDays) * 1 days) {
            _satisfy(conditionId, c);
        } else if (status == VaultTypes.VaultStatus.ACTIVE) {
            status = VaultTypes.VaultStatus.PENDING_VERIFICATION;
        }
    }

    /// @notice Peer-approval flow for MULTI_PARTY_APPROVAL. Approvers never
    /// need an on-chain account of their own on *this* chain — they sign an
    /// EIP-191 message off-chain and anyone (a relayer, the frontend, another
    /// beneficiary) can submit it here, matching the backend's signature-based
    /// approval (backend/src/services/condition.service.ts).
    function approveCondition(uint256 conditionId, address approver, bytes calldata signature) external notUnlocked {
        Condition storage c = _conditionOrRevert(conditionId);
        if (c.conditionType != VaultTypes.ConditionType.MULTI_PARTY_APPROVAL) revert WrongConditionType();
        if (c.status == VaultTypes.ConditionStatus.SATISFIED) revert ConditionAlreadySatisfied();

        VaultTypes.MultiPartyConfig storage cfg = multiPartyConfigOf[conditionId];
        if (!_isApprover(cfg, approver)) revert NotAnApprover();
        if (hasApproved[conditionId][approver]) revert AlreadyApproved();

        bytes32 digest = keccak256(
                abi.encodePacked("Approve inheritance condition ", conditionId, " for vault ", address(this))
            ).toEthSignedMessageHash();
        if (digest.recover(signature) != approver) revert InvalidSignature();

        hasApproved[conditionId][approver] = true;
        uint8 count = ++approvalCountOf[conditionId];
        emit ConditionApproved(conditionId, approver, count);

        if (count >= cfg.requiredApprovals) {
            _satisfy(conditionId, c);
        }
    }

    /// @notice Stands in for a trusted-verifier integration (death certificate
    /// registry, legal document notarization). Gated by `trustedVerifier`
    /// rather than the owner, since the owner is — by definition — the person
    /// who may no longer be able to act.
    function verifyByTrustedVerifier(uint256 conditionId) external onlyVerifier notUnlocked {
        Condition storage c = _conditionOrRevert(conditionId);
        if (
            c.conditionType != VaultTypes.ConditionType.MANUAL_APPROVAL
                && c.conditionType != VaultTypes.ConditionType.LEGAL_DOCUMENT
        ) {
            revert WrongConditionType();
        }
        if (c.status == VaultTypes.ConditionStatus.SATISFIED) revert ConditionAlreadySatisfied();
        _satisfy(conditionId, c);
    }

    /// @notice Called by this chain's LegacyVaultRelay when a condition on
    /// this owner's estate was verified on a *different* chain's vault. Since
    /// condition indices are local to each vault and won't line up across
    /// chains, the relay conveys "this estate is provably unlockable now"
    /// rather than a specific conditionId — the whole multichain estate
    /// unlocks together instead of per-chain.
    function syncUnlock(uint32 srcEid) external onlyRelay notUnlocked {
        srcEid; // relay already scoped the message to this owner's estate
        _unlock();
    }

    function _satisfy(uint256 conditionId, Condition storage c) internal {
        c.status = VaultTypes.ConditionStatus.SATISFIED;
        c.satisfiedAt = uint64(block.timestamp);
        emit ConditionSatisfied(conditionId);
        _unlock();
    }

    /// @notice The vault unlocks the moment ANY one configured condition is
    /// satisfied, matching backend tryUnlockVault. `unlockedBalance` snapshots
    /// `balance()` here so each beneficiary's claimable share is fixed at
    /// unlock time, independent of claim order.
    function _unlock() internal {
        if (status == VaultTypes.VaultStatus.UNLOCKED) return;
        status = VaultTypes.VaultStatus.UNLOCKED;
        unlockedAt = uint64(block.timestamp);
        unlockedBalance = balance();
        emit VaultUnlocked(unlockedBalance, block.timestamp);
    }

    function _conditionOrRevert(uint256 conditionId) internal view returns (Condition storage) {
        if (conditionId >= conditions.length) revert ConditionNotFound();
        return conditions[conditionId];
    }

    function _isApprover(VaultTypes.MultiPartyConfig storage cfg, address approver) internal view returns (bool) {
        for (uint256 i = 0; i < cfg.approvers.length; i++) {
            if (cfg.approvers[i] == approver) return true;
        }
        return false;
    }

    // --- Claims ---------------------------------------------------------------

    /// @notice Pays out a beneficiary's fixed share of `unlockedBalance`.
    /// Pays locally if the beneficiary's registered home chain is this vault's
    /// chain; otherwise bridges via the asset's OFT `send`, so the
    /// beneficiary receives funds directly on their own chain in one claim.
    /// `msg.value` must cover the LayerZero messaging fee for cross-chain
    /// claims (quote it beforehand via `asset`'s `quoteSend`); it is ignored
    /// for local claims.
    function claim(uint256 beneficiaryIndex, bytes calldata bridgeOptions) external payable nonReentrant {
        if (status != VaultTypes.VaultStatus.UNLOCKED) revert VaultNotUnlocked();
        if (beneficiaryIndex >= beneficiaries.length) revert NotABeneficiary();

        VaultTypes.Beneficiary storage b = beneficiaries[beneficiaryIndex];
        if (msg.sender != b.account) revert NotABeneficiary();

        uint256 entitlement = (unlockedBalance * b.allocationBps) / 10_000;
        uint256 already = claimedOf[beneficiaryIndex];
        if (already >= entitlement) revert NothingToClaim();

        uint256 payout = entitlement - already;
        claimedOf[beneficiaryIndex] = entitlement;
        totalClaimed += payout;

        if (b.homeEid == localEid) {
            asset.safeTransfer(b.account, payout);
            emit Claimed(beneficiaryIndex, b.account, payout, localEid);
        } else {
            _bridgeClaim(beneficiaryIndex, b, payout, bridgeOptions);
        }
    }

    function _bridgeClaim(
        uint256 beneficiaryIndex,
        VaultTypes.Beneficiary storage b,
        uint256 payout,
        bytes calldata bridgeOptions
    ) internal {
        IOFT oft = IOFT(address(asset));

        SendParam memory sendParam = SendParam({
            dstEid: b.homeEid,
            to: bytes32(uint256(uint160(b.account))),
            amountLD: payout,
            minAmountLD: payout,
            extraOptions: bridgeOptions,
            composeMsg: "",
            oftCmd: ""
        });

        MessagingFee memory fee = oft.quoteSend(sendParam, false);
        if (msg.value < fee.nativeFee) revert InsufficientBalance();

        if (oft.approvalRequired()) {
            asset.forceApprove(oft.token(), payout);
        }

        oft.send{value: fee.nativeFee}(sendParam, fee, msg.sender);

        if (msg.value > fee.nativeFee) {
            (bool ok,) = msg.sender.call{value: msg.value - fee.nativeFee}("");
            require(ok, "refund failed");
        }

        emit Claimed(beneficiaryIndex, b.account, payout, b.homeEid);
    }

    // --- Admin --------------------------------------------------------------------

    function setRelay(address newRelay) external onlyOwner {
        relay = newRelay;
        if (newRelay != address(0)) {
            ILegacyVaultRelay(newRelay).registerVault(owner);
        }
    }

    function setTrustedVerifier(address newVerifier) external onlyOwner {
        trustedVerifier = newVerifier;
    }
}
