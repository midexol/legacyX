import { getBytes, solidityPackedKeccak256 } from "ethers";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app, randomWallet, signIn } from "./helpers";
import { env } from "../src/config/env";
import { verifyOnChainApprovalSignature } from "../src/utils/signature";

// LegacyVaultClient talks to a real RPC endpoint — replace it with a fake
// that records calls and returns configurable on-chain state, so these tests
// exercise the backend's wiring (which method gets called, how the result is
// mirrored into Prisma) without needing a live chain.
const chainState = {
  owner: "",
  conditionsLength: 1,
  conditions: [{ conditionType: 0, status: 0, satisfiedAt: 0 }] as {
    conditionType: number;
    status: number;
    satisfiedAt: number;
  }[],
  checkInactivityUnlocked: false,
  verifyByTrustedVerifierUnlocked: false,
  approveConditionResult: { satisfied: false, unlocked: false },
};

const chainClientCalls = {
  checkInactivity: vi.fn(),
  verifyByTrustedVerifier: vi.fn(),
  approveCondition: vi.fn(),
};

vi.mock("../src/chain/legacyVaultClient", () => {
  class LegacyVaultClient {
    constructor(
      public chainId: number,
      public address: string
    ) {}

    async getOwner() {
      return chainState.owner;
    }

    async getConditionsLength() {
      return chainState.conditionsLength;
    }

    async getCondition(onChainId: number) {
      return chainState.conditions[onChainId];
    }

    async getStatus() {
      return 0;
    }

    async checkInactivity(onChainConditionId: number) {
      chainClientCalls.checkInactivity(onChainConditionId);
      return { txHash: "0xmock", unlocked: chainState.checkInactivityUnlocked };
    }

    async verifyByTrustedVerifier(onChainConditionId: number) {
      chainClientCalls.verifyByTrustedVerifier(onChainConditionId);
      return { txHash: "0xmock", unlocked: chainState.verifyByTrustedVerifierUnlocked };
    }

    async approveCondition(onChainConditionId: number, approverAddress: string, signature: string) {
      chainClientCalls.approveCondition(onChainConditionId, approverAddress, signature);
      return { txHash: "0xmock", ...chainState.approveConditionResult };
    }
  }

  return { LegacyVaultClient };
});

describe("chain-linked vault", () => {
  let ownerWallet: ReturnType<typeof randomWallet>;
  let ownerToken: string;
  const contractAddress = "0x1234567890123456789012345678901234567890";
  const chainId = 114;

  beforeAll(async () => {
    ownerWallet = randomWallet();
    ownerToken = await signIn(ownerWallet);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    chainState.owner = ownerWallet.address;
    chainState.conditionsLength = 1;
    chainState.conditions = [{ conditionType: 0, status: 0, satisfiedAt: 0 }];
    chainState.checkInactivityUnlocked = false;
    chainState.verifyByTrustedVerifierUnlocked = false;
    chainState.approveConditionResult = { satisfied: false, unlocked: false };
  });

  async function createVault(name: string) {
    const res = await request(app)
      .post("/api/vaults")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name })
      .expect(201);
    return res.body.id as string;
  }

  it("rejects linking a contract whose owner() does not match the caller's wallet", async () => {
    chainState.owner = randomWallet().address; // someone else's contract
    const vaultId = await createVault("Mismatched Owner Vault");

    await request(app)
      .post(`/api/vaults/${vaultId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ chainId, contractAddress })
      .expect(400);
  });

  it("links a vault whose on-chain owner() matches the caller", async () => {
    const vaultId = await createVault("Linked Vault");

    const res = await request(app)
      .post(`/api/vaults/${vaultId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ chainId, contractAddress })
      .expect(200);

    expect(res.body.chainId).toBe(chainId);
    expect(res.body.contractAddress.toLowerCase()).toBe(contractAddress.toLowerCase());
  });

  it("rejects linking a condition whose on-chain type does not match", async () => {
    const vaultId = await createVault("Type Mismatch Vault");
    await request(app)
      .post(`/api/vaults/${vaultId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ chainId, contractAddress })
      .expect(200);

    const conditionRes = await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "MANUAL_APPROVAL" })
      .expect(201);

    // chainState.conditions[0] is INACTIVITY (0), condition is MANUAL_APPROVAL.
    await request(app)
      .post(`/api/vaults/${vaultId}/conditions/${conditionRes.body.id}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ onChainId: 0 })
      .expect(400);
  });

  it("relays the inactivity sweep on-chain and mirrors an unlock into Prisma", async () => {
    const vaultId = await createVault("Inactivity Vault");
    await request(app)
      .post(`/api/vaults/${vaultId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ chainId, contractAddress })
      .expect(200);

    const conditionRes = await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "INACTIVITY" })
      .expect(201);

    await request(app)
      .post(`/api/vaults/${vaultId}/conditions/${conditionRes.body.id}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ onChainId: 0 })
      .expect(200);

    chainState.checkInactivityUnlocked = true;

    await request(app)
      .post(`/api/vaults/${vaultId}/verify`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);

    expect(chainClientCalls.checkInactivity).toHaveBeenCalledWith(0);

    const vaultAfter = await request(app)
      .get(`/api/vaults/${vaultId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    expect(vaultAfter.body.status).toBe("UNLOCKED");
  });

  it("submits the trusted-verifier attestation on-chain before mirroring the result", async () => {
    const vaultId = await createVault("Legal Vault");
    await request(app)
      .post(`/api/vaults/${vaultId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ chainId, contractAddress })
      .expect(200);

    chainState.conditions = [{ conditionType: 3, status: 0, satisfiedAt: 0 }]; // LEGAL_DOCUMENT
    const conditionRes = await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "LEGAL_DOCUMENT", config: { documentRef: "probate-order-1" } })
      .expect(201);

    await request(app)
      .post(`/api/vaults/${vaultId}/conditions/${conditionRes.body.id}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ onChainId: 0 })
      .expect(200);

    await request(app)
      .post(`/api/conditions/${conditionRes.body.id}/verify`)
      .set("x-admin-key", env.ADMIN_API_KEY)
      .expect(200);

    expect(chainClientCalls.verifyByTrustedVerifier).toHaveBeenCalledWith(0);

    const vaultAfter = await request(app)
      .get(`/api/vaults/${vaultId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    expect(vaultAfter.body.status).toBe("UNLOCKED");
  });

  it("verifies and relays a multi-party approval using the on-chain digest format", async () => {
    const vaultId = await createVault("Multi-Party Chain Vault");
    await request(app)
      .post(`/api/vaults/${vaultId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ chainId, contractAddress })
      .expect(200);

    const approverA = randomWallet();
    const approverB = randomWallet();
    chainState.conditions = [{ conditionType: 2, status: 0, satisfiedAt: 0 }]; // MULTI_PARTY_APPROVAL

    const conditionRes = await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "MULTI_PARTY_APPROVAL",
        config: { requiredApprovals: 1, approvers: [approverA.address, approverB.address] },
      })
      .expect(201);
    const conditionId = conditionRes.body.id;

    await request(app)
      .post(`/api/vaults/${vaultId}/conditions/${conditionId}/link-chain`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ onChainId: 0 })
      .expect(200);

    // An off-chain-style signature (plain string) must be rejected once linked.
    const offChainMessage = `Approve inheritance condition ${conditionId} for vault ${vaultId}`;
    const wrongFormatSig = await approverA.signMessage(offChainMessage);
    await request(app)
      .post(`/api/conditions/${conditionId}/approve`)
      .send({ address: approverA.address, signature: wrongFormatSig })
      .expect(401);

    // The correctly-formatted on-chain digest signature is accepted and relayed.
    chainState.approveConditionResult = { satisfied: true, unlocked: true };
    const digest = solidityPackedKeccak256(
      ["string", "uint256", "string", "address"],
      ["Approve inheritance condition ", 0, " for vault ", contractAddress]
    );
    const onChainSig = await approverA.signMessage(getBytes(digest));
    expect(verifyOnChainApprovalSignature(0, contractAddress, onChainSig, approverA.address)).toBe(true);

    const approveRes = await request(app)
      .post(`/api/conditions/${conditionId}/approve`)
      .send({ address: approverA.address, signature: onChainSig })
      .expect(200);

    expect(chainClientCalls.approveCondition).toHaveBeenCalledWith(0, approverA.address, onChainSig);
    expect(approveRes.body.status).toBe("SATISFIED");

    const vaultAfter = await request(app)
      .get(`/api/vaults/${vaultId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    expect(vaultAfter.body.status).toBe("UNLOCKED");
  });
});
