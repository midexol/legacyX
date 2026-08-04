// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, Origin, MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {OAppOptionsType3} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OAppOptionsType3.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ISyncableVault {
    function syncHeartbeat(uint64 timestamp, uint32 srcEid) external;
    function syncUnlock(uint32 srcEid) external;
}

/// @title LegacyVaultRelay
/// @notice One instance deployed per supported chain, wired together as
/// LayerZero peers. This is what makes LegacyX genuinely multichain rather
/// than "the same contract deployed N times": an owner with vaults on
/// several chains pings their heartbeat, or gets an inheritance condition
/// verified, on ONE chain, and this relay rebroadcasts that fact to every
/// other chain's relay so the sibling vaults update without the owner (or a
/// trusted verifier) needing to repeat the action N times.
///
/// A vault registers itself here (see `LegacyVault.registerWithRelay`) so
/// the relay knows which local vaults belong to which owner. Cross-chain
/// identity is just "same EOA address on both chains", which holds for
/// ordinary EVM externally-owned accounts.
contract LegacyVaultRelay is OApp, OAppOptionsType3 {
    uint8 internal constant MSG_HEARTBEAT = 1;
    uint8 internal constant MSG_UNLOCK = 2;

    mapping(address owner => address[] vaults) public vaultsOf;

    event VaultRegistered(address indexed owner, address indexed vault);
    event HeartbeatBroadcast(address indexed owner, uint32 dstEid);
    event UnlockBroadcast(address indexed owner, uint32 dstEid);
    event HeartbeatApplied(address indexed owner, address indexed vault, uint32 srcEid);
    event UnlockApplied(address indexed owner, address indexed vault, uint32 srcEid);

    error NoVaultsRegistered();
    error DestinationCountMismatch();

    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    /// @dev Called by a LegacyVault immediately after deployment to register
    /// itself under its owner's cross-chain estate.
    function registerVault(address vaultOwner) external {
        vaultsOf[vaultOwner].push(msg.sender);
        emit VaultRegistered(vaultOwner, msg.sender);
    }

    function vaultsOfLength(address vaultOwner) external view returns (uint256) {
        return vaultsOf[vaultOwner].length;
    }

    // --- Outbound: broadcast this owner's state to sibling chains -----------------

    function quoteHeartbeat(uint32 dstEid, bytes calldata options) external view returns (MessagingFee memory) {
        return _quote(
            dstEid,
            _encodeHeartbeat(msg.sender, uint64(block.timestamp)),
            combineOptions(dstEid, MSG_HEARTBEAT, options),
            false
        );
    }

    function quoteUnlock(uint32 dstEid, bytes calldata options) external view returns (MessagingFee memory) {
        return _quote(dstEid, _encodeUnlock(msg.sender), combineOptions(dstEid, MSG_UNLOCK, options), false);
    }

    /// @param fees Native fee owed per destination, from `quoteHeartbeat`, in the same order as `dstEids`.
    function broadcastHeartbeat(uint32[] calldata dstEids, bytes[] calldata options, uint256[] calldata fees)
        external
        payable
    {
        if (vaultsOf[msg.sender].length == 0) revert NoVaultsRegistered();
        if (dstEids.length != options.length || dstEids.length != fees.length) revert DestinationCountMismatch();

        bytes memory message = _encodeHeartbeat(msg.sender, uint64(block.timestamp));
        _broadcast(dstEids, options, fees, message, MSG_HEARTBEAT);
    }

    function broadcastUnlock(uint32[] calldata dstEids, bytes[] calldata options, uint256[] calldata fees)
        external
        payable
    {
        if (vaultsOf[msg.sender].length == 0) revert NoVaultsRegistered();
        if (dstEids.length != options.length || dstEids.length != fees.length) revert DestinationCountMismatch();

        bytes memory message = _encodeUnlock(msg.sender);
        _broadcast(dstEids, options, fees, message, MSG_UNLOCK);
    }

    function _broadcast(
        uint32[] calldata dstEids,
        bytes[] calldata options,
        uint256[] calldata fees,
        bytes memory message,
        uint8 kind
    ) internal {
        uint256 spent;
        for (uint256 i = 0; i < dstEids.length; i++) {
            _lzSend(
                dstEids[i],
                message,
                combineOptions(dstEids[i], kind, options[i]),
                MessagingFee({nativeFee: fees[i], lzTokenFee: 0}),
                msg.sender
            );
            spent += fees[i];
            if (kind == MSG_HEARTBEAT) emit HeartbeatBroadcast(msg.sender, dstEids[i]);
            else emit UnlockBroadcast(msg.sender, dstEids[i]);
        }

        if (msg.value > spent) {
            (bool ok,) = msg.sender.call{value: msg.value - spent}("");
            require(ok, "refund failed");
        }
    }

    /// @dev The endpoint requires msg.value to equal the fee for each
    /// individual send; since one broadcast call fans out to many
    /// destinations from a single msg.value, allow the endpoint to draw from
    /// this contract's balance instead of re-checking msg.value per send.
    function _payNative(uint256 _nativeFee) internal pure override returns (uint256) {
        return _nativeFee;
    }

    // --- Inbound: apply a sibling chain's broadcast to local vaults ------------------

    function _lzReceive(
        Origin calldata _origin,
        bytes32,
        /*_guid*/
        bytes calldata _message,
        address,
        /*_executor*/
        bytes calldata /*_extraData*/
    )
        internal
        override
    {
        uint8 kind = uint8(_message[0]);
        address vaultOwner = address(uint160(uint256(bytes32(_message[1:33]))));
        address[] storage vaults = vaultsOf[vaultOwner];

        if (kind == MSG_HEARTBEAT) {
            uint64 timestamp = uint64(bytes8(_message[33:41]));
            for (uint256 i = 0; i < vaults.length; i++) {
                ISyncableVault(vaults[i]).syncHeartbeat(timestamp, _origin.srcEid);
                emit HeartbeatApplied(vaultOwner, vaults[i], _origin.srcEid);
            }
        } else if (kind == MSG_UNLOCK) {
            for (uint256 i = 0; i < vaults.length; i++) {
                ISyncableVault(vaults[i]).syncUnlock(_origin.srcEid);
                emit UnlockApplied(vaultOwner, vaults[i], _origin.srcEid);
            }
        }
    }

    function _encodeHeartbeat(address vaultOwner, uint64 timestamp) internal pure returns (bytes memory) {
        return abi.encodePacked(MSG_HEARTBEAT, bytes32(uint256(uint160(vaultOwner))), timestamp);
    }

    function _encodeUnlock(address vaultOwner) internal pure returns (bytes memory) {
        return abi.encodePacked(MSG_UNLOCK, bytes32(uint256(uint160(vaultOwner))));
    }
}
