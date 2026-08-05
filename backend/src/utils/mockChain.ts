import { randomBytes } from "crypto";

// The vault/OTC settlement contracts are out of scope for this backend track
// (see contracts/ — separate workstream). These helpers stand in for the
// on-chain effects so the rest of the system (balances, statuses, claim
// history) behaves exactly as it will once real contract calls are wired in.

export function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function mockTxHash(): string {
  return `0x${randomBytes(32).toString("hex")}`;
}

// Used by the public marketplace's matching simulation (see
// src/services/marketplaceMatching.service.ts) to stand in for a
// counterparty's wallet address — there's no real buy-side liquidity to
// match against for the hackathon.
export function mockAddress(): string {
  return `0x${randomBytes(20).toString("hex")}`;
}
