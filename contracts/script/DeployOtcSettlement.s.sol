// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OtcSettlement} from "../src/OtcSettlement.sol";

/// @notice Deploys the (single-chain) OTC settlement contract.
///   ASSET=<oftTokenOnThisChain> OTC_QUOTE_TOKEN=<quoteErc20> OTC_MATCHER=<backendSignerAddr> \
///     forge script script/DeployOtcSettlement.s.sol --rpc-url flare_coston2 --broadcast
contract DeployOtcSettlement is Script {
    function run() external returns (OtcSettlement otc) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        IERC20 assetToken = IERC20(vm.envAddress("ASSET"));
        IERC20 quoteToken = IERC20(vm.envAddress("OTC_QUOTE_TOKEN"));
        address matcher = vm.envAddress("OTC_MATCHER");

        vm.startBroadcast(deployerKey);
        otc = new OtcSettlement(assetToken, quoteToken, matcher, deployer);
        vm.stopBroadcast();

        console.log("OtcSettlement deployed:", address(otc));
    }
}
