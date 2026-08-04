// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LegacyVaultRelay} from "../src/LegacyVaultRelay.sol";

/// @notice Deploys LegacyVaultRelay on whichever chain `--rpc-url` points at.
/// Run once per chain:
///   forge script script/DeployRelay.s.sol --rpc-url flare_coston2 --broadcast
///   forge script script/DeployRelay.s.sol --rpc-url base_sepolia --broadcast
/// Then wire the deployed addresses together with WirePeers.s.sol.
contract DeployRelay is Script {
    function run() external returns (LegacyVaultRelay relay) {
        address endpoint = vm.envAddress("LZ_ENDPOINT");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);
        relay = new LegacyVaultRelay(endpoint, deployer);
        vm.stopBroadcast();

        console.log("LegacyVaultRelay deployed:", address(relay));
    }
}
