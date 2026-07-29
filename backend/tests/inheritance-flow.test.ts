import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app, randomWallet, signIn } from "./helpers";
import { env } from "../src/config/env";

async function createFundedVault(token: string, name: string) {
  const res = await request(app)
    .post("/api/vaults")
    .set("Authorization", `Bearer ${token}`)
    .send({ name })
    .expect(201);
  await request(app)
    .post(`/api/vaults/${res.body.id}/deposit`)
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 100 })
    .expect(200);
  return res.body.id as string;
}

describe("inheritance conditions and claims", () => {
  let ownerToken: string;

  beforeAll(async () => {
    ownerToken = await signIn(randomWallet());
  });

  it("unlocks via multi-party approval once the quorum signs", async () => {
    const vaultId = await createFundedVault(ownerToken, "Multi-Party Vault");
    const beneficiary = randomWallet();
    await request(app)
      .post(`/api/vaults/${vaultId}/beneficiaries`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Sole Heir", address: beneficiary.address, allocation: 100 })
      .expect(201);

    const approverA = randomWallet();
    const approverB = randomWallet();

    const conditionRes = await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "MULTI_PARTY_APPROVAL",
        config: { requiredApprovals: 2, approvers: [approverA.address, approverB.address] },
      })
      .expect(201);
    const conditionId = conditionRes.body.id;

    const messageA = `Approve inheritance condition ${conditionId} for vault ${vaultId}`;
    const sigA = await approverA.signMessage(messageA);
    const afterFirst = await request(app)
      .post(`/api/conditions/${conditionId}/approve`)
      .send({ address: approverA.address, signature: sigA })
      .expect(200);
    expect(afterFirst.body.status).toBe("PENDING");

    // A second approval from the same approver should be rejected.
    await request(app)
      .post(`/api/conditions/${conditionId}/approve`)
      .send({ address: approverA.address, signature: sigA })
      .expect(409);

    const sigB = await approverB.signMessage(messageA);
    const afterSecond = await request(app)
      .post(`/api/conditions/${conditionId}/approve`)
      .send({ address: approverB.address, signature: sigB })
      .expect(200);
    expect(afterSecond.body.status).toBe("SATISFIED");

    const vaultAfter = await request(app)
      .get(`/api/vaults/${vaultId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    expect(vaultAfter.body.status).toBe("UNLOCKED");
  });

  it("unlocks via the trusted-verifier (admin) flow for LEGAL_DOCUMENT conditions", async () => {
    const vaultId = await createFundedVault(ownerToken, "Legal Document Vault");
    const conditionRes = await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "LEGAL_DOCUMENT", config: { documentRef: "probate-court-order-123" } })
      .expect(201);

    await request(app).post(`/api/conditions/${conditionRes.body.id}/verify`).expect(401);
    await request(app)
      .post(`/api/conditions/${conditionRes.body.id}/verify`)
      .set("x-admin-key", "wrong-key")
      .expect(401);

    await request(app)
      .post(`/api/conditions/${conditionRes.body.id}/verify`)
      .set("x-admin-key", env.ADMIN_API_KEY)
      .expect(200);

    const vaultAfter = await request(app)
      .get(`/api/vaults/${vaultId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    expect(vaultAfter.body.status).toBe("UNLOCKED");
  });

  it("lets a beneficiary look up and claim their share exactly once", async () => {
    const vaultId = await createFundedVault(ownerToken, "Claim Vault");
    const beneficiary = randomWallet();
    const benRes = await request(app)
      .post(`/api/vaults/${vaultId}/beneficiaries`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Heir", address: beneficiary.address, allocation: 100 })
      .expect(201);

    await request(app)
      .post(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "MANUAL_APPROVAL" })
      .expect(201);
    const conditions = await request(app)
      .get(`/api/vaults/${vaultId}/conditions`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    const conditionId = conditions.body[0].id;
    await request(app)
      .post(`/api/conditions/${conditionId}/verify`)
      .set("x-admin-key", env.ADMIN_API_KEY)
      .expect(200);

    const claimable = await request(app).get(`/api/claims/${beneficiary.address}`).expect(200);
    expect(claimable.body).toHaveLength(1);
    expect(claimable.body[0].claimableAmount).toBe(100);

    const message = `Claim inheritance payout from vault ${vaultId} as beneficiary ${benRes.body.id}`;
    const signature = await beneficiary.signMessage(message);

    // Wrong signer is rejected.
    const impostor = randomWallet();
    const badSig = await impostor.signMessage(message);
    await request(app).post(`/api/claims/${vaultId}/${benRes.body.id}`).send({ signature: badSig }).expect(401);

    await request(app)
      .post(`/api/claims/${vaultId}/${benRes.body.id}`)
      .send({ signature })
      .expect(201);

    // Double-claim is rejected.
    await request(app).post(`/api/claims/${vaultId}/${benRes.body.id}`).send({ signature }).expect(409);

    const claimableAfter = await request(app).get(`/api/claims/${beneficiary.address}`).expect(200);
    expect(claimableAfter.body).toHaveLength(0);
  });
});
