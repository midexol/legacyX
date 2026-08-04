import { ethers } from "ethers";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

let rpcUrlByChainId: Record<string, string> | undefined;

function getRpcUrl(chainId: number): string {
  if (rpcUrlByChainId === undefined) {
    rpcUrlByChainId = env.RPC_URL_BY_CHAIN_ID ? JSON.parse(env.RPC_URL_BY_CHAIN_ID) : {};
  }
  const url = rpcUrlByChainId![String(chainId)];
  if (!url) {
    throw ApiError.badRequest(`No RPC URL configured for chainId ${chainId} (set RPC_URL_BY_CHAIN_ID)`);
  }
  return url;
}

const providerCache = new Map<number, ethers.JsonRpcProvider>();

export function getProvider(chainId: number): ethers.JsonRpcProvider {
  let provider = providerCache.get(chainId);
  if (!provider) {
    provider = new ethers.JsonRpcProvider(getRpcUrl(chainId));
    providerCache.set(chainId, provider);
  }
  return provider;
}

// Signs only the actions LegacyVault allows a third party to submit: sweeping
// an elapsed INACTIVITY window (checkInactivity) and relaying a beneficiary's
// or approver's own off-chain signature (approveCondition). Never used for
// owner-only actions.
export function getOperatorWallet(chainId: number): ethers.Wallet {
  if (!env.OPERATOR_PRIVATE_KEY) {
    throw ApiError.badRequest("OPERATOR_PRIVATE_KEY is not configured");
  }
  return new ethers.Wallet(env.OPERATOR_PRIVATE_KEY, getProvider(chainId));
}

// Stands in for the trusted-verifier integration (death certificate registry,
// legal document notarization) — a separate key from the operator wallet
// since it carries the authority to unilaterally satisfy a condition.
export function getTrustedVerifierWallet(chainId: number): ethers.Wallet {
  if (!env.TRUSTED_VERIFIER_PRIVATE_KEY) {
    throw ApiError.badRequest("TRUSTED_VERIFIER_PRIVATE_KEY is not configured");
  }
  return new ethers.Wallet(env.TRUSTED_VERIFIER_PRIVATE_KEY, getProvider(chainId));
}

export function isChainConfigured(): boolean {
  return Boolean(env.OPERATOR_PRIVATE_KEY);
}
