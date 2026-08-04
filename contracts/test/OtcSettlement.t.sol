// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {OtcSettlement} from "../src/OtcSettlement.sol";
import {IOtcSettlement} from "../src/interfaces/IOtcSettlement.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract OtcSettlementTest is Test {
    MockERC20 fxrp; // asset being sold
    MockERC20 usdc; // quote/payment token
    OtcSettlement otc;

    address owner = makeAddr("owner");
    address matcher = makeAddr("matcher");
    address seller = makeAddr("seller");
    address buyer = makeAddr("buyer");

    function setUp() public {
        fxrp = new MockERC20();
        usdc = new MockERC20();
        otc = new OtcSettlement(fxrp, usdc, matcher, owner);

        fxrp.mint(seller, 1_000 ether);
        usdc.mint(buyer, 1_000 ether);

        vm.prank(seller);
        fxrp.approve(address(otc), type(uint256).max);
        vm.prank(buyer);
        usdc.approve(address(otc), type(uint256).max);
    }

    function test_escrowAndSettle_swapsAtomically() public {
        vm.prank(seller);
        otc.escrow(100 ether);
        assertEq(otc.escrowOf(seller), 100 ether);
        assertEq(fxrp.balanceOf(address(otc)), 100 ether);

        vm.prank(matcher);
        otc.settle(bytes32(uint256(1)), seller, buyer, 40 ether, 20 ether);

        assertEq(fxrp.balanceOf(buyer), 40 ether);
        assertEq(usdc.balanceOf(seller), 20 ether);
        assertEq(otc.escrowOf(seller), 60 ether);
    }

    function test_settle_onlyMatcher() public {
        vm.prank(seller);
        otc.escrow(100 ether);

        vm.prank(buyer);
        vm.expectRevert(IOtcSettlement.NotMatcher.selector);
        otc.settle(bytes32(uint256(1)), seller, buyer, 40 ether, 20 ether);
    }

    function test_settle_revertsOnReplay() public {
        vm.prank(seller);
        otc.escrow(100 ether);

        vm.prank(matcher);
        otc.settle(bytes32(uint256(1)), seller, buyer, 40 ether, 20 ether);

        vm.prank(matcher);
        vm.expectRevert(IOtcSettlement.TradeAlreadySettled.selector);
        otc.settle(bytes32(uint256(1)), seller, buyer, 10 ether, 5 ether);
    }

    function test_settle_revertsOnInsufficientEscrow() public {
        vm.prank(seller);
        otc.escrow(10 ether);

        vm.prank(matcher);
        vm.expectRevert(IOtcSettlement.InsufficientEscrow.selector);
        otc.settle(bytes32(uint256(1)), seller, buyer, 40 ether, 20 ether);
    }

    function test_withdrawEscrow_returnsFunds() public {
        vm.startPrank(seller);
        otc.escrow(100 ether);
        otc.withdrawEscrow(30 ether);
        vm.stopPrank();

        assertEq(otc.escrowOf(seller), 70 ether);
        assertEq(fxrp.balanceOf(seller), 930 ether);
    }

    function test_setMatcher_onlyOwner() public {
        vm.prank(seller);
        vm.expectRevert();
        otc.setMatcher(seller);

        vm.prank(owner);
        otc.setMatcher(seller);
        assertEq(otc.matcher(), seller);
    }
}
