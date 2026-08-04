// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LegacyVault} from "../src/LegacyVault.sol";

/// @notice Deploys one LegacyVault on whichever chain `--rpc-url` points at,
/// and self-registers it with that chain's already-deployed LegacyVaultRelay.
///   ASSET=<oftTokenOnThisChain> LOCAL_EID=<eid> RELAY=<relayOnThisChain> \
///     VAULT_OWNER=<owner> TRUSTED_VERIFIER=<verifier> \
///     forge script script/DeployVault.s.sol --rpc-url flare_coston2 --broadcast
contract DeployVault is Script {
    function run() external returns (LegacyVault vault) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("VAULT_OWNER");
        IERC20 asset = IERC20(vm.envAddress("ASSET"));
        uint32 localEid = uint32(vm.envUint("LOCAL_EID"));
        string memory name = vm.envOr("VAULT_NAME", string("LegacyX Estate"));
        uint32 inactivityDays = uint32(vm.envOr("VAULT_INACTIVITY_DAYS", uint256(365)));
        address trustedVerifier = vm.envAddress("TRUSTED_VERIFIER");
        address relay = vm.envOr("RELAY", address(0));

        vm.startBroadcast(deployerKey);
        vault = new LegacyVault(owner, asset, localEid, name, inactivityDays, trustedVerifier, relay);
        vm.stopBroadcast();

        console.log("LegacyVault deployed:", address(vault));
    }
}
