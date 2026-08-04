import { ethers } from "ethers";
import { legacyVaultAbi, OnChainConditionStatus, OnChainVaultStatus } from "./legacyVaultAbi";
import { getOperatorWallet, getProvider, getTrustedVerifierWallet } from "./provider";
import { logger } from "../utils/logger";

export interface OnChainCondition {
  conditionType: number;
  status: number;
  satisfiedAt: number;
}

/// Thin wrapper around one deployed LegacyVault contract. Read calls use a
/// plain provider; writes use whichever signer is allowed to submit that
/// specific transaction (see provider.ts for why operator vs. trusted-verifier
/// are separate keys).
export class LegacyVaultClient {
  private readonly chainId: number;
  private readonly address: string;

  constructor(chainId: number, address: string) {
    this.chainId = chainId;
    this.address = address;
  }

  private readContract(): ethers.Contract {
    return new ethers.Contract(this.address, legacyVaultAbi, getProvider(this.chainId));
  }

  async getStatus(): Promise<number> {
    const status: bigint = await this.readContract().status();
    return Number(status);
  }

  async getOwner(): Promise<string> {
    return this.readContract().owner();
  }

  async getConditionsLength(): Promise<number> {
    const length: bigint = await this.readContract().conditionsLength();
    return Number(length);
  }

  async getCondition(onChainId: number): Promise<OnChainCondition> {
    const [conditionType, status, satisfiedAt] = await this.readContract().conditions(onChainId);
    return { conditionType: Number(conditionType), status: Number(status), satisfiedAt: Number(satisfiedAt) };
  }

  /// Sweeps an INACTIVITY condition on-chain. checkInactivity() is callable
  /// by anyone (see contracts/src/LegacyVault.sol), so this uses the
  /// operator wallet rather than the vault owner's.
  async checkInactivity(onChainConditionId: number): Promise<{ txHash: string; unlocked: boolean }> {
    const wallet = getOperatorWallet(this.chainId);
    const contract = new ethers.Contract(this.address, legacyVaultAbi, wallet);

    const tx = await contract.checkInactivity(onChainConditionId);
    const receipt = await tx.wait();
    logger.info({ chainId: this.chainId, vault: this.address, onChainConditionId, txHash: receipt.hash }, "checkInactivity submitted");

    const status = await this.getStatus();
    return { txHash: receipt.hash, unlocked: status === OnChainVaultStatus.UNLOCKED };
  }

  /// Attests a MANUAL_APPROVAL/LEGAL_DOCUMENT condition via the trusted
  /// verifier key, mirroring the backend's admin-gated verification endpoint.
  async verifyByTrustedVerifier(onChainConditionId: number): Promise<{ txHash: string; unlocked: boolean }> {
    const wallet = getTrustedVerifierWallet(this.chainId);
    const contract = new ethers.Contract(this.address, legacyVaultAbi, wallet);

    const tx = await contract.verifyByTrustedVerifier(onChainConditionId);
    const receipt = await tx.wait();
    logger.info({ chainId: this.chainId, vault: this.address, onChainConditionId, txHash: receipt.hash }, "verifyByTrustedVerifier submitted");

    const status = await this.getStatus();
    return { txHash: receipt.hash, unlocked: status === OnChainVaultStatus.UNLOCKED };
  }

  /// Relays an approver's own EIP-191 signature on-chain — the approver never
  /// needs gas or an on-chain transaction of their own, matching the backend's
  /// signature-based MULTI_PARTY_APPROVAL flow.
  async approveCondition(
    onChainConditionId: number,
    approverAddress: string,
    signature: string
  ): Promise<{ txHash: string; satisfied: boolean; unlocked: boolean }> {
    const wallet = getOperatorWallet(this.chainId);
    const contract = new ethers.Contract(this.address, legacyVaultAbi, wallet);

    const tx = await contract.approveCondition(onChainConditionId, approverAddress, signature);
    const receipt = await tx.wait();
    logger.info(
      { chainId: this.chainId, vault: this.address, onChainConditionId, approverAddress, txHash: receipt.hash },
      "approveCondition relayed on-chain"
    );

    const [condition, status] = await Promise.all([this.getCondition(onChainConditionId), this.getStatus()]);
    return {
      txHash: receipt.hash,
      satisfied: condition.status === OnChainConditionStatus.SATISFIED,
      unlocked: status === OnChainVaultStatus.UNLOCKED,
    };
  }
}
