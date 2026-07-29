import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, randomWallet, signIn } from "./helpers";

describe("private OTC marketplace", () => {
  it("never reveals order ownership to third parties, only to the owner", async () => {
    const sellerToken = await signIn(randomWallet());
    const orderRes = await request(app)
      .post("/api/otc/orders")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ side: "SELL", amount: 10, price: 1 })
      .expect(201);
    expect(orderRes.body.ownerAddress).toEqual(expect.any(String));

    const anonView = await request(app).get("/api/otc/orders").expect(200);
    const row = anonView.body.find((o: { id: string }) => o.id === orderRes.body.id);
    expect(row).toBeDefined();
    expect(row.mine).toBe(false);
    expect(row.ownerAddress).toBeUndefined();

    const ownerView = await request(app)
      .get("/api/otc/orders")
      .set("Authorization", `Bearer ${sellerToken}`)
      .expect(200);
    const ownRow = ownerView.body.find((o: { id: string }) => o.id === orderRes.body.id);
    expect(ownRow.mine).toBe(true);
    expect(ownRow.ownerAddress).toEqual(expect.any(String));
  });

  it("partially fills the larger order and settles the smaller one", async () => {
    const sellerToken = await signIn(randomWallet());
    const buyerToken = await signIn(randomWallet());

    const sellRes = await request(app)
      .post("/api/otc/orders")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ side: "SELL", amount: 100, price: 0.5 })
      .expect(201);

    const buyRes = await request(app)
      .post("/api/otc/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ side: "BUY", amount: 40, price: 0.6 })
      .expect(201);

    expect(buyRes.body.status).toBe("SETTLED");
    expect(buyRes.body.amount).toBe(0);

    const sellerView = await request(app)
      .get("/api/otc/orders")
      .set("Authorization", `Bearer ${sellerToken}`)
      .expect(200);
    const sellRow = sellerView.body.find((o: { id: string }) => o.id === sellRes.body.id);
    expect(sellRow.status).toBe("OPEN");
    expect(sellRow.amount).toBe(60);

    const trades = await request(app).get("/api/otc/trades").expect(200);
    expect(trades.body.some((t: { amount: number }) => t.amount === 40)).toBe(true);
  });

  it("only lets the owner cancel their own open order", async () => {
    const ownerToken = await signIn(randomWallet());
    const otherToken = await signIn(randomWallet());

    const orderRes = await request(app)
      .post("/api/otc/orders")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ side: "SELL", amount: 5, price: 9.99 })
      .expect(201);

    await request(app)
      .delete(`/api/otc/orders/${orderRes.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);

    await request(app)
      .delete(`/api/otc/orders/${orderRes.body.id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
  });
});
