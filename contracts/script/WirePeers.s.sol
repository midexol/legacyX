// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LegacyVaultRelay} from "../src/LegacyVaultRelay.sol";

/// @notice Tells this chain's relay to trust a peer relay on another chain.
/// Must be run once per direction (A -> B and B -> A), each against its own
/// `--rpc-url`:
///   LOCAL_RELAY=<relayOnA> REMOTE_EID=<eidB> REMOTE_RELAY=<relayOnB> \
///     forge script script/WirePeers.s.sol --rpc-url flare_coston2 --broadcast
///   LOCAL_RELAY=<relayOnB> REMOTE_EID=<eidA> REMOTE_RELAY=<relayOnA> \
///     forge script script/WirePeers.s.sol --rpc-url base_sepolia --broadcast
contract WirePeers is Script {
    function run() external {
        address localRelay = vm.envAddress("LOCAL_RELAY");
        uint32 remoteEid = uint32(vm.envUint("REMOTE_EID"));
        address remoteRelay = vm.envAddress("REMOTE_RELAY");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        LegacyVaultRelay(localRelay).setPeer(remoteEid, bytes32(uint256(uint160(remoteRelay))));
        vm.stopBroadcast();

        console.log("Peer set: local", localRelay, "-> peer", remoteRelay);
        console.log("  remote eid:", remoteEid);
    }
}
