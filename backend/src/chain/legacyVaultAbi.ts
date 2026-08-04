// Minimal human-readable ABI for contracts/src/LegacyVault.sol — only the
// functions this backend actually calls or reads. Keep in sync with the
// deployed contract; the full ABI lives in contracts/out/LegacyVault.sol/LegacyVault.json.
export const legacyVaultAbi = [
  "function owner() view returns (address)",
  "function trustedVerifier() view returns (address)",
  "function status() view returns (uint8)",
  "function lastHeartbeatAt() view returns (uint64)",
  "function inactivityDays() view returns (uint32)",
  "function conditionsLength() view returns (uint256)",
  "function conditions(uint256) view returns (uint8 conditionType, uint8 status, uint64 satisfiedAt)",
  "function checkInactivity(uint256 conditionId)",
  "function verifyByTrustedVerifier(uint256 conditionId)",
  "function approveCondition(uint256 conditionId, address approver, bytes signature)",
  "event ConditionSatisfied(uint256 indexed conditionId)",
  "event VaultUnlocked(uint256 unlockedBalance, uint256 timestamp)",
] as const;

// Mirrors VaultTypes.VaultStatus / VaultTypes.ConditionStatus in
// contracts/src/libraries/VaultTypes.sol
export const OnChainVaultStatus = { ACTIVE: 0, PENDING_VERIFICATION: 1, UNLOCKED: 2 } as const;
export const OnChainConditionStatus = { PENDING: 0, SATISFIED: 1 } as const;

// Mirrors VaultTypes.ConditionType's declaration order exactly — order here
// must never change without a matching contract redeploy.
export const onChainConditionTypeNames = [
  "INACTIVITY",
  "MANUAL_APPROVAL",
  "MULTI_PARTY_APPROVAL",
  "LEGAL_DOCUMENT",
] as const;
