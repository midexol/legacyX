// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LegacyVault} from "../src/LegacyVault.sol";
import {ILegacyVault} from "../src/interfaces/ILegacyVault.sol";
import {VaultTypes} from "../src/libraries/VaultTypes.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract LegacyVaultTest is Test {
    uint32 constant LOCAL_EID = 1;
    uint32 constant INACTIVITY_DAYS = 365;

    MockERC20 asset;
    LegacyVault vault;

    address owner = makeAddr("owner");
    address verifier = makeAddr("verifier");
    address alice = makeAddr("alice"); // beneficiary, same chain
    address bob = makeAddr("bob"); // beneficiary, same chain

    function setUp() public {
        asset = new MockERC20();
        asset.mint(owner, 1_000 ether);

        vm.prank(owner);
        vault = new LegacyVault(owner, asset, LOCAL_EID, "John's Estate", INACTIVITY_DAYS, verifier, address(0));

        vm.prank(owner);
        asset.approve(address(vault), type(uint256).max);
    }

    function _deposit(uint256 amount) internal {
        vm.prank(owner);
        vault.deposit(amount);
    }

    // --- deposit / withdraw -------------------------------------------------------

    function test_deposit_increasesBalance() public {
        _deposit(100 ether);
        assertEq(vault.balance(), 100 ether);
        assertEq(asset.balanceOf(address(vault)), 100 ether);
    }

    function test_withdraw_onlyOwner() public {
        _deposit(100 ether);
        vm.prank(alice);
        vm.expectRevert(ILegacyVault.NotOwner.selector);
        vault.withdraw(10 ether);
    }

    function test_withdraw_returnsFunds() public {
        _deposit(100 ether);
        vm.prank(owner);
        vault.withdraw(40 ether);
        assertEq(vault.balance(), 60 ether);
        assertEq(asset.balanceOf(owner), 940 ether);
    }

    // --- beneficiaries --------------------------------------------------------------

    function test_addBeneficiary_revertsOverAllocation() public {
        vm.startPrank(owner);
        vault.addBeneficiary(alice, LOCAL_EID, 6_000);
        vm.expectRevert(ILegacyVault.AllocationExceeds100Percent.selector);
        vault.addBeneficiary(bob, LOCAL_EID, 5_000);
        vm.stopPrank();
    }

    // --- inactivity condition + local claim -----------------------------------------

    function test_inactivityUnlock_andLocalClaim() public {
        _deposit(100 ether);

        vm.startPrank(owner);
        vault.addBeneficiary(alice, LOCAL_EID, 6_000); // 60%
        vault.addBeneficiary(bob, LOCAL_EID, 4_000); // 40%
        uint256 conditionId = vault.addInactivityCondition();
        vm.stopPrank();

        // Not yet elapsed: sweeping just flips to PENDING_VERIFICATION.
        vault.checkInactivity(conditionId);
        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.PENDING_VERIFICATION));

        vm.warp(block.timestamp + INACTIVITY_DAYS * 1 days + 1);
        vault.checkInactivity(conditionId);

        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.UNLOCKED));
        assertEq(vault.unlockedBalance(), 100 ether);

        vm.prank(alice);
        vault.claim(0, "");
        assertEq(asset.balanceOf(alice), 60 ether);

        vm.prank(bob);
        vault.claim(1, "");
        assertEq(asset.balanceOf(bob), 40 ether);

        // Double claim is a no-op revert, not a double payout.
        vm.prank(alice);
        vm.expectRevert(ILegacyVault.NothingToClaim.selector);
        vault.claim(0, "");
    }

    function test_heartbeat_resetsPendingVerification() public {
        vm.prank(owner);
        uint256 conditionId = vault.addInactivityCondition();

        vm.warp(block.timestamp + INACTIVITY_DAYS * 1 days - 1 days);
        vault.checkInactivity(conditionId);
        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.PENDING_VERIFICATION));

        vm.prank(owner);
        vault.pingHeartbeat();
        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.ACTIVE));
    }

    function test_claim_wrongBeneficiaryReverts() public {
        _deposit(100 ether);
        vm.startPrank(owner);
        vault.addBeneficiary(alice, LOCAL_EID, 10_000);
        uint256 conditionId = vault.addInactivityCondition();
        vm.stopPrank();

        vm.warp(block.timestamp + INACTIVITY_DAYS * 1 days + 1);
        vault.checkInactivity(conditionId);

        vm.prank(bob);
        vm.expectRevert(ILegacyVault.NotABeneficiary.selector);
        vault.claim(0, "");
    }

    // --- manual / legal-document verification ---------------------------------------

    function test_verifyByTrustedVerifier_unlocksVault() public {
        _deposit(50 ether);
        vm.startPrank(owner);
        vault.addBeneficiary(alice, LOCAL_EID, 10_000);
        uint256 conditionId = vault.addManualApprovalCondition();
        vm.stopPrank();

        vm.prank(alice);
        vm.expectRevert(ILegacyVault.NotVerifier.selector);
        vault.verifyByTrustedVerifier(conditionId);

        vm.prank(verifier);
        vault.verifyByTrustedVerifier(conditionId);

        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.UNLOCKED));
    }

    // --- multi-party approval (signature-based, chain-agnostic) ----------------------

    function test_multiPartyApproval_quorumUnlocks() public {
        (address approver1, uint256 pk1) = makeAddrAndKey("approver1");
        (address approver2, uint256 pk2) = makeAddrAndKey("approver2");
        (, uint256 pk3) = makeAddrAndKey("approver3");

        address[] memory approvers = new address[](3);
        approvers[0] = approver1;
        approvers[1] = approver2;
        approvers[2] = vm.addr(pk3);

        vm.prank(owner);
        uint256 conditionId = vault.addMultiPartyApprovalCondition(approvers, 2);

        bytes32 digest =
            keccak256(abi.encodePacked("Approve inheritance condition ", conditionId, " for vault ", address(vault)));
        bytes32 ethSigned = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", digest));

        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(pk1, ethSigned);
        vault.approveCondition(conditionId, approver1, abi.encodePacked(r1, s1, v1));
        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.ACTIVE));

        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(pk2, ethSigned);
        vault.approveCondition(conditionId, approver2, abi.encodePacked(r2, s2, v2));

        assertEq(uint8(vault.status()), uint8(VaultTypes.VaultStatus.UNLOCKED));
    }

    function test_multiPartyApproval_rejectsNonApprover() public {
        address[] memory approvers = new address[](2);
        approvers[0] = alice;
        approvers[1] = bob;

        vm.prank(owner);
        uint256 conditionId = vault.addMultiPartyApprovalCondition(approvers, 2);

        (, uint256 outsiderPk) = makeAddrAndKey("outsider");
        address outsider = vm.addr(outsiderPk);

        bytes32 digest =
            keccak256(abi.encodePacked("Approve inheritance condition ", conditionId, " for vault ", address(vault)));
        bytes32 ethSigned = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", digest));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(outsiderPk, ethSigned);

        vm.expectRevert(ILegacyVault.NotAnApprover.selector);
        vault.approveCondition(conditionId, outsider, abi.encodePacked(r, s, v));
    }

    function test_addBeneficiary_afterUnlockReverts() public {
        vm.startPrank(owner);
        uint256 conditionId = vault.addManualApprovalCondition();
        vm.stopPrank();
        vm.prank(verifier);
        vault.verifyByTrustedVerifier(conditionId);

        vm.prank(owner);
        vm.expectRevert(ILegacyVault.VaultAlreadyUnlocked.selector);
        vault.addBeneficiary(alice, LOCAL_EID, 1_000);
    }
}
