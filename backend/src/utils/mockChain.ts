import { randomBytes } from "crypto";

// Real settlement (on-chain matching/escrow) is out of scope for this
// backend track (see contracts/ — separate workstream). These helpers stand
// in for the on-chain effects — a counterparty address, a settlement tx hash
// — so the OTC matching simulation behaves plausibly without a real chain.

export function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function mockTxHash(): string {
  return `0x${randomBytes(32).toString("hex")}`;
}

export function mockAddress(): string {
  return `0x${randomBytes(20).toString("hex")}`;
}
