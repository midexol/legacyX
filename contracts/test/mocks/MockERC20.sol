// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Stand-in for FXRP in tests. Local-chain vault tests never hit the
/// OFT `send` path (homeEid == localEid for every beneficiary), so this
/// plain ERC20 is enough; cross-chain claim tests use a real LayerZero
/// TestHelper OFT setup instead (see CrossChainClaim.t.sol).
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock FXRP", "mFXRP") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
