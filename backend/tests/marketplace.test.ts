import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers";
import { runMatchingSweep } from "../src/services/matching.service";

const SELLER = "0x9F2a0000000000000000000000000000000044Cb";
const OTHER = "0x000000000000000000000000000000000000dEaD";

describe("POST /api/orders", () => {
  it("rejects an unsupported asset", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ asset: "BTC", amount: "10", minPrice: "0.5", sellerAddress: SELLER })
      .expect(400);
    expect(res.body.error).toMatch(/asset/i);
  });

  it("rejects a non-positive amount", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ asset: "FXRP", amount: "0", minPrice: "0.5", sellerAddress: SELLER })
      .expect(400);
    expect(res.body.error).toMatch(/amount/i);
  });

  it("rejects a non-numeric amount instead of coercing it with parseFloat", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ asset: "FXRP", amount: "12abc", minPrice: "0.5", sellerAddress: SELLER })
      .expect(400);
    expect(res.body.error).toMatch(/amount/i);
  });

  it("rejects a missing/invalid sellerAddress", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ asset: "FXRP", amount: "10", minPrice: "0.5", sellerAddress: "not-an-address" })
      .expect(400);
    expect(res.body.error).toMatch(/sellerAddress/i);
  });

  it("creates a pending order and returns the redacted shape", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ asset: "FXRP", amount: "250", minPrice: "0.52", sellerAddress: SELLER })
      .expect(201);

    expect(res.body).toMatchObject({ asset: "FXRP", amountRange: "100-500", status: "pending" });
    expect(res.body.id).toMatch(/^LX-\d+$/);
    expect(typeof res.body.createdAt).toBe("number");
    expect(res.body).not.toHaveProperty("sellerAddress");
    expect(res.body).not.toHaveProperty("amount");
    expect(res.body).not.toHaveProperty("minPrice");
  });
});

describe("GET /api/orders", () => {
  it("never leaks an address, exact amount, or price", async () => {
    await request(app)
      .post("/api/orders")
      .send({ asset: "FLR", amount: "42", minPrice: "1.10", sellerAddress: SELLER })
      .expect(201);

    const res = await request(app).get("/api/orders").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const order of res.body) {
      expect(order).not.toHaveProperty("sellerAddress");
      expect(order).not.toHaveProperty("buyerAddress");
      expect(order).not.toHaveProperty("amount");
      expect(order).not.toHaveProperty("price");
      expect(order).not.toHaveProperty("minPrice");
      expect(order.amountRange).toEqual(expect.any(String));
    }
  });
});

describe("GET /api/orders/mine", () => {
  it("returns only the given address's orders, unredacted", async () => {
    await request(app)
      .post("/api/orders")
      .send({ asset: "C2FLR", amount: "5", minPrice: "2", sellerAddress: SELLER })
      .expect(201);

    const mine = await request(app)
      .get(`/api/orders/mine?address=${SELLER}`)
      .expect(200);
    expect(mine.body.length).toBeGreaterThan(0);
    for (const order of mine.body) {
      expect(order).toHaveProperty("amount");
      expect(order).toHaveProperty("minPrice");
    }

    const others = await request(app).get(`/api/orders/mine?address=${OTHER}`).expect(200);
    expect(others.body).toEqual([]);
  });

  it("rejects a malformed address", async () => {
    await request(app).get("/api/orders/mine?address=nope").expect(400);
  });
});

describe("matching + settlement simulation", () => {
  it("moves a fresh order from pending -> matched -> settled and records a settlement", async () => {
    const created = await request(app)
      .post("/api/orders")
      .send({ asset: "FXRP", amount: "300", minPrice: "0.50", sellerAddress: SELLER })
      .expect(201);
    expect(created.body.status).toBe("pending");

    await runMatchingSweep(); // pending -> matched (OTC_MATCH_DELAY_MS=0 in tests)

    let mine = await request(app).get(`/api/orders/mine?address=${SELLER}`).expect(200);
    const matchedOrder = mine.body.find((o: { id: string }) => o.id === created.body.id);
    expect(matchedOrder.status).toBe("matched");
    expect(matchedOrder.buyerAddress).toEqual(expect.any(String));
    expect(Number(matchedOrder.matchedPrice)).toBeGreaterThanOrEqual(0.5);

    await runMatchingSweep(); // matched -> settled (OTC_SETTLE_DELAY_MS=0 in tests)

    mine = await request(app).get(`/api/orders/mine?address=${SELLER}`).expect(200);
    const settledOrder = mine.body.find((o: { id: string }) => o.id === created.body.id);
    expect(settledOrder.status).toBe("settled");

    const settlements = await request(app).get("/api/settlements").expect(200);
    expect(settlements.body.length).toBeGreaterThan(0);
    const settlement = settlements.body[0];
    expect(settlement.hash).toMatch(/^0x[0-9a-f]+$/);
    expect(settlement).not.toHaveProperty("sellerAddress");
    expect(settlement).not.toHaveProperty("buyerAddress");
  });
});

describe("GET /api/stats", () => {
  it("returns priceUsd, volume24hUsd, and tradesSettled", async () => {
    const res = await request(app).get("/api/stats").expect(200);
    expect(typeof res.body.priceUsd).toBe("number");
    expect(typeof res.body.volume24hUsd).toBe("number");
    expect(typeof res.body.tradesSettled).toBe("number");
  });
});
