import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, randomWallet } from "./helpers";

describe("auth", () => {
  it("rejects a non-EVM address", async () => {
    const res = await request(app).post("/api/auth/nonce").send({ address: "not-an-address" });
    expect(res.status).toBe(400);
  });

  it("issues a session token for a valid signature and rejects a bad one", async () => {
    const wallet = randomWallet();

    const nonceRes = await request(app)
      .post("/api/auth/nonce")
      .send({ address: wallet.address })
      .expect(200);
    expect(nonceRes.body.message).toContain(wallet.address);

    const badVerify = await request(app)
      .post("/api/auth/verify")
      .send({ address: wallet.address, signature: "0x" + "00".repeat(65) });
    expect(badVerify.status).toBe(401);

    const signature = await wallet.signMessage(nonceRes.body.message);
    const verifyRes = await request(app)
      .post("/api/auth/verify")
      .send({ address: wallet.address, signature })
      .expect(200);

    expect(verifyRes.body.token).toEqual(expect.any(String));
    expect(verifyRes.body.address.toLowerCase()).toBe(wallet.address.toLowerCase());
  });

  it("rejects a replayed signature after the nonce has rotated", async () => {
    const wallet = randomWallet();
    const nonceRes = await request(app)
      .post("/api/auth/nonce")
      .send({ address: wallet.address })
      .expect(200);
    const signature = await wallet.signMessage(nonceRes.body.message);

    await request(app).post("/api/auth/verify").send({ address: wallet.address, signature }).expect(200);
    // Same signature again, over the now-stale nonce message, should fail.
    await request(app).post("/api/auth/verify").send({ address: wallet.address, signature }).expect(401);
  });
});
