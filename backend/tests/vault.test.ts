import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app, randomWallet, signIn } from "./helpers";

describe("vaults", () => {
  let token: string;

  beforeAll(async () => {
    token = await signIn(randomWallet());
  });

  it("rejects unauthenticated requests", async () => {
    await request(app).get("/api/vaults").expect(401);
  });

  it("creates a vault, deposits, and withdraws", async () => {
    const createRes = await request(app)
      .post("/api/vaults")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Vault" })
      .expect(201);

    expect(createRes.body.balance).toBe(0);
    const vaultId = createRes.body.id;

    const depositRes = await request(app)
      .post(`/api/vaults/${vaultId}/deposit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100 })
      .expect(200);
    expect(depositRes.body.vault.balance).toBe(100);

    const overWithdraw = await request(app)
      .post(`/api/vaults/${vaultId}/withdraw`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 1000 });
    expect(overWithdraw.status).toBe(400);

    const withdrawRes = await request(app)
      .post(`/api/vaults/${vaultId}/withdraw`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 40 })
      .expect(200);
    expect(withdrawRes.body.vault.balance).toBe(60);
  });

  it("prevents another owner from accessing someone else's vault", async () => {
    const createRes = await request(app)
      .post("/api/vaults")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Private Vault" })
      .expect(201);

    const otherToken = await signIn(randomWallet());
    await request(app)
      .get(`/api/vaults/${createRes.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);
  });

  it("rejects beneficiary allocations that exceed 100%", async () => {
    const createRes = await request(app)
      .post("/api/vaults")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Allocation Vault" })
      .expect(201);
    const vaultId = createRes.body.id;

    await request(app)
      .post(`/api/vaults/${vaultId}/beneficiaries`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "First", address: randomWallet().address, allocation: 70 })
      .expect(201);

    const over = await request(app)
      .post(`/api/vaults/${vaultId}/beneficiaries`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Second", address: randomWallet().address, allocation: 40 });
    expect(over.status).toBe(400);

    const ok = await request(app)
      .post(`/api/vaults/${vaultId}/beneficiaries`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Second", address: randomWallet().address, allocation: 30 })
      .expect(201);
    expect(ok.body.allocationBps).toBe(3000);
  });
});
