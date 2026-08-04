// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestHelperOz5} from "@layerzerolabs/test-devtools-evm-foundry/contracts/TestHelperOz5.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {OptionsBuilder} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";

import {LegacyVault} from "../src/LegacyVault.sol";
import {LegacyVaultRelay} from "../src/LegacyVaultRelay.sol";
import {VaultTypes} from "../src/libraries/VaultTypes.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/// @notice Proves the actual "multichain" claim: an owner heartbeats or gets
/// verified on chain A, and their sibling vault on chain B updates without a
/// second transaction there — via LegacyVaultRelay, a LayerZero OApp wired
/// between two simulated endpoints.
contract CrossChainRelayTest is TestHelperOz5 {
    using OptionsBuilder for bytes;

    uint32 constant EID_A = 1;
    uint32 constant EID_B = 2;
    uint32 constant INACTIVITY_DAYS = 365;

    LegacyVaultRelay relayA;
    LegacyVaultRelay relayB;
    MockERC20 assetA;
    MockERC20 assetB;
    LegacyVault vaultA;
    LegacyVault vaultB;

    address owner = makeAddr("owner");
    address verifier = makeAddr("verifier");

    function setUp() public override {
        super.setUp();
        setUpEndpoints(2, LibraryType.UltraLightNode);

        relayA = LegacyVaultRelay(
            payable(_deployOApp(type(LegacyVaultRelay).creationCode, abi.encode(endpoints[EID_A], address(this))))
        );
        relayB = LegacyVaultRelay(
            payable(_deployOApp(type(LegacyVaultRelay).creationCode, abi.encode(endpoints[EID_B], address(this))))
        );

        address[] memory oapps = new address[](2);
        oapps[0] = address(relayA);
        oapps[1] = address(relayB);
        wireOApps(oapps);

        assetA = new MockERC20();
        assetB = new MockERC20();

        vm.prank(owner);
        vaultA = new LegacyVault(owner, assetA, EID_A, "Estate (chain A)", INACTIVITY_DAYS, verifier, address(relayA));

        vm.prank(owner);
        vaultB = new LegacyVault(owner, assetB, EID_B, "Estate (chain B)", INACTIVITY_DAYS, verifier, address(relayB));
    }

    function test_vaultsRegisterWithRelayOnDeploy() public {
        assertEq(relayA.vaultsOfLength(owner), 1);
        assertEq(relayB.vaultsOfLength(owner), 1);
    }

    function test_heartbeatBroadcast_syncsSiblingVaultOnOtherChain() public {
        // Chain B's vault drifts toward PENDING_VERIFICATION while the owner
        // is only proving liveness on chain A.
        vm.warp(block.timestamp + INACTIVITY_DAYS * 1 days - 1 days);

        bytes memory extraOptions = OptionsBuilder.newOptions().addExecutorLzReceiveOption(200_000, 0);

        uint32[] memory dstEids = new uint32[](1);
        dstEids[0] = EID_B;
        bytes[] memory options = new bytes[](1);
        options[0] = extraOptions;

        MessagingFee memory fee = relayA.quoteHeartbeat(EID_B, extraOptions);
        uint256[] memory fees = new uint256[](1);
        fees[0] = fee.nativeFee;

        vm.deal(owner, 1 ether);
        vm.prank(owner);
        relayA.broadcastHeartbeat{value: fee.nativeFee}(dstEids, options, fees);

        verifyPackets(EID_B, addressToBytes32(address(relayB)));

        assertEq(vaultB.lastHeartbeatAt(), block.timestamp);
    }

    function test_unlockBroadcast_unlocksSiblingVaultOnOtherChain() public {
        vm.prank(owner);
        uint256 conditionId = vaultA.addManualApprovalCondition();

        vm.prank(verifier);
        vaultA.verifyByTrustedVerifier(conditionId);
        assertEq(uint8(vaultA.status()), uint8(VaultTypes.VaultStatus.UNLOCKED));

        // Chain B's vault hasn't heard anything yet.
        assertEq(uint8(vaultB.status()), uint8(VaultTypes.VaultStatus.ACTIVE));

        bytes memory extraOptions = OptionsBuilder.newOptions().addExecutorLzReceiveOption(200_000, 0);

        uint32[] memory dstEids = new uint32[](1);
        dstEids[0] = EID_B;
        bytes[] memory options = new bytes[](1);
        options[0] = extraOptions;

        MessagingFee memory fee = relayA.quoteUnlock(EID_B, extraOptions);
        uint256[] memory fees = new uint256[](1);
        fees[0] = fee.nativeFee;

        vm.deal(owner, 1 ether);
        vm.prank(owner);
        relayA.broadcastUnlock{value: fee.nativeFee}(dstEids, options, fees);

        verifyPackets(EID_B, addressToBytes32(address(relayB)));

        assertEq(uint8(vaultB.status()), uint8(VaultTypes.VaultStatus.UNLOCKED));
    }
}
