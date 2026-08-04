// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Shared enums/structs for LegacyVault, mirrored 1:1 with the backend's
/// Prisma schema (backend/prisma/schema.prisma) so both sides of the stack
/// agree on the state machine.
library VaultTypes {
    enum VaultStatus {
        ACTIVE,
        PENDING_VERIFICATION,
        UNLOCKED
    }

    enum ConditionType {
        INACTIVITY,
        MANUAL_APPROVAL,
        MULTI_PARTY_APPROVAL,
        LEGAL_DOCUMENT
    }

    enum ConditionStatus {
        PENDING,
        SATISFIED
    }

    /// @param account       Beneficiary's payout address.
    /// @param homeEid       LayerZero endpoint ID of the chain this beneficiary
    ///                      wants their payout on. If it matches the vault's
    ///                      own endpoint ID, the claim pays out locally;
    ///                      otherwise the vault bridges the payout via the
    ///                      OFT-wrapped asset's `send`.
    /// @param allocationBps Share of the vault, in basis points (10_000 = 100%).
    struct Beneficiary {
        address account;
        uint32 homeEid;
        uint16 allocationBps;
    }

    struct MultiPartyConfig {
        uint8 requiredApprovals;
        address[] approvers;
    }
}
